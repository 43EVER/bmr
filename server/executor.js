const axios = require('axios');
const {
    TASK_TYPES,
    TASK_STATUS_TYPES
}           = require('./enum');

function bind_emit(arr) {
    return (key, value) => {
        arr.push([key, value]);
    }
}

const default_inputreader = (key, value, _emit) => {
    value.split('\n').forEach((word, line_number) => {
        if (word == '') return;
        _emit(line_number, word);
    });
}

const default_comparator = (key1, key2) => {
    if (key1 < key2) return -1;
    else if (key1 === key2) return 0;
    return 1;
}

function group_by(items, key) {
    return items.reduce((result, x) => {
        result[x[key]] = (result[x[key]] || []);
        result[x[key]].push(x);
        return result;
    }, {});
}

function exec_wrapper(_fun, params, is_arr=false, counter) {
    const output = [];
    if (is_arr) {
        params.forEach(item => {
            const key = item[0];
            const value = item[1];
            try {
                _fun(key, value, bind_emit(output));
                counter['finish_record'] = counter['finish_record'] ?? 0;
                counter['finish_record'] += 1;
            } catch (ex) {
                counter['failed_record'] = counter['failed_record'] ?? 0;
                counter['failed_record'] += 1;
            }
        });
    } else {
        _fun(...params, bind_emit(output));
    }
    return output;
}

function parse_usercode(usercode) {
    const obj = JSON.parse(JSON.stringify(usercode));
    ['_map', '_reduce', '_combinator', '_partioning', '_comparator', '_inputreader', '_outputreader'].forEach(name => {
        if (obj[name])
            obj[name] = new Function(`return ${obj[name]}`)();
    });
    return obj;
}

async function map_executor(usercode, map_task) {
    const [filename, filedata] = map_task['input'];
    
    const inputreader = usercode['_inputreader'] ?? default_inputreader;
    const comparator = usercode['_comparator'] ?? default_comparator;
    
    // inputreader
    const map_input = exec_wrapper(inputreader, [filename, filedata]);

    // map
    const counter = {};
    let map_output = exec_wrapper(usercode['_map'], map_input, true, counter);

    // partion
    if (usercode['_partioning']) {
        const partion = usercode['_partioning'];
        map_output = map_output.map(item => {
            return [partion(item[0]), item[1]];
        });
    }

    // combinator
    if (usercode['_combinator']) {
        const combinator_output = [];
        const combinator = usercode['_combinator'];
        for (let [key, values] of Object.entries(group_by(map_output, 0))) {
            combinator(key, values, bind_emit(combinator_output));
        }
        map_output = combinator_output;
    }

    map_output = map_output.sort((a, b) => comparator(a[0], b[0]));

    // upload map result
    const job_uid = map_task['job_uid'];
    const task_uid = map_task['task_uid'];
    const msg = await axios.post(`http://localhost:8080/mr/job/${job_uid}/finish_task/${task_uid}`, {
        counter,
        output: [`${filename}`, map_output]        
    }, { 
        maxContentLength: Infinity,
        maxBodyLength: Infinity
     });

    // console.log(msg.data);
    // console.log(map_output);
}

async function reduce_executor(usercode, task) {
    const reduce_output = [];
    const [key, values] = task['input'];
    usercode['_reduce'](key, values.map(item => item[1]), bind_emit(reduce_output));

    // post to server
    const job_uid = task['job_uid'];
    const task_uid = task['task_uid'];
    const msg = await axios.post(`http://localhost:8080/mr/job/${job_uid}/finish_task/${task_uid}`, {
        output: reduce_output        
    }, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity
     });

    // console.log(msg.data);
    // console.log(reduce_output);    
}

async function main() {
    const usercode = parse_usercode((await axios.get(`http://localhost:8080/mr/job/53ca9264-9722-4210-88d7-faac1ad0b9c9/code`)).data);
    const task = (await axios.get(`http://localhost:8080/mr/job/53ca9264-9722-4210-88d7-faac1ad0b9c9/task`)).data;
    // console.log(Object.keys(usercode));
    // console.log(Object.keys(map_task));
    // console.log(task['task_type']);
    if (task['task_type'] === TASK_TYPES.MAP)
        map_executor(usercode, task);
    else if (task['task_type'] === TASK_TYPES.REDUCE)
        reduce_executor(usercode, task);
    
    const job = (await axios.get(`http://localhost:8080/mr/job/53ca9264-9722-4210-88d7-faac1ad0b9c9`)).data;
    // console.log(job);
    if (job['job_status'] !== TASK_STATUS_TYPES.FINISH) {
        setTimeout(main, 1000);
    } else {
        console.log(job['result'])
    }
}

main();
