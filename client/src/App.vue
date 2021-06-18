<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-menu mode="horizontal" :router="true">
          <el-menu-item index="/task">查看任务</el-menu-item>
          <!-- <el-menu-item index="/create_task">创建任务</el-menu-item> -->
        </el-menu>
      </el-header>
      <el-main>
          <router-view/>
      </el-main> 
    </el-container>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app'
}
</script>

<style>
* {
  padding: 0;
  margin: 0;
}

#app {
  width: 100vw;
  height: 100vh;
}
</style>
