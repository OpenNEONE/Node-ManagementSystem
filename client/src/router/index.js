import { createRouter, createWebHistory } from 'vue-router'

// 页面组件懒加载
const Login = () => import('../pages/Login.vue')
const Register = () => import('../pages/Register.vue')
const Dashboard = () => import('../pages/Dashboard.vue')
const UserManagement = () => import('../pages/UserManagement.vue')
const ProductManagement = () => import('../pages/ProductManagement.vue')
const OrderManagement = () => import('../pages/OrderManagement.vue')
const NotFound = () => import('../pages/NotFound.vue')

// 路由配置
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/products',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/orders',
    name: 'OrderManagement',
    component: OrderManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫 - 处理认证和权限控制
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // 检查页面是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

  if (requiresAuth && !token) {
    // 需要认证但未登录，重定向到登录页
    next({ name: 'Login' })
  } else if (requiresAdmin && user.role !== 'admin') {
    // 需要管理员权限但用户不是管理员，重定向到仪表盘
    next({ name: 'Dashboard' })
  } else if ((to.name === 'Login' || to.name === 'Register') && token) {
    // 已登录用户不应访问登录和注册页，重定向到仪表盘
    next({ name: 'Dashboard' })
  } else {
    // 其他情况正常导航
    next()
  }
})

export default router