<template>
  <div class="order-process-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>订单处理</h2>
        <span class="subtitle">对订单进行审核、发货等操作</span>
      </div>
    </div>
    <el-card shadow="never" class="process-card">
      <el-form :model="order" label-width="100px" v-if="order">
        <el-form-item label="订单编号">
          <span>{{ order.orderNo }}</span>
        </el-form-item>
        <el-form-item label="客户名称">
          <span>{{ order.customerName }}</span>
        </el-form-item>
        <el-form-item label="订单金额">
          <span>¥ {{ order.totalAmount }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag :type="getStatusType(order.status)">{{ getStatusLabel(order.status) }}</el-tag>
        </el-form-item>
        <el-form-item label="发货单号" v-if="order.status === 'processing'">
          <el-input v-model="shippingNo" placeholder="请输入发货单号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-if="order.status === 'pending'" @click="handleApprove">审核通过</el-button>
          <el-button type="success" v-if="order.status === 'processing'" @click="handleShip">确认发货</el-button>
          <el-button type="danger" v-if="order.status !== 'completed' && order.status !== 'cancelled'" @click="handleCancel">取消订单</el-button>
        </el-form-item>
      </el-form>
      <div v-else class="empty-info">未找到订单信息</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '../../store/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const order = ref(null)
const shippingNo = ref('')

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

const handleApprove = async () => {
  if (!order.value) return
  const res = await orderStore.updateOrderStatus(order.value.id, 'processing')
  if (res.success) {
    ElMessage.success('订单已审核通过，进入处理中')
    order.value.status = 'processing'
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

const handleShip = async () => {
  if (!shippingNo.value) {
    ElMessage.warning('请填写发货单号')
    return
  }
  const res = await orderStore.shipOrder(order.value.id, shippingNo.value)
  if (res.success) {
    ElMessage.success('订单已发货')
    order.value.status = 'shipped'
  } else {
    ElMessage.error(res.message || '发货失败')
  }
}

const handleCancel = () => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await orderStore.updateOrderStatus(order.value.id, 'cancelled')
    if (res.success) {
      ElMessage.success('订单已取消')
      order.value.status = 'cancelled'
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.order-process-container {
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
.process-card {
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