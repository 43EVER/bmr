const express   = require('express');
const uuid      = require('uuid').v4;
const {
    TASK_TYPES,
    TASK_STATUS_TYPES
}               = require('../enum');    

module.exports = function(context) {
    const router = express.Router();
    router.get('/job', async (req, res) => {
        const jobs = [];
        for (const [job_uid, job] of Object.entries(context['job_status'])) {
            if (typeof job === 'function') continue;
            jobs.push({
                job_uid,
                'job_name': job['job_name'],
                'job_status': job['job_status'],
                'tasks': job['tasks'].map(task => task['status'])
            });
        }
        res.send(jobs);
    });
    
    router.get('/job/:job_uid', async (req, res) => {
        const job_uid = req.params['job_uid'];
        const job = context['job_status'][job_uid] ?? {};
        res.send(job);
    });
    
    router.post('/job', async (req, res) => {
        const tasks = req.body['input_files'].map(filename => ({
            "task_uid"  : uuid(),
            "task_type" : TASK_TYPES.MAP,
            "input"     : filename,
            "status"    : TASK_STATUS_TYPES.PREPARE,
            "fail_cnt"  : 0,
            "start_time": 0,
            "cost_time" : 0,
            "finish_record": 0,
            "failed_record": 0
        }));
        const job = {
            ...req.body,
            tasks,
            "job_status": TASK_TYPES.MAP
        };
    
        context['job_status'].add_job(job);
        
        console.log(`[add job successful] ${JSON.stringify(job)}`);
    
        res.send(job);
    });

    return router;
}