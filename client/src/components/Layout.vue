<template>
  <div class="layout-container" :class="{'dark-theme': isDarkTheme}">
    <el-container class="app-wrapper">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-container">
        <div class="logo-container">
          <img src="../assets/logo.svg" alt="Logo" class="logo-image" v-if="!isCollapse" />
          <img src="../assets/logo-mini.svg" alt="Logo" class="logo-image" v-else />
        </div>
        <el-scrollbar>
          <el-menu
            router
            :default-active="activeMenu"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
            :unique-opened="true"
            :collapse="isCollapse"
          >
            <el-menu-item index="/dashboard">
              <el-icon><Monitor /></el-icon>
              <template #title>仪表盘</template>
            </el-menu-item>
            
            <!-- 用户管理 -->
            <el-sub-menu index="/user" v-if="hasPermission('admin')">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="/user/list">用户列表</el-menu-item>
              <el-menu-item index="/user/role">角色管理</el-menu-item>
              <el-menu-item index="/user/permission">权限管理</el-menu-item>
            </el-sub-menu>
            
            <!-- 产品管理 -->
            <el-sub-menu index="/product" v-if="hasPermission('admin')">
              <template #title>
                <el-icon><Goods /></el-icon>
                <span>产品管理</span>
              </template>
              <el-menu-item index="/product/list">产品列表</el-menu-item>
              <el-menu-item index="/product/category">产品分类</el-menu-item>
              <el-menu-item index="/product/inventory">库存管理</el-menu-item>
            </el-sub-menu>
            
            <!-- 订单管理 -->
            <el-sub-menu index="/order">
              <template #title>
                <el-icon><List /></el-icon>
                <span>订单管理</span>
              </template>
              <el-menu-item index="/order/list">订单列表</el-menu-item>
              <el-menu-item index="/order/process">订单处理</el-menu-item>
              <el-menu-item index="/order/statistics">订单统计</el-menu-item>
            </el-sub-menu>
            
            <!-- 系统设置 -->
            <el-sub-menu index="/system" v-if="hasPermission('admin')">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/system/config">参数配置</el-menu-item>
              <el-menu-item index="/system/dict">字典管理</el-menu-item>
              <el-menu-item index="/system/logs">系统日志</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container class="main-container" :style="{marginLeft: isCollapse ? '64px' : '220px'}">
        <!-- 头部导航 -->
        <el-header height="60px" class="navbar">
          <div class="left-menu">
            <el-icon class="hamburger" @click="toggleSidebar">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <breadcrumb />
          </div>
          
          <div class="right-menu">
            <!-- 全屏切换 -->
            <div class="right-menu-item" @click="toggleFullScreen">
              <el-tooltip content="全屏显示" placement="bottom">
                <el-icon><FullScreen /></el-icon>
              </el-tooltip>
            </div>
            
            <!-- 主题切换 -->
            <div class="right-menu-item" @click="toggleTheme">
              <el-tooltip content="切换主题" placement="bottom">
                <el-icon v-if="!isDarkTheme"><Sunny /></el-icon>
                <el-icon v-else><Moon /></el-icon>
              </el-tooltip>
            </div>
            
            <!-- 消息通知 -->
            <div class="right-menu-item">
              <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
                <el-icon><Bell /></el-icon>
              </el-badge>
            </div>
            
            <!-- 用户头像下拉菜单 -->
            <el-dropdown trigger="click">
              <div class="avatar-wrapper">
                <img :src="userAvatar" class="user-avatar" />
                <span class="username">{{ userInfo.name }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="navigateTo('/profile')">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item @click="navigateTo('/password')">
                    <el-icon><Key /></el-icon>修改密码
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 标签导航 -->
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, User, Goods, List, ArrowDown, Setting, Fold, Expand,
         FullScreen, Bell, Close, Key, SwitchButton, Sunny, Moon } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import Breadcrumb from './Breadcrumb.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  localStorage.setItem('sidebarStatus', isCollapse.value ? '1' : '0')
}

// 初始化侧边栏状态
onMounted(() => {
  isCollapse.value = localStorage.getItem('sidebarStatus') === '1'
  
  // 初始化主题
  isDarkTheme.value = localStorage.getItem('theme') === 'dark'
  
  // 初始化标签视图
  if (route.name) {
    addVisitedView(route)
  }
})

// 当前活动菜单项
const activeMenu = computed(() => {
  return route.path
})

// 用户信息
const userInfo = computed(() => {
  return userStore.user || {}
})

// 权限控制
const hasPermission = (role) => {
  if (role === 'admin') {
    return userStore.isAdmin
  }
  return true
}

// 用户头像
const userAvatar = computed(() => {
  return userInfo.value.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
})

// 通知数量
const notificationCount = ref(3)

// 全屏切换
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

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

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

// 导航函数
const navigateTo = (path) => {
  router.push(path)
}

// 标签视图管理
const visitedViews = ref([])
const cachedViews = ref([])

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
  }
)
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

.sidebar-container {
  background-color: var(--sidebar-bg-color);
  transition: width 0.28s;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-image {
  height: 32px;
  margin-right: 8px;
}

.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: var(--header-bg-color);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

.left-menu {
  display: flex;
  align-items: center;
}

.hamburger {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
  transition: all 0.3s;
}

.right-menu {
  display: flex;
  align-items: center;
}

.right-menu-item {
  padding: 0 12px;
  cursor: pointer;
  font-size: 18px;
  color: var(--text-color);
}

.notification-badge {
  line-height: 1;
}

.avatar-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: 15px;
  color: var(--text-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  font-size: 14px;
  margin-right: 5px;
}

.main-container {
  transition: margin-left 0.28s;
  background-color: var(--main-bg-color);
  height: 100%;
  position: relative;
}

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