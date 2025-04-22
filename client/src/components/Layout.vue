<template>
  <div class="layout-container">
    <el-container class="app-wrapper">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar-container">
        <div class="logo-container">
          <h2>管理系统</h2>
        </div>
        <el-menu
          router
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          unique-opened
        >
          <el-menu-item index="/dashboard">
            <el-icon><Monitor /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          
          <el-menu-item v-if="isAdmin" index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item index="/products" v-if="isAdmin">
            <el-icon><Goods /></el-icon>
            <template #title>产品管理</template>
          </el-menu-item>
          
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>订单管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <!-- 头部导航 -->
        <el-header height="60px" class="navbar">
          <div class="right-menu">
            <el-dropdown trigger="click">
              <div class="avatar-wrapper">
                {{ userInfo.name }}
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 内容主体 -->
        <el-main>
          <slot></slot>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, User, Goods, List, ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 当前活动菜单项
const activeMenu = computed(() => {
  return route.path
})

// 用户信息
const userInfo = computed(() => {
  return userStore.user || {}
})

// 是否为管理员
const isAdmin = computed(() => {
  return userStore.isAdmin
})

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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.app-wrapper {
  height: 100%;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.28s;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3649;
  color: #fff;
}

.navbar {
  height: 60px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 20px;
}

.right-menu {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
}

el-main {
  margin-left: 220px;
  padding: 20px;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .sidebar-container {
    width: 54px !important;
  }
  
  .el-main {
    margin-left: 54px;
  }
}
</style>