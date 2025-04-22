<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 30, 50, 100]
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:page', 'update:limit', 'pagination'])

// 内部状态
const currentPage = ref(props.page)
const pageSize = ref(props.limit)

// 监听属性变化
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.limit, (val) => {
  pageSize.value = val
})

// 处理页码变化
const handleCurrentChange = (val) => {
  emit('update:page', val)
  emitPagination()
}

// 处理每页条数变化
const handleSizeChange = (val) => {
  emit('update:limit', val)
  emitPagination()
}

// 触发分页事件
const emitPagination = () => {
  emit('pagination', {
    page: currentPage.value,
    limit: pageSize.value
  })
}
</script>

<style scoped>
.pagination-container {
  padding: 15px 0;
  text-align: right;
}
</style>