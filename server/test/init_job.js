const uuid = require('uuid').v4;
const axios = require('axios');

const wc = require('./wc').wc
const files = [...new Array(3).keys()].map(item => `slice${item}`);
const job = {
    "job_uid": uuid(),
    "job_name": "word_count",
    "code": wc,
    "input_files": files
};

(async () => {
    await axios.post('http://localhost:8080/mr/job', job);
})();