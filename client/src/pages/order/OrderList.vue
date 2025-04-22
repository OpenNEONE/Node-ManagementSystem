<template>
  <div class="order-list-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>订单列表</h2>
        <span class="subtitle">管理所有订单记录</span>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon> 导出数据
        </el-button>
        <el-button type="success" @click="refreshData">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>
    
    <!-- 搜索过滤区 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="queryParams" ref="queryForm" :inline="true">
        <el-form-item label="订单编号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input
            v-model="queryParams.customerName"
            placeholder="请输入客户名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="订单状态" clearable>
            <el-option
              v-for="dict in orderStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间" prop="dateRange">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card shadow="never" class="table-container">
      <el-table
        v-loading="loading"
        :data="orderList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="订单编号" align="center" prop="orderNo" width="180">
          <template #default="scope">
            <el-button type="text" @click="handleViewDetail(scope.row)">{{ scope.row.orderNo }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="客户名称" align="center" prop="customerName" />
        <el-table-column label="订单金额" align="center" prop="totalAmount">
          <template #default="scope">
            <span>¥ {{ formatPrice(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" align="center" prop="paymentMethod" />
        <el-table-column label="下单时间" align="center" prop="createdAt" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              详情
            </el-button>
            <el-button v-if="scope.row.status === 'pending'" type="success" size="small" @click="handleProcess(scope.row)">
              处理
            </el-button>
            <el-dropdown>
              <el-button size="small">
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handlePrint(scope.row)">打印订单</el-dropdown-item>
                  <el-dropdown-item v-if="scope.row.status !== 'cancelled'" divided @click="handleCancel(scope.row)">
                    取消订单
                  </el-dropdown-item>
                  <el-dropdown-item v-if="isAdmin" divided @click="handleDelete(scope.row)" style="color: #F56C6C;">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <pagination
        v-if="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Download, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../../store/order'
import { useUserStore } from '../../store/user'
import Pagination from '../../components/Pagination.vue'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

// 权限控制
const isAdmin = computed(() => userStore.isAdmin)

// 状态数据
const loading = ref(false)
const orderList = ref([])
const total = ref(0)
const dateRange = ref([])

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  orderNo: '',
  customerName: '',
  status: '',
  startDate: undefined,
  endDate: undefined,
})

// 订单状态选项
const orderStatusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'shipped', label: '已发货' },
  { value: 'delivered', label: '已送达' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' }
]

// 初始化加载
onMounted(() => {
  getList()
})

// 获取订单列表
const getList = async () => {
  loading.value = true
  
  // 处理日期范围
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startDate = dateRange.value[0]
    queryParams.endDate = dateRange.value[1]
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
  }
  
  try {
    const response = await orderStore.getOrders(queryParams)
    if (response.success) {
      orderList.value = response.data
      total.value = response.total || 0
    } else {
      ElMessage.error(response.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表出错:', error)
    ElMessage.error('系统错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  dateRange.value = []
  Object.keys(queryParams).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') {
      queryParams[key] = ''
    }
  })
  queryParams.pageNum = 1
  getList()
}

// 刷新数据
const refreshData = () => {
  getList()
  ElMessage.success('数据已刷新')
}

// 查看订单详情
const handleViewDetail = (row) => {
  router.push(`/order/detail/${row.id}`)
}

// 处理订单
const handleProcess = (row) => {
  router.push({
    path: '/order/process',
    query: { id: row.id }
  })
}

// 取消订单
const handleCancel = (row) => {
  ElMessageBox.confirm(`确认要取消订单 ${row.orderNo} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await orderStore.updateOrderStatus(row.id, 'cancelled')
      if (response.success) {
        ElMessage.success('订单已取消')
        getList()
      } else {
        ElMessage.error(response.message || '取消订单失败')
      }
    } catch (error) {
      ElMessage.error('操作失败，请稍后重试')
    }
  }).catch(() => {})
}

// 删除订单
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认要删除订单 ${row.orderNo} 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await orderStore.deleteOrder(row.id)
      if (response.success) {
        ElMessage.success('删除成功')
        getList()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('操作失败，请稍后重试')
    }
  }).catch(() => {})
}

// 打印订单
const handlePrint = (row) => {
  // 实际项目中可以调用打印服务
  ElMessage.info('订单打印功能已触发')
  console.log('打印订单:', row.orderNo)
}

// 导出数据
const exportData = () => {
  ElMessage.info('数据导出功能已触发')
  console.log('导出订单数据')
}

// 格式化价格
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2)
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'shipped': return 'primary' 
    case 'delivered': return 'success'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    case 'refunded': return 'danger'
    default: return 'info'
  }
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const found = orderStatusOptions.find(option => option.value === status)
  return found ? found.label : status
}
</script>

<style scoped>
.order-list-container {
  padding: 10px 0;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-title {
  display: flex;
  flex-direction: column;
}

.page-title h2 {
  margin: 0;
  font-size: 20px;
}

.page-title .subtitle {
  font-size: 14px;
  color: #666;
}

.filter-container {
  margin-bottom: 16px;
  padding: 18px;
  background-color: #fff;
}

.table-container {
  background-color: #fff;
}

:deep(.el-table .cell) {
  padding: 8px 12px;
}
</style>