const TASK_TYPES = {
    MAP     : "MAP",
    REDUCE  : "REDUCE",
    FINISH  : "FINISH",
};

const TASK_STATUS_TYPES = {
    PREPARE : "PREPARE",
    RUNNING : "RUNNING",
    FINISH  : "FINISH",
    FAIL    : "FAIL"
}

module.exports = { TASK_TYPES, TASK_STATUS_TYPES }