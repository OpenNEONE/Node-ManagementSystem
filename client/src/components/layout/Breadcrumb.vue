<template>
  <el-breadcrumb separator="/" class="breadcrumb">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 生成面包屑导航数据
const breadcrumbs = computed(() => {
  // 初始面包屑总是包含首页
  const result = [{
    title: '首页',
    path: '/dashboard'
  }]
  
  // 如果当前路由与首页相同，则不需要添加其他项
  if (route.path === '/dashboard') {
    return result
  }
  
  // 分割路由路径，构建面包屑层级
  const pathParts = route.path.split('/').filter(Boolean)
  
  // 根据路径构建面包屑导航项
  let currentPath = ''
  
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`
    
    // 使用路由元信息或推断的标题
    let title = route.matched[index]?.meta?.title
    
    // 如果没有找到匹配的路由元信息标题，则将路径部分格式化为可读标题
    if (!title) {
      title = part.charAt(0).toUpperCase() + part.slice(1)
    }
    
    // 只添加非重复的面包屑项
    if (!result.some(item => item.path === currentPath)) {
      result.push({
        title,
        path: currentPath
      })
    }
  })
  
  return result
})
</script>

<style scoped>
.breadcrumb {
  margin: 0 15px;
  display: inline-block;
}
</style>