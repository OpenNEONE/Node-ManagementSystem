<template>
  <Layout>
    <div class="dashboard-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>产品总数</span>
              </div>
            </template>
            <div class="card-content">
              <span class="card-value">{{ stats.totalProducts }}</span>
              <el-icon class="card-icon"><Goods /></el-icon>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>订单总数</span>
              </div>
            </template>
            <div class="card-content">
              <span class="card-value">{{ stats.totalOrders }}</span>
              <el-icon class="card-icon"><List /></el-icon>
            </div>
          </el-card>
        </el-col>
        
        <el-col v-if="isAdmin" :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>用户总数</span>
              </div>
            </template>
            <div class="card-content">
              <span class="card-value">{{ stats.totalUsers }}</span>
              <el-icon class="card-icon"><User /></el-icon>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="8" :lg="6">
          <el-card class="dashboard-card">
            <template #header>
              <div class="card-header">
                <span>待处理订单</span>
              </div>
            </template>
            <div class="card-content">
              <span class="card-value">{{ stats.pendingOrders }}</span>
              <el-icon class="card-icon"><Timer /></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="dashboard-row">
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
              </div>
            </template>
            <el-table :data="recentOrders" style="width: 100%" v-loading="loading.orders">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="totalAmount" label="金额" width="100">
                <template #default="scope">
                  ¥{{ scope.row.totalAmount }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getOrderStatusType(scope.row.status)">
                    {{ getOrderStatusLabel(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>近期产品</span>
              </div>
            </template>
            <el-table :data="recentProducts" style="width: 100%" v-loading="loading.products">
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="price" label="价格" width="100">
                <template #default="scope">
                  ¥{{ scope.row.price }}
                </template>
              </el-table-column>
              <el-table-column prop="stock" label="库存" width="80" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Goods, List, User, Timer } from '@element-plus/icons-vue'
import Layout from '../components/Layout.vue'
import { useUserStore } from '../store/user'
import { useProductStore } from '../store/product'
import { useOrderStore } from '../store/order'
import axios from 'axios'

const userStore = useUserStore()
const productStore = useProductStore()
const orderStore = useOrderStore()

// 仪表盘统计数据
const stats = reactive({
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  pendingOrders: 0
})

// 最近数据
const recentOrders = ref([])
const recentProducts = ref([])

// 加载状态
const loading = reactive({
  stats: false,
  orders: false,
  products: false
})

// 计算属性
const isAdmin = computed(() => userStore.isAdmin)

// 获取仪表盘数据
const fetchDashboardData = async () => {
  loading.stats = true
  try {
    // 获取产品统计
    const productsResponse = await productStore.fetchProducts({ limit: 5 })
    if (productsResponse && productsResponse.success) {
      stats.totalProducts = productsResponse.data.count
      recentProducts.value = productsResponse.data.data
    }
    
    // 获取订单统计
    const ordersResponse = await orderStore.fetchOrders({ limit: 5 })
    if (ordersResponse && ordersResponse.success) {
      stats.totalOrders = ordersResponse.data.count
      recentOrders.value = ordersResponse.data.data
      
      // 计算待处理订单数量
      stats.pendingOrders = recentOrders.value.filter(order => 
        order.status === 'pending' || order.status === 'processing'
      ).length
    }
    
    // 如果是管理员，获取用户统计
    if (isAdmin.value) {
      const response = await axios.get('http://localhost:8080/api/users', {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      if (response && response.data.success) {
        stats.totalUsers = response.data.count
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  } finally {
    loading.stats = false
    loading.orders = false
    loading.products = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取订单状态标签
const getOrderStatusLabel = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '处理中',
    'shipped': '已发货',
    'delivered': '已送达',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态对应的标签类型
const getOrderStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'processing': 'warning',
    'shipped': 'primary',
    'delivered': 'success',
    'cancelled': 'danger'
  }
  return typeMap[status] || ''
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-row {
  margin-top: 20px;
}

.dashboard-card {
  margin-bottom: 20px;
  border-radius: 4px;
  height: 150px;
}

.chart-card {
  margin-bottom: 20px;
  border-radius: 4px;
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.card-value {
  font-size: 30px;
  font-weight: bold;
  color: #303133;
}

.card-icon {
  font-size: 48px;
  color: #c0c4cc;
}
</style>