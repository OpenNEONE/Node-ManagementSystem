import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/layout/Layout.vue'

// 基础页面
const Login = () => import('../views/auth/Login.vue')
const Register = () => import('../views/auth/Register.vue')
const NotFound = () => import('../views/error/NotFound.vue')
const Dashboard = () => import('../views/dashboard/index.vue')

// 一级业务页面
const UserManagement = () => import('../views/user/index.vue')
const ProductManagement = () => import('../views/product/index.vue')
const OrderManagement = () => import('../views/order/index.vue')
const SystemSettings = () => import('../views/system/index.vue')
const UserProfile = () => import('../views/profile/index.vue')

// 用户相关二级页面
const UserList = () => import('../views/user/UserList.vue')
const UserRole = () => import('../views/user/UserRole.vue')
const UserPermission = () => import('../views/user/UserPermission.vue')
const UserDetail = () => import('../views/user/UserDetail.vue')

// 订单相关二级页面
const OrderList = () => import('../views/order/OrderList.vue')
const OrderProcess = () => import('../views/order/OrderProcess.vue')
const OrderStatistics = () => import('../views/order/OrderStatistics.vue')
const OrderDetail = () => import('../views/order/OrderDetail.vue')

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false, title: '登录' } },
  { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: false, title: '注册' } },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true, title: '仪表盘', icon: 'Monitor', keepAlive: true } },
      // 用户管理
      { path: 'user', name: 'UserManagement', component: UserManagement, meta: { requiresAuth: true, title: '用户管理', icon: 'User' } },
      { path: 'user/list', name: 'UserList', component: UserList, meta: { requiresAuth: true, title: '用户列表' } },
      { path: 'user/role', name: 'UserRole', component: UserRole, meta: { requiresAuth: true, title: '角色管理' } },
      { path: 'user/permission', name: 'UserPermission', component: UserPermission, meta: { requiresAuth: true, title: '权限管理' } },
      { path: 'user/detail/:id', name: 'UserDetail', component: UserDetail, meta: { requiresAuth: true, title: '用户详情', hideMenu: true } },
      // 订单管理
      { path: 'order', name: 'OrderManagement', component: OrderManagement, meta: { requiresAuth: true, title: '订单管理', icon: 'List' } },
      { path: 'order/list', name: 'OrderList', component: OrderList, meta: { requiresAuth: true, title: '订单列表' } },
      { path: 'order/process', name: 'OrderProcess', component: OrderProcess, meta: { requiresAuth: true, title: '订单处理' } },
      { path: 'order/statistics', name: 'OrderStatistics', component: OrderStatistics, meta: { requiresAuth: true, title: '订单统计' } },
      { path: 'order/detail/:id', name: 'OrderDetail', component: OrderDetail, meta: { requiresAuth: true, title: '订单详情', hideMenu: true } },
      // 产品管理
      { path: 'product', name: 'ProductManagement', component: ProductManagement, meta: { requiresAuth: true, title: '产品管理', icon: 'Goods' } },
      // 系统设置
      { path: 'system', name: 'SystemSettings', component: SystemSettings, meta: { requiresAuth: true, title: '系统设置', icon: 'Setting' } },
      // 个人中心
      { path: 'profile', name: 'UserProfile', component: UserProfile, meta: { requiresAuth: true, title: '个人中心', hideMenu: true } },
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound, meta: { title: '页面未找到' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 管理系统`
  }
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router