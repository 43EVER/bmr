预计时间 5 天

论文 1 天



## 具体时间安排

| 日期 | 安排                             |
| ---- | -------------------------------- |
| 5.22 | 确定需求，学习内容，关键节点     |
| 5.23 | 完成 GO 的教程，完成 lab1 的开头 |
| 5.24 | 完成 lab1，确定移植的事项        |
| 5.25 | 搭架子                           |
| 5.26 | 完善，论文架子                   |



## 5.22 LOG

#### 需要解决的问题

* 原版的 MapReduce 有什么功能，怎么使用
* MIT 6.824



#### MIT 6.824

分布式系统出现的原因

* 并行化
* 容错
* 物理限制
* 安全性/孤立性

挑战

* concurrency
* partial failure
* performance



性能、容错、一致性，三个点不能全都要，特别是一致性，强一致性的代价极其昂贵，更多是实现弱一致性



##### MapReduce

Google 的计算系统

 

#### 毕设需求

利用 GO 完成 MapReduce，通过 WEB 界面进行封装（上传 Map 和 Reduce 函数，如果有需求，上传 Combinator，hash 等函数，下载或查看运行结果，下载查看运行日志）



#### 学习内容

* 学习 GO
* 学习 lab1 及相关代码



## 5.23 LOG

#### TODO

* [x] 完成 GO Tour
* [x] lab1 开头



## 5.24 LOG

#### TODO

* [x] 看 lab1 源码
* [x] 完成 5 条指导记录
* [x] 想好到底该干什么



#### 到底干什么

基于浏览器的 MapReduce

* 整个系统是 BS 端的应用，S 端不仅作为 WEB服务器，还负责传统 MapReduce 的 Master 端，B 端提供可视化界面，并利用 Worker API 负责传统 MapReduce 的 Worker 端
* B 端需要做的是两件事
  * 接收从服务端来的 task.js，封装好了计算逻辑（Map 或者 Reduce），通信逻辑（状态信息），相应的数据，利用 Worker API 执行
  * 提交任务，参与任务，查看某个任务专属的集群状态



#### 论文指导情况

MapReduce 的主要逻辑

正常完成

加快进度



MapReduce 的优化思路

正常完成

早日确定整体架构



单机顺序式 Demo

正常完成

优化代码，降低内存占用



RPC 模块

正常完成

优化 Log 输出，添加异常处理相关模块



K-V数据库模块

只完成代码部分，没有进行完整测试

加快进度，搭建集群时，尽量使用自动化工具，方便日后调试



单机多进程模拟集群的小规模测试

正常完成

添加监控模块，方便之后做可视化监控，使得更加方便的得知集群运行状态



多容器模拟集群的小规模测试

正常完成

性能方面还需要提高



规范接口

正常完成

加快进度



WEB 可视化

正常完成

添加代码编辑页面



论文前五章完成情况

只完成三章

加快进度，添加性能测试相关内容



## 5.25 LOG

#### TODO

* [x] 完成整体框架图
* [x] 主要逻辑
* [x] 错误处理
* [x] 规范接口
* [ ] 架子



#### 需要解决的问题

* 函数和数据打包或分开传
  * 打包（方便用户实现各种插件）
  * 伪问题，需要处理的文件size肯定远大于函数
* 怎么检测 worker 还活着
  * ws 提供了 ping 的方式
* 用户需要提供什么函数
  * map reduce, [combinator], [partitioning]
  * 待定，但想着插件化，可定制程度高一点
    * 为什么需要插件化
      * 没想到理由
* 网络传输浪费太多 CPU 周期
  * worker 数量一定，但可以做个池
  * 其实是个伪问题，原版 MapReduce 就是基于文件的，而不是基于记录
* master 内存拉跨
  * master 的工作其实只是分发数据，排序
  * 排序可以利用外排序，64 MB 一个分块

* 各个函数的签名
* map(in_key, in_value) -> (out_key, intermedia_value)
* reduce(out_key, list(intermedia_value)) -> list(out_value)
* combinator(key, [value]) -> (key, value)
* partioning(out_key) -> out_key2



## 6.3 LOG

### DEMO

需求

* 基本的结构的定义
  * State
    * job
      * name: String
      * id: String
      * functions: {}
        * map
        * reduce
        * combinator
        * partioning
      * file_status: {}
        * (filename, filetype(input_slice, map_output, reduce_input, output_file))
      * status(Created, Runnming_Map, Running_Reduce, Finished) : String
    * created_time: Time
    * updated_time: Time



#### 如何拼装出一个 Worker.js

用户的代码

```js
const _map = (key, value) => {
    return [key, value];
}

const _combinator(key, values) => {
    return [key, value];
}

const _partioning(key) => {
    return key;
}

const _reduce(key, values) => {
    return [key, value];
}
```



Map 粘合剂代码（server）

```js
const map_executor = (data, _fn_map) => {
    return Object.values(data).map((obj) => {
        return _fn_map(obj[0], obj[1]);
    });
};

const combinator_executor = (data, _fn_combinator) => {
    const obj = conver_arr(data                                       );
    return Object.keys(obj).map(inter_key => {
        const inter_values = obj[inter_key];
        return _fn_combinator(inter_key, inter_values);
    });
};

const partioning_executor = (data, _fn_partioning) => {
    return Object.values(data).map(item => [_fn_partioning(item[0]), item[1]]);
};


```



```json

wx.request({
      url : "http://180.76.226.207:8080/feedback",
      method: "POST",
      data: JSON.stringify(postObj),
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data);
      },
    })
```

