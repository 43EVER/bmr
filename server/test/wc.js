exports.wc = {
    '_map': ((key, value, _emit) => {
        const arr = value.split(' ');
        Object.values(arr).forEach(item => {
            _emit(item, 1);
        });
    }).toString(),
    
    '_combinator': ((key, values, _emit) => {
        _emit(key, values.length);
    }).toString(),
    
    '_reduce': ((key, values, _emit) => {
        _emit(key, values.reduce((a, b) => Number(a) + Number(b), 0));
    }).toString(),

    '_comparator': ((key1, key2) => {
        if (key1 < key2) return -1;
        else if (key1 === key2) return 0;
        return 1;
    }).toString(),

    '_partioning': ((key) => {
        return 'test';
    }).toString()
};

