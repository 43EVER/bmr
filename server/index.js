const express       = require('express');
const uuid          = require('uuid').v4;
const fs            = require('fs');
const {
    TASK_TYPES,
    TASK_STATUS_TYPES,
}                   = require('./util/enum');

const { 
    job_status
}                   = require('./status/index.js');


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(require('cors')());

app.use('/mr', require('./router/job')({ job_status }));
app.use('/mr', require('./router/task')({ job_status }));

app.listen(8080, () => {
    console.log(`http://localhost:8080`);
});
