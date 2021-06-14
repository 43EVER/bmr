function group_by(items, key) {
    return items.reduce((result, x) => ({
        ...result,
        [x[key]]: [...(result[x[key]] ||[]), x]
    }), {});
}

console.log(group_by([
    ['apple', 9],
    ['apple', 8],
    ['apple', 7],
    ['apple', 6],
    ['apple', 5],
    ['bpple', 4],
    ['bpple', 3],
    ['bpple', 2],
    ['bpple', 1],
    ['bpple', 0],
], 0));