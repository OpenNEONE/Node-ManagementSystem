<template>
  <Layout>
    <div class="order-management-container">
      <div class="page-header">
        <h2>订单管理</h2>
        <el-button type="primary" @click="handleCreateOrder" v-if="!isAdmin">创建订单</el-button>
      </div>
      
      <el-card class="table-card">
        <!-- 过滤搜索 -->
        <div class="filter-container">
          <el-select
            v-model="filters.status"
            placeholder="订单状态"
            clearable
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="filters.paymentStatus"
            placeholder="支付状态"
            clearable
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in paymentStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        
        <!-- 订单表格 -->
        <el-table
          :data="orders"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="id" label="订单号" width="70" align="center" />
          <el-table-column label="客户" min-width="120">
            <template #default="scope">
              {{ scope.row.User ? scope.row.User.name : '未知用户' }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="金额" width="100" align="center">
            <template #default="scope">
              ¥{{ scope.row.totalAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getOrderStatusType(scope.row.status)">
                {{ getOrderStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="paymentStatus" label="支付状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getPaymentStatusType(scope.row.paymentStatus)">
                {{ getPaymentStatusLabel(scope.row.paymentStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleViewOrder(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-if="isAdmin"
                size="small"
                type="success"
                @click="handleUpdateStatus(scope.row)"
              >
                更新状态
              </el-button>
              <el-button
                v-if="isAdmin && canDeleteOrder(scope.row)"
                size="small"
                type="danger"
                @click="handleDeleteOrder(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :current-page="currentPage"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pageSize"
            :total="totalItems"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
      
      <!-- 查看订单详情对话框 -->
      <el-dialog
        title="订单详情"
        v-model="detailDialogVisible"
        width="700px"
      >
        <div v-loading="detailLoading">
          <div class="order-info-section">
            <h3>订单信息</h3>
            <div class="order-info-grid">
              <div class="info-item">
                <span class="label">订单号:</span>
                <span class="value">{{ currentOrder.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">客户:</span>
                <span class="value">{{ currentOrder.User ? currentOrder.User.name : '未知用户' }}</span>
              </div>
              <div class="info-item">
                <span class="label">订单状态:</span>
                <span class="value">
                  <el-tag :type="getOrderStatusType(currentOrder.status)">
                    {{ getOrderStatusLabel(currentOrder.status) }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="label">支付状态:</span>
                <span class="value">
                  <el-tag :type="getPaymentStatusType(currentOrder.paymentStatus)">
                    {{ getPaymentStatusLabel(currentOrder.paymentStatus) }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDate(currentOrder.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">总金额:</span>
                <span class="value">¥{{ currentOrder.totalAmount }}</span>
              </div>
            </div>
          </div>
          
          <div class="order-address-section" v-if="currentOrder.shippingAddress">
            <h3>收货地址</h3>
            <p>{{ currentOrder.shippingAddress }}</p>
          </div>
          
          <div class="order-items-section">
            <h3>订单明细</h3>
            <el-table
              :data="currentOrder.OrderItems || []"
              style="width: 100%"
              border
            >
              <el-table-column prop="Product.name" label="产品名称" min-width="120" />
              <el-table-column prop="quantity" label="数量" width="80" align="center" />
              <el-table-column prop="price" label="单价" width="100" align="center">
                <template #default="scope">
                  ¥{{ scope.row.price }}
                </template>
              </el-table-column>
              <el-table-column label="小计" width="120" align="center">
                <template #default="scope">
                  ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
            
            <div class="order-total">
              <span class="total-label">总计:</span>
              <span class="total-value">¥{{ currentOrder.totalAmount }}</span>
            </div>
          </div>
          
          <div class="order-notes-section" v-if="currentOrder.notes">
            <h3>订单备注</h3>
            <p>{{ currentOrder.notes }}</p>
          </div>
        </div>
      </el-dialog>
      
      <!-- 更新订单状态对话框 -->
      <el-dialog
        title="更新订单状态"
        v-model="statusDialogVisible"
        width="400px"
      >
        <el-form
          ref="statusFormRef"
          :model="statusForm"
          label-width="100px"
        >
          <el-form-item label="订单状态">
            <el-select v-model="statusForm.status" placeholder="请选择订单状态" style="width: 100%">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="支付状态">
            <el-select v-model="statusForm.paymentStatus" placeholder="请选择支付状态" style="width: 100%">
              <el-option
                v-for="item in paymentStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="statusDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitStatusUpdate" :loading="saveLoading">
              更新
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '../components/Layout.vue'
import { useOrderStore } from '../store/order'
import { useUserStore } from '../store/user'

const orderStore = useOrderStore()
const userStore = useUserStore()

// 状态
const orders = ref([])
const loading = ref(false)
const detailLoading = ref(false)
const saveLoading = ref(false)
const detailDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const createDialogVisible = ref(false)
const currentOrder = ref({})
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const statusFormRef = ref(null)

// 表单
const statusForm = reactive({
  id: null,
  status: '',
  paymentStatus: ''
})

// 过滤器
const filters = reactive({
  status: '',
  paymentStatus: ''
})

// 选项
const statusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'shipped', label: '已发货' },
  { value: 'delivered', label: '已送达' },
  { value: 'cancelled', label: '已取消' }
]

const paymentStatusOptions = [
  { value: 'unpaid', label: '未支付' },
  { value: 'paid', label: '已支付' },
  { value: 'refunded', label: '已退款' }
]

// 计算属性
const isAdmin = computed(() => userStore.isAdmin)

// 方法
const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (filters.status) {
      params.status = filters.status
    }
    
    if (filters.paymentStatus) {
      params.paymentStatus = filters.paymentStatus
    }
    
    const response = await orderStore.fetchOrders(params)
    
    if (response && response.success) {
      orders.value = response.data.data
      totalItems.value = response.data.count
    } else {
      ElMessage.error('获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表错误:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  currentPage.value = 1
  fetchOrders()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

const handleViewOrder = async (row) => {
  detailLoading.value = true
  detailDialogVisible.value = true
  try {
    const response = await orderStore.fetchOrderById(row.id)
    if (response && response.success) {
      currentOrder.value = response.data
    } else {
      ElMessage.error('获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情错误:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleUpdateStatus = (row) => {
  statusForm.id = row.id
  statusForm.status = row.status
  statusForm.paymentStatus = row.paymentStatus
  statusDialogVisible.value = true
}

// 判断订单是否可以删除（只有待处理或已取消的订单可以删除）
const canDeleteOrder = (order) => {
  return ['pending', 'cancelled'].includes(order.status)
}

const handleDeleteOrder = (row) => {
  ElMessageBox.confirm(
    `确认删除订单 #${row.id} 吗?`,
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await orderStore.deleteOrder(row.id)
      
      if (response.success) {
        ElMessage.success('删除成功')
        fetchOrders()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除订单错误:', error)
      ElMessage.error('删除订单失败')
    }
  }).catch(() => {})
}

const submitStatusUpdate = async () => {
  saveLoading.value = true
  try {
    const response = await orderStore.updateOrderStatus(statusForm.id, {
      status: statusForm.status,
      paymentStatus: statusForm.paymentStatus
    })
    
    if (response.success) {
      ElMessage.success('状态更新成功')
      statusDialogVisible.value = false
      fetchOrders()
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    console.error('更新订单状态错误:', error)
    ElMessage.error('更新订单状态失败')
  } finally {
    saveLoading.value = false
  }
}

// 创建新订单功能（这里只是示例，实际应用需要更复杂的实现）
const handleCreateOrder = () => {
  ElMessage.info('创建订单功能需要集成产品选择和购物车功能，这里仅作为演示')
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
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

// 获取支付状态标签
const getPaymentStatusLabel = (status) => {
  const statusMap = {
    'unpaid': '未支付',
    'paid': '已支付',
    'refunded': '已退款'
  }
  return statusMap[status] || status
}

// 获取支付状态对应的标签类型
const getPaymentStatusType = (status) => {
  const typeMap = {
    'unpaid': 'danger',
    'paid': 'success',
    'refunded': 'info'
  }
  return typeMap[status] || ''
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  margin-bottom: 20px;
}

.filter-item {
  margin-right: 10px;
  width: 200px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.order-info-section,
.order-address-section,
.order-items-section,
.order-notes-section {
  margin-bottom: 24px;
}

.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 8px;
  min-width: 80px;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  font-size: 18px;
}

.total-label {
  font-weight: bold;
  margin-right: 16px;
}

.total-value {
  color: #f56c6c;
  font-weight: bold;
}
</style>