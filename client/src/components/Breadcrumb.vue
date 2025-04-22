<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
      <span 
        v-if="index === breadcrumbs.length - 1" 
        class="no-redirect">{{ item.title }}</span>
      <a v-else @click.prevent="handleLink(item)">{{ item.title }}</a>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 计算面包屑路径
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]
  
  // 首页始终显示
  const result = [{
    path: '/dashboard',
    title: '首页'
  }]
  
  // 如果不是首页，则添加路由匹配项
  if (first && first.path !== '/dashboard') {
    matched.forEach(item => {
      result.push({
        path: item.path,
        title: item.meta.title
      })
    })
  }
  
  return result
})

// 面包屑导航
const handleLink = (item) => {
  router.push(item.path)
}
</script>

<style scoped>
.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 1.5;
  margin-top: 2px;
}

.no-redirect {
  color: #97a8be;
  cursor: text;
}
</style>