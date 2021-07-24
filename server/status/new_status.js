let checkers = [];

checkers.push({
    check_fun: () => { console.log("every 10 secs")},
    interval: 10000
});

checkers.push({
    check_fun: () => { console.log("every 1 secs")},
    interval: 1000
});

checkers.push({
    check_fun: () => { console.log("every 2 secs")},
    interval: 2000
});

function init() {
    checkers.forEach(checker => {
        setInterval(checker.check_fun, checker.interval);
    });
}

init();