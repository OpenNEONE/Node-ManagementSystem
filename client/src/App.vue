<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  // 页面加载时检查用户登录状态
  await userStore.checkAuth()
})
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, sans-serif;
}

.app-container {
  height: 100vh;
}
</style>