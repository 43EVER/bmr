<template>
  <div id="task_detail">
    <h2>{{job['job_name']}}</h2>
    <div class="item">已完成记录数：{{job['finish_record']}}</div>
    <div class="item">失败记录数：{{job['failed_record']}}</div>
    <div style="margin-top: 1rem;"><el-button @click="handle_worker" type="primary" :disabled="!canUse">{{text}}</el-button></div>
    <div class="detail-container">
        <div style="width: 100%">
            <el-table
            :data="job['tasks']"
            style="width: 100%">
            <el-table-column
                prop="task_uid"
                label="ID"
                width="380">
            </el-table-column>
            <el-table-column
                prop="status"
                label="状态"
                width="180">
            </el-table-column>
            <el-table-column
                prop="task_type"
                label="类型">
            </el-table-column>
            </el-table>
        </div>
    </div>
    <h2 style="margin-top: 1rem;">Result</h2>
    <div v-if="job['job_status'] === 'FINISH'">
        <el-table :data="trans(job['result'])">
            <el-table-column
                prop="key"
                label="KEY">
            </el-table-column>
            <el-table-column
                prop="value"
                label="VALUE"></el-table-column>
        </el-table>
    </div>
  </div>
</template>

<script>
import { spawn, Thread, Worker } from "threads"

export default {
    props: ['id'],
    data() {
        return {
            job: {},
            text: '作为 Worker 加入',
            canUse: true
        }
    },
    async created() {
        await this.fetch();
        setInterval(this.fetch, 2000);
    },
    methods: {
        async fetch() {
            const rst = await this.$http.get(`/mr/job/${this.id}`);
            this.job = rst.data;
        },
        async handle_worker() {
            this.text = "已加入"
            this.canUse = false;
            const run = await spawn(new Worker("../workers/run"))
            console.log(await run(this.id));
        },
        trans(result_obj) {
            const arr = [];
            for (const [key, value] of Object.entries(result_obj)) {
                arr.push({
                    key,
                    value
                });
            }
            console.log(arr);
            return arr;
        }
    }
}
</script>

<style>
#task_detail {
    width: 100%;
    height: 100%;
}

.detail-container {
    margin-top: 1rem;
    display: flex;
    align-items: center;
}

.item {
    margin-top: 1rem;
    color: grey;
    
}
</style>