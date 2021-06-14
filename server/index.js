const express =require('express');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/data', express.static('./dataset'));

app.get('/mr/:name/code', async (req, res) => {
    const name = req.params['name'];
    res.send(require('./wc').wc);
});

app.get('/mr/:name/map_input', async (req, res, next) => {
    const name = req.params['name'];
    for (const [filename, state] of Object.entries(file_state[name])) {
        if (state === FILESTATES.PREPARE) {
            res.send([filename, state]);
            file_state[name][filename] = FILESTATES.RUNNING;
            next()
        }
    }
    res.sendStatus(404);
});

const FILESTATES = {
    PREPARE:    0,
    RUNNING:    1,
    FINISH:     2,
};

function check_status() {
    for (const job_name in file_state) {
        
    }
}

setInterval(check_status, 1000);

const file_state = {
    'wc': {
        'slice0': FILESTATES.PREPARE,
        'slice1': FILESTATES.PREPARE,
        'slice2': FILESTATES.PREPARE,
        'slice3': FILESTATES.PREPARE,
        'slice4': FILESTATES.PREPARE,
        'slice5': FILESTATES.PREPARE,
        'slice6': FILESTATES.PREPARE,
        'slice7': FILESTATES.PREPARE,
        'slice8': FILESTATES.PREPARE,
        'slice9': FILESTATES.PREPARE,
    }
}

app.post('/mr/:name/map_result', async (req, res) => {
    const name = req.params['name'];
    result[name] = result[name] ?? [];
    result[name].push(...req.body);  
    res.send('success');
});

app.get('/mr/:name/reduce_input', async (req, res) => {
    const name = req.params['name'];
    res.send(file_state[name]);
    console.log('fuck');
});

app.listen(8080, () => {
    console.log(`http://localhost:8080`);
});