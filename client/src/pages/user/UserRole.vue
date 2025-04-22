<template>
  <div class="user-role-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>角色管理</h2>
        <span class="subtitle">分配和管理系统角色</span>
      </div>
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>
    <el-card shadow="never" class="filter-container">
      <el-form :model="queryParams" :inline="true">
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never" class="table-container">
      <el-table :data="roleList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="角色名称" align="center" />
        <el-table-column prop="description" label="描述" align="center" />
        <el-table-column prop="status" label="状态" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'warning'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页可后续补充 -->
    </el-card>
    <!-- 角色编辑/新增弹窗可后续补充 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const roleList = ref([
  { id: 1, name: '管理员', description: '系统最高权限', status: 'active' },
  { id: 2, name: '普通用户', description: '普通操作权限', status: 'active' }
])
const queryParams = reactive({
  roleName: ''
})

const getList = async () => {
  loading.value = true
  // 这里应调用后端API获取角色列表，当前为静态数据
  loading.value = false
}
const handleQuery = () => {
  // 实际应根据 queryParams 查询
  ElMessage.info('搜索功能待实现')
}
const resetQuery = () => {
  queryParams.roleName = ''
}
const handleAdd = () => {
  ElMessage.info('新增角色功能待实现')
}
const handleEdit = (row) => {
  ElMessage.info('编辑角色功能待实现')
}
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色 ${row.name} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功（演示）')
    // 实际应调用API删除
  }).catch(() => {})
}
onMounted(getList)
</script>

<style scoped>
.user-role-container {
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
</style>
