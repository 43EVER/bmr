wc = {}

for i in range(10):
    with open('./dataset/slice{}'.format(i)) as f:
        for line in f:
            for word in line[0:-1].split(' '):
                wc[word] = wc.get(word, 0) + 1

print(wc)