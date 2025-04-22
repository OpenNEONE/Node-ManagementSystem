<template>
  <Layout>
    <div class="user-management-container">
      <div class="page-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="handleAddUser">添加用户</el-button>
      </div>
      
      <el-card class="table-card">
        <!-- 过滤搜索 -->
        <div class="filter-container">
          <el-input
            v-model="search"
            placeholder="搜索用户名/邮箱"
            class="filter-item"
            clearable
            @input="handleFilter"
          />
          <el-select
            v-model="filters.role"
            placeholder="角色"
            clearable
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="filters.status"
            placeholder="状态"
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
        </div>
        
        <!-- 用户表格 -->
        <el-table
          :data="users"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="name" label="用户名" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getRoleTagType(scope.row.role)">
                {{ getRoleLabel(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '正常' : '已禁用' }}
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
                @click="handleEditUser(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteUser(scope.row)"
                :disabled="scope.row.id === currentUserId"
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
      
      <!-- 添加/编辑用户对话框 -->
      <el-dialog
        :title="dialogStatus === 'create' ? '添加用户' : '编辑用户'"
        v-model="dialogFormVisible"
        width="500px"
      >
        <el-form
          ref="userFormRef"
          :model="userForm"
          :rules="rules"
          label-width="100px"
          class="user-form"
        >
          <el-form-item label="用户名" prop="name">
            <el-input v-model="userForm.name" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="密码" prop="password" v-if="dialogStatus === 'create'">
            <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="userForm.role" placeholder="请选择角色" style="width: 100%">
              <el-option
                v-for="item in roleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="userForm.status" placeholder="请选择状态" style="width: 100%">
              <el-option
                v-for="item in statusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="saveLoading">
              {{ dialogStatus === 'create' ? '创建' : '更新' }}
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
import { useUserStore } from '../store/user'
import axios from 'axios'

const userStore = useUserStore()

// 状态
const users = ref([])
const loading = ref(false)
const saveLoading = ref(false)
const dialogFormVisible = ref(false)
const dialogStatus = ref('create')
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const userFormRef = ref(null)

// 当前用户ID（不能删除自己）
const currentUserId = computed(() => userStore.user ? userStore.user.id : null)

// 用户表单
const userForm = reactive({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active'
})

// 过滤器
const filters = reactive({
  role: '',
  status: ''
})

// 选项
const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '经理' },
  { value: 'user', label: '普通用户' }
]

const statusOptions = [
  { value: 'active', label: '正常' },
  { value: 'inactive', label: '已禁用' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const fetchUsers = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = new URLSearchParams()
    
    if (search.value) {
      params.append('search', search.value)
    }
    
    if (filters.role) {
      params.append('role', filters.role)
    }
    
    if (filters.status) {
      params.append('status', filters.status)
    }
    
    // API请求获取用户列表
    const response = await axios.get(`http://localhost:8080/api/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${userStore.token}` }
    })
    
    if (response.data.success) {
      users.value = response.data.data
      totalItems.value = response.data.count
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUsers()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  
  Object.assign(userForm, {
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  })
}

const handleAddUser = () => {
  resetUserForm()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const handleEditUser = (row) => {
  resetUserForm()
  Object.assign(userForm, { ...row, password: '' })
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
}

const handleDeleteUser = (row) => {
  ElMessageBox.confirm(
    `确认删除用户 "${row.name}" 吗?`,
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/users/${row.id}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      
      if (response.data.success) {
        ElMessage.success('删除成功')
        fetchUsers()
      } else {
        ElMessage.error(response.data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除用户错误:', error)
      ElMessage.error('删除用户失败')
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        let response
        
        if (dialogStatus.value === 'create') {
          response = await axios.post('http://localhost:8080/api/users', userForm, {
            headers: { Authorization: `Bearer ${userStore.token}` }
          })
        } else {
          // 编辑模式下，如果密码为空，则不提交密码字段
          const submitData = { ...userForm }
          if (!submitData.password) delete submitData.password
          
          response = await axios.put(`http://localhost:8080/api/users/${userForm.id}`, submitData, {
            headers: { Authorization: `Bearer ${userStore.token}` }
          })
        }
        
        if (response.data.success) {
          ElMessage.success(
            dialogStatus.value === 'create' ? '创建成功' : '更新成功'
          )
          dialogFormVisible.value = false
          fetchUsers()
        } else {
          ElMessage.error(response.data.message || (dialogStatus.value === 'create' ? '创建失败' : '更新失败'))
        }
      } catch (error) {
        console.error('保存用户错误:', error)
        ElMessage.error(dialogStatus.value === 'create' ? '创建用户失败' : '更新用户失败')
      } finally {
        saveLoading.value = false
      }
    }
  })
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

// 获取角色对应的标签标签
const getRoleLabel = (role) => {
  const roleMap = {
    'admin': '管理员',
    'manager': '经理',
    'user': '普通用户'
  }
  return roleMap[role] || role
}

// 获取角色对应的标签类型
const getRoleTagType = (role) => {
  const typeMap = {
    'admin': 'danger',
    'manager': 'warning',
    'user': 'success'
  }
  return typeMap[role] || ''
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-container {
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

.user-form {
  padding: 20px 0;
}
</style>