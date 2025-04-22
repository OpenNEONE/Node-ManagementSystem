<template>
  <div class="order-detail-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>订单详情</h2>
        <span class="subtitle">查看和处理订单详细信息</span>
      </div>
    </div>
    <el-card shadow="never" class="detail-card">
      <el-form :model="order" label-width="100px" v-if="order">
        <el-form-item label="订单编号">
          <el-input v-model="order.orderNo" disabled />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="order.customerName" disabled />
        </el-form-item>
        <el-form-item label="订单金额">
          <el-input v-model="order.totalAmount" disabled />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag :type="getStatusType(order.status)">{{ getStatusLabel(order.status) }}</el-tag>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-input v-model="order.createdAt" disabled />
        </el-form-item>
        <el-form-item label="商品明细">
          <el-table :data="order.items" border size="small">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="price" label="单价" />
            <el-table-column prop="total" label="小计" />
          </el-table>
        </el-form-item>
        <el-form-item>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
      <div v-else class="empty-info">未找到订单信息</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '../../store/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const order = ref(null)

const orderStatusOptions = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'shipped', label: '已发货' },
  { value: 'delivered', label: '已送达' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' }
]

onMounted(async () => {
  const id = route.query.id
  if (id) {
    const res = await orderStore.getOrderById(id)
    if (res.success) {
      order.value = res.data
    } else {
      ElMessage.error(res.message || '获取订单信息失败')
    }
  }
})

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
const getStatusLabel = (status) => {
  const found = orderStatusOptions.find(option => option.value === status)
  return found ? found.label : status
}
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.order-detail-container {
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
.detail-card {
  background: #fff;
  margin-top: 10px;
  padding: 20px;
}
.empty-info {
  color: #aaa;
  text-align: center;
  padding: 40px 0;
}
</style>
