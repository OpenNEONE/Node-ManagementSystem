<template>
  <div class="not-found-container">
    <div class="content">
      <h1>404</h1>
      <h2>页面未找到</h2>
      <p>抱歉，您访问的页面不存在或已被移除</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.content {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #409EFF;
}

h2 {
  font-size: 2rem;
  margin: 0.5rem 0;
}

p {
  color: #606266;
  margin-bottom: 2rem;
}
</style>