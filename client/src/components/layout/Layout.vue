<template>
  <div class="layout-container" :class="{'dark-theme': isDarkTheme}">
    <el-container class="app-wrapper">
      <!-- 侧边栏 -->
      <sidebar :is-collapse="isCollapse" />
      
      <!-- 主内容区 -->
      <el-container class="main-container" :style="{marginLeft: isCollapse ? '64px' : '220px'}">
        <!-- 头部导航 -->
        <app-header 
          :is-collapse="isCollapse" 
          :is-dark-theme="isDarkTheme"
          @toggle-sidebar="toggleSidebar"
          @toggle-theme="toggleTheme"
        />
        
        <!-- 标签导航 -->
        <tags-view ref="tagsViewRef" />
        
        <!-- 内容主体 -->
        <el-main>
          <div class="main-content">
            <router-view v-slot="{ Component }">
              <transition name="fade-transform" mode="out-in">
                <keep-alive :include="cachedViews">
                  <component :is="Component" />
                </keep-alive>
              </transition>
            </router-view>
          </div>
        </el-main>
        
        <!-- 页脚 -->
        <el-footer height="40px" class="app-footer">
          <div class="copyright">
            Copyright © 2023-{{ new Date().getFullYear() }} 后台管理系统 版权所有
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Sidebar from './Sidebar.vue'
import AppHeader from './Header.vue'
import TagsView from './TagsView.vue'

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebarStatus', isCollapse.value ? '1' : '0')
}

// 标签视图ref
const tagsViewRef = ref(null)

// 缓存的视图
const cachedViews = computed(() => {
  if (tagsViewRef.value) {
    return tagsViewRef.value.cachedViews
  }
  return []
})

// 初始化
onMounted(() => {
  isCollapse.value = localStorage.getItem('sidebarStatus') === '1'
  
  // 初始化主题
  isDarkTheme.value = localStorage.getItem('theme') === 'dark'
  
  // 应用主题样式
  if (isDarkTheme.value) {
    document.body.classList.add('dark-theme')
  }
})

// 主题切换
const isDarkTheme = ref(false)
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  
  // 应用主题样式
  if (isDarkTheme.value) {
    document.body.classList.add('dark-theme')
  } else {
    document.body.classList.remove('dark-theme')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  --header-bg-color: #ffffff;
  --sidebar-bg-color: #304156;
  --menu-text-color: #bfcbd9;
  --menu-active-color: #409EFF;
  --tags-bg-color: #f0f2f5;
  --main-bg-color: #f5f7fa;
  --text-color: #303133;
  --border-color: #e4e7ed;
}

/* 暗黑主题 */
.layout-container.dark-theme {
  --header-bg-color: #1f2d3d;
  --sidebar-bg-color: #263445;
  --menu-text-color: #a6adb9;
  --menu-active-color: #409EFF;
  --tags-bg-color: #1f2d3d;
  --main-bg-color: #1e1e1e;
  --text-color: #e0e0e0;
  --border-color: #434343;
}

.app-wrapper {
  height: 100%;
}

.main-container {
  transition: margin-left 0.28s;
  background-color: var(--main-bg-color);
  height: 100%;
  position: relative;
}

.main-content {
  padding: 15px;
  height: 100%;
  box-sizing: border-box;
  color: var(--text-color);
}

.app-footer {
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-size: 12px;
  border-top: 1px solid var(--border-color);
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>