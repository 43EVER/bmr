<template>
  <div id="task">
    <el-card v-for="(job, idx) in jobs" :key="idx" class="task-item" shadow="never">
        <div slot="header">
            <span>{{job['job_name']}}</span>
            <el-tag style="float: right;" :type="get_type(job['job_status'])">{{job['job_status']}}</el-tag>
        </div>
        <div class="item-container">
            <div style="width: 50%">
                <div v-for="(value, key) in get_classification(job['tasks'])" :key="key" class="text-item">
                    <el-tag class="card-item" :type="get_running_type(key)">{{key}}</el-tag> {{value}}
                </div>
            </div>
            <div>
                <el-button type="primary" @click="handle_detail(job['job_uid'])">查看详情</el-button>
            </div>
        </div>
    </el-card>
  </div>
</template>

<script>
export default {
    data() {
        return {
            jobs: []
        }
    },
    async created() {
        await this.fetch();
        setInterval(this.fetch, 1000);
    },
    methods: {
        async fetch() {
            const rst = await this.$http.get('/mr/job');
            this.jobs = rst.data;
        },

        handle_detail(job_uid) {
            this.$router.push(`/task/${job_uid}`);
        },

        get_type(job_status) {
            if (job_status === 'MAP') {
                return ''
            } else if (job_status === 'REDUCE') {
                return 'success'
            } else {
                return 'info'
            }
        },

        get_running_type(status) {
            if (status === 'PREPARE') {
                return ''
            } else if (status === 'RUNNING') {
                return 'info'
            } else if (status === 'FINISH') {
                return 'success'
            } else {
                return 'danger'
            }
        },

        get_classification(tasks_status) {
            return {
                'PREPARE': tasks_status.filter(item => item === 'PREPARE').length,
                'RUNNING': tasks_status.filter(item => item === 'RUNNING').length,
                'FINISH': tasks_status.filter(item => item === 'FINISH').length,
                'FAIL': tasks_status.filter(item => item === 'FAIL').length,
            }
        }
    }
}
</script>

<style>

#task {
    display: flex;
    justify-content: center;
    align-items: center;
}

.task-item {
    width: 30rem;
}

.card-item {
    margin-top: 0.5rem;
    width: 5rem;
}

.item-container {
    display: flex;
    align-items: center;
}

</style>