<template>
  <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-container">
    <div class="logo-container">
      <img src="../../assets/logo.svg" alt="Logo" class="logo-image" v-if="!isCollapse" />
      <img src="../../assets/logo-mini.svg" alt="Logo" class="logo-image" v-else />
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Monitor, User, Goods, List, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'

const route = useRoute()
const userStore = useUserStore()

// 接收父组件传递的props
const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false
  }
})

// 当前活动菜单项
const activeMenu = computed(() => {
  return route.path
})

// 权限控制
const hasPermission = (role) => {
  // if (role === 'admin') {
  //   return userStore.isAdmin
  // }
  return true
}
</script>

<style scoped>
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
</style>