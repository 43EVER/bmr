const fs            = require('fs');
const {
    TASK_STATUS_TYPES, 
    TASK_TYPES
}                   = require('../util/enum')
const server_config = require('../conf/config');
const uuid          = require('uuid').v4;

const job_status = {
    // recover from checkpoint
    ...JSON.parse(fs.readFileSync(`${__dirname}/job_status.json`, { encoding: 'utf8' })),
    
    get_job(job_uid) {
        return this[job_uid] ?? {};
    },

    // add a job
    add_job(job) {
        this[job['job_uid']] = job;
    },

    get_task(job_uid, task_uid) {
        const job = this.get_job(job_uid);
        if (job === {}) {
            console.log(`[get task] failed, no such job: ${job_uid}`);
            return {};
        }

        const task = job['tasks'].find(item => item['task_uid'] === task_uid);
        if (!task) {
            console.log(`[get task] failed, no such task: ${task_uid}`);
            return {};
        }

        return task;
    },

    // get a task of job_uid, and set the statu of this task to RUNNING
    // key1: status(PREPARE > RUNNING)
    // key2: starttime(small > big)
    // this function will pick a task which status is PREPARE or the earliest to start
    apply_a_task(job_uid) {
        const job = this[job_uid];
        if (!job) {
            console.log(`[apply a task of ${job_uid}] failed, no such job_uid`);
            return {};
        }

        let tasks = job['tasks'].filter(task => {
            return task['status'] !== TASK_STATUS_TYPES.FAIL
        }).filter(task => {
            return task['status'] !== TASK_STATUS_TYPES.FINISH
        });
        tasks = tasks.sort((a, b) => {
            if (a['status'] !== b['status']) {
                if (a['status'] === TASK_STATUS_TYPES.PREPARE) return 1;
                else return -1;
            }
            if (a['start_time'] !== b['start_time']) {
                if (a['start_time'] < b['start_time']) return 1;
                else return -1;
            }
            return 0;
        }).reverse();

        if (tasks.length === 0) {
            console.log(`[apply a task of ${job_uid}] failed, doesn't have available task`);
            return {};
        }

        tasks[0]['status'] = TASK_STATUS_TYPES.RUNNING;
        tasks[0]['start_time'] = Date.now();
        return tasks[0];
    },

    // fail a task, if the fail_cnt > max_failed, set this task to FAIL
    fail_task(job_uid, task_uid) {
        if (!this[job_uid]) {
            console.log(`[set task failed of the task ${task_uid} of job ${job_uid}] failed, no such job_uid`);
            return false;
        }

        const task = this[job_uid]['tasks'].find(item => item['task_uid'] === task_uid);
        if (!task) {
            console.log(`[set task failed of the task ${task_uid} of job ${job_uid}] failed, no such task_uid`)
            return false;
        }
        
        task['fail_cnt'] += 1;
        if (task['fail_cnt'] > server_config['max_failed']) {
            console.log(`[task failed] job: ${job_uid}, task: ${task_uid}`);
            task['status'] = TASK_STATUS_TYPES.FAIL;
        }
        else {
            task['status'] = TASK_STATUS_TYPES.PREPARE;
        }
        
        return true;
    },

    // finish a task
    finish_task(job_uid, task_uid, finish_record, failed_record) {
        if (!this[job_uid]) {
            console.log(`[set task finish of the task ${task_uid} of job ${job_uid}] failed, no such job_uid`);
            return false;
        }

        const task = this[job_uid]['tasks'].find(item => item['task_uid'] === task_uid);
        if (!task) {
            console.log(`[set task finish of the task ${task_uid} of job ${job_uid}] failed, no such task_uid`)
            return false;
        }
        
        const job = this.get_job(job_uid);
        job['finish_record'] = job['finish_record'] ?? 0;
        job['failed_record'] = job['failed_record'] ?? 0;
        job['finish_record'] += finish_record;
        job['failed_record'] += failed_record;

        task['status'] = TASK_STATUS_TYPES.FINISH;
        task['cost_time'] = Date.now() - task['start_time'];
        task['finish_record'] = finish_record;
        task['failed_record'] = failed_record;
        return true;
    }
};

// check the status of running tasks, if [running time] > [server_config.timeout]，fail this task 
setInterval(() => {
    for (const [job_uid, job] of Object.entries(job_status)) {
        if (typeof job === 'function') continue;
        if (job['status'] === TASK_STATUS_TYPES.FINISH) continue;
        // 检测一个 job 中是否有失败的 task
        for (const task of job['tasks'].filter(task => task['status'] === TASK_STATUS_TYPES.RUNNING)) {
            const task_uid = task['task_uid'];
            const cost_time = Date.now() - task['start_time'];
            if (cost_time > server_config.timeout) {
                console.log(`[detect task running failed] job: ${job_uid}, task: ${task_uid}`)
                job_status.fail_task(job_uid, task_uid);
            }
        }
    }
}, server_config['timeout']);


function group_by(items, key) {
    return items.reduce((result, x) => {
        result[x[key]] = (result[x[key]] || []);
        result[x[key]].push(x);
        return result;
    }, {});
}

// gen reduce tasks
async function gen_reduce_tasks() {
    for (const [job_uid, job] of Object.entries(job_status)) {
        if (typeof job === 'function') continue;
        if (job['job_status'] !== TASK_TYPES.MAP) continue;
        const map_tasks = job['tasks'].filter(task => task['task_type'] === TASK_TYPES.MAP);
        const is_end = map_tasks.find(task => (task['status'] === TASK_STATUS_TYPES.PREPARE || task['status'] === TASK_STATUS_TYPES.RUNNING)) ? false : true;
        if (!is_end) continue;

        const finished_tasks = map_tasks.filter(task => task['status'] === TASK_STATUS_TYPES.FINISH);
        if (finished_tasks === []) {
            console.log(`[gen_reduce_tasks] failed, all tasks of job:${job_uid} failed`);
            continue;
        }
        const arr = [];
        const filenames = finished_tasks.map(task => task['input']).map(filename => `${job_uid}_${filename}_mapoutput`);
        const read_promises = filenames.map(filename => fs.promises.readFile(`./output/${filename}`, { encoding: 'utf-8' }));
        for (const read_promise of read_promises) {
            arr.push(...JSON.parse(await read_promise));
        }
        
        const obj = group_by(arr, 0);
        const tasks = [];
        await fs.promises.writeFile(`./dataset/${job_uid}_reduceinput`, JSON.stringify(obj), { encoding: 'utf-8' });
        for (const [key, values] of Object.entries(obj)) {
            tasks.push({
                'task_uid': uuid(),
                'task_type': TASK_TYPES.REDUCE,
                'input': [key, values],
                'status': TASK_STATUS_TYPES.PREPARE,
                'fail_cnt': 0,
                'start_time': 0,
                'cost_time': 0,
                'finish_record': 0,
                'failed_record:': 0
            });
        }
        job['job_status'] = TASK_TYPES.REDUCE;
        job['tasks'] = tasks;
    }
}

setInterval(gen_reduce_tasks, 5000);

setInterval(() => {
    for (const [job_uid, job] of Object.entries(job_status)) {
        if (typeof job === 'function') continue;
        if (job['job_status'] === TASK_STATUS_TYPES.FINISH) continue;
        if (job['job_status'] === TASK_TYPES.MAP) continue;
        const tasks = job['tasks'].filter(task => (task['status'] === TASK_STATUS_TYPES.RUNNING) || (task['status'] === TASK_STATUS_TYPES.PREPARE));
        if (tasks.length === 0) {
            job['job_status'] = TASK_STATUS_TYPES.FINISH;
            console.log(job['result']);
        } else {
            console.log(`[find unfinish job] ${job_uid}, ${job['job_name']}]`);
        }
    }
}, 5000);

// checkpoint
setInterval(() => {
    
}, 10000);


module.exports = { job_status };
