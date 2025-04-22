<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-view-wrapper">
      <div class="tags-view-item" 
           v-for="tag in visitedViews" 
           :key="tag.path"
           :class="{'active-tag': isActiveTag(tag.path)}"
           @click="navigateTo(tag.path)">
        {{ tag.title }}
        <el-icon class="close-icon" @click.stop="closeSelectedTag(tag)" v-if="visitedViews.length > 1"><Close /></el-icon>
      </div>
    </el-scrollbar>
    <div class="tags-view-actions">
      <el-dropdown trigger="click" @command="handleTagsCommand">
        <el-icon><ArrowDown /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
            <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Close } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 标签视图管理
const visitedViews = ref([])
const cachedViews = ref([])

// 导出缓存视图供父组件使用
defineExpose({
  cachedViews
})

// 添加访问标签
const addVisitedView = (view) => {
  const { path, meta, name } = view
  
  if (visitedViews.value.some(v => v.path === path)) return
  
  visitedViews.value.push({
    path,
    title: meta.title || '未命名',
    name
  })
  
  if (name && meta.keepAlive) {
    cachedViews.value.push(name)
  }
}

// 关闭选中标签
const closeSelectedTag = (view) => {
  const index = visitedViews.value.findIndex(v => v.path === view.path)
  if (index !== -1) {
    visitedViews.value.splice(index, 1)
  }
  
  if (view.name) {
    const cacheIndex = cachedViews.value.indexOf(view.name)
    if (cacheIndex !== -1) {
      cachedViews.value.splice(cacheIndex, 1)
    }
  }
  
  // 如果关闭的是当前活动标签，则导航到剩余标签中的第一个
  if (isActiveTag(view.path) && visitedViews.value.length) {
    router.push(visitedViews.value[index - 1 >= 0 ? index - 1 : 0].path)
  }
}

// 是否为活动标签
const isActiveTag = (path) => {
  return path === route.path
}

// 导航函数
const navigateTo = (path) => {
  router.push(path)
}

// 标签操作命令处理
const handleTagsCommand = (command) => {
  if (command === 'closeOthers') {
    // 关闭其他标签，保留当前活动标签
    const activeView = visitedViews.value.find(v => isActiveTag(v.path))
    if (activeView) {
      visitedViews.value = [activeView]
      cachedViews.value = activeView.name ? [activeView.name] : []
    }
  } else if (command === 'closeAll') {
    // 关闭所有标签，导航到首页
    visitedViews.value = []
    cachedViews.value = []
    router.push('/dashboard')
  }
}

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  () => {
    addVisitedView(route)
  },
  { immediate: true }
)
</script>

<style scoped>
/* 标签导航样式 */
.tags-view-container {
  height: 34px;
  width: 100%;
  background: var(--tags-bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
}

.tags-view-wrapper {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  padding: 0 10px;
  display: flex;
  align-items: center;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  margin-right: 5px;
  font-size: 12px;
  background: var(--header-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
}

.close-icon {
  margin-left: 5px;
  font-size: 12px;
}

.active-tag {
  background-color: var(--menu-active-color);
  color: #fff;
  border-color: var(--menu-active-color);
}

.tags-view-actions {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  border-left: 1px solid var(--border-color);
}
</style>