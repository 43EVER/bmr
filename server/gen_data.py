import random

def gen_line():
    line_len = random.randint(5, 100)
    words = ["a", "word", "of", "a", "spoken", "language", "can", "be", "defined", "as", "the", "smallest", "sequence", "of", "phonemes", "that", "can", "be", "uttered", "in", "isolation", "with", "objective", "or", "practical", "meaning"]
    return ' '.join(random.choices(words, k=line_len))

for i in range(10):
    with open("./dataset/slice{}".format(i), 'w') as f:
        f.writelines([gen_line() + '\n' for _ in range(10000)])

print('finish')