const express       = require('express');
const { 
    TASK_TYPES, 
    TASK_STATUS_TYPES,
}                   = require('../enum');
const fs            = require('fs').promises;

module.exports = function (context) {
    const router = express.Router();

    router.get('/job/:job_uid/code', async (req, res) => {
        const job_uid = req.params.job_uid;
        const job_status = context['job_status'];
        const job = job_status.get_job(job_uid);

        if (job === {}) {
            res.send({});
            console.log(`[get code] failed, no such job_uid: ${job_uid}`);
            return;
        }

        const code = job['code'];
        res.send(code);
    })

    router.get('/job/:job_uid/task', async (req, res) => {
        const job_uid = req.params.job_uid;
        const job_status = context['job_status'];
        const job = job_status.get_job(job_uid);

        if (job === {}) {
            res.send({});
            console.log(`[get task] failed, no such job_uid: ${job_uid}`);
            return;
        }
        
        const task = job_status.apply_a_task(job_uid);
        if (task === {}) {
            res.send({});
            console.log(`[get task] failed, can't get task from job_status`);
            return;
        }
        
        const rst = {
            ...JSON.parse(JSON.stringify(task)),
            job_uid
        };
        if (rst['task_type'] === TASK_TYPES.MAP) {
            const filename = rst['input'];
            const filecontent = await fs.readFile(`./dataset/${filename}`, { encoding: 'utf8' });
            rst['input'] = [filename, filecontent];
        } else {
            // get reduce input
        }
        
        res.send(rst);
    });

    router.post('/job/:job_uid/finish_task/:task_uid', async (req, res) => {
        const job_uid = req.params.job_uid;
        const task_uid = req.params.task_uid;
        const job_status = context['job_status'];
        const job = job_status.get_job(job_uid);
        const task = job_status.get_task(job_uid, task_uid);
        const counter = req.body['counter'] ?? {};
        if (task === {}) {
            console.log(`[finish task] failed, no such job: ${job_uid} or task: ${task_uid}`);
            res.send({});
            return;
        }

        if (task['status'] === TASK_STATUS_TYPES.FINISH) {
            console.log(`[finish task] failed, refinish task: ${task['task_uid']}`);
            res.send({});
            return;
        }

        // persistence
        let rst = { 'status': true };
        try {
            job_status.finish_task(job_uid, task_uid, counter['finish_record'] ?? 0, counter['failed_record'] ?? 0);
            if (task['task_type'] === TASK_TYPES.MAP) {
                const [filename, filedata] = req.body['output'];
                await fs.writeFile(`./output/${job_uid}_${filename}_mapoutput`, JSON.stringify(filedata), { encoding: 'utf-8' });
            } else {
                for (const [key, value] of req.body['output']) {
                    // await fs.writeFile(`./output/${job_uid}_${key}_reduceoutput`, `${JSON.stringify([key, value])}\n`, { encoding: 'utf-8' });
                    const job = context['job_status'].get_job(job_uid);
                    job['result'] = job['result'] ?? {};
                    job['result'][key] = value;
                }
            }
        } catch (ex) {
            console.log(ex);
            rst['status'] = false;        
        }

        res.send(rst);
    });

    return router;
}