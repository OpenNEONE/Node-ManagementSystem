<template>
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
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, Expand, FullScreen, Bell, User, Key, SwitchButton, ArrowDown, Sunny, Moon } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import Breadcrumb from './Breadcrumb.vue'

const router = useRouter()
const userStore = useUserStore()

// 接收父组件传递的props
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  },
  isDarkTheme: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['toggle-sidebar', 'toggle-theme'])

// 切换侧边栏
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// 用户信息
const userInfo = computed(() => {
  return userStore.user || {}
})

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
const toggleTheme = () => {
  emit('toggle-theme')
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
</script>

<style scoped>
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
</style>