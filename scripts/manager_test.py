# test how to use Manager from multiprocessing

from multiprocessing import Pool, Manager

manager = Manager()
data_arr = [1,2,3,4,5,6,7,8,9,10]

global_arr = manager.list()


def add_one(val):
    val_plus_one = val + 1
    global_arr.append(val_plus_one)
    print(val_plus_one)

p = Pool(10)
records = p.map(add_one, data_arr)
p.terminate()
p.join()

print global_arr
