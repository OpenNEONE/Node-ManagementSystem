<template>
  <div class="order-statistics-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>订单统计</h2>
        <span class="subtitle">订单数据分析与可视化</span>
      </div>
    </div>
    <el-card shadow="never" class="statistics-card">
      <div class="statistics-summary">
        <el-row :gutter="24">
          <el-col :span="6">
            <el-statistic title="总订单数" :value="summary.totalOrders" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="总销售额" :value="summary.totalAmount" prefix="¥" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="已完成订单" :value="summary.completedOrders" />
          </el-col>
          <el-col :span="6">
            <el-statistic title="已取消订单" :value="summary.cancelledOrders" />
          </el-col>
        </el-row>
      </div>
      <div class="chart-section">
        <el-divider>订单趋势</el-divider>
        <div id="order-trend-chart" style="height: 320px;"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { useOrderStore } from '../../store/order'

const orderStore = useOrderStore()
const summary = ref({
  totalOrders: 0,
  totalAmount: 0,
  completedOrders: 0,
  cancelledOrders: 0
})
const trendData = ref([])

onMounted(async () => {
  // 获取统计数据
  const res = await orderStore.getOrderStatistics()
  if (res.success) {
    summary.value = res.summary
    trendData.value = res.trend
    renderChart()
  } else {
    ElMessage.error(res.message || '获取统计数据失败')
  }
})

const renderChart = () => {
  const chartDom = document.getElementById('order-trend-chart')
  if (!chartDom) return
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['订单数', '销售额'] },
    xAxis: {
      type: 'category',
      data: trendData.value.map(item => item.date)
    },
    yAxis: [
      { type: 'value', name: '订单数' },
      { type: 'value', name: '销售额', position: 'right' }
    ],
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: trendData.value.map(item => item.count),
        yAxisIndex: 0
      },
      {
        name: '销售额',
        type: 'line',
        data: trendData.value.map(item => item.amount),
        yAxisIndex: 1
      }
    ]
  }
  myChart.setOption(option)
}
</script>

<style scoped>
.order-statistics-container {
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
.statistics-card {
  background: #fff;
  margin-top: 10px;
  padding: 20px;
}
.statistics-summary {
  margin-bottom: 24px;
}
.chart-section {
  margin-top: 24px;
}
</style>
