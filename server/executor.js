const axios = require('axios');

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

const MAP_OUTPUT = [];

function exec_wrapper(_fun, params, is_arr=false) {
    const output = [];
    if (is_arr) {
        params.forEach(item => {
            const key = item[0];
            const value = item[1];
            _fun(key, value, bind_emit(output));
        });
    } else {
        _fun(...params, bind_emit(output));
    }
    return output;
}

function group_by(items, key) {
    return items.reduce((result, x) => {
        result[x[key]] = (result[x[key]] || []);
        result[x[key]].push(x);
        return result;
    }, {});
}

function parse_usercode(usercode) {
    const obj = JSON.parse(JSON.stringify(usercode));
    ['_map', '_reduce', '_combinator', '_partioning', '_comparator'].forEach(name => {
        if (obj[name])
            obj[name] = new Function(`return ${obj[name]}`)();
    });
    return obj;
}

async function map_executor(filename, job_name) {
    const usercode = parse_usercode((await axios.get(`http://localhost:8080/mr/${job_name}/code`)).data);
    const filedata = (await axios.get(`http://localhost:8080/data/${filename}`)).data;
    const inputreader = usercode['_inputreader'] ?? default_inputreader;
    const comparator = usercode['_comparator'] ?? default_comparator;
    
    // inputreader
    const map_input = exec_wrapper(inputreader, [filename, filedata]);

    // map
    let map_output = exec_wrapper(usercode['_map'], map_input, true);

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
    // const msg = await axios.post(`http://localhost:8080/mr/wc/`)
    MAP_OUTPUT.push(...map_output);
}

async function reduce_executor(key) {
    const usercode = parse_usercode((await axios.get(`http://localhost:8080/mr/wc/code`)).data);
    const filedata = group_by(MAP_OUTPUT, 0);
    const reduce_output = [];
    for (const [key, values] of Object.entries(filedata)) {
        usercode['_reduce'](key, values.map(item => item[1]), bind_emit(reduce_output));
    }

    console.log(reduce_output);
}

const arr = [...new Array(10).keys()].map((idx) => {
    return map_executor(`slice${idx}`, 'wc');
});
(async () => {
    await Promise.all(arr);
    await reduce_executor();
})();
