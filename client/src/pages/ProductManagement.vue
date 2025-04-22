<template>
  <Layout>
    <div class="product-management-container">
      <div class="page-header">
        <h2>产品管理</h2>
        <el-button type="primary" @click="handleAddProduct">添加产品</el-button>
      </div>
      
      <el-card class="table-card">
        <!-- 过滤搜索 -->
        <div class="filter-container">
          <el-input
            v-model="search"
            placeholder="搜索产品名称"
            class="filter-item"
            clearable
            @clear="handleFilter"
            @input="handleFilter"
          />
          <el-select
            v-model="filters.category"
            placeholder="分类"
            clearable
            class="filter-item"
            @change="handleFilter"
          >
            <el-option
              v-for="item in categoryOptions"
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
        
        <!-- 产品表格 -->
        <el-table
          :data="products"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column prop="name" label="产品名称" min-width="120" />
          <el-table-column prop="price" label="价格" width="100" align="center">
            <template #default="scope">
              ¥{{ scope.row.price }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" align="center" />
          <el-table-column prop="category" label="分类" width="120" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                {{ scope.row.status === 'active' ? '上架中' : '已下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                @click="handleEditProduct(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteProduct(scope.row)"
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
      
      <!-- 添加/编辑产品对话框 -->
      <el-dialog
        :title="dialogStatus === 'create' ? '添加产品' : '编辑产品'"
        v-model="dialogFormVisible"
        width="500px"
      >
        <el-form
          ref="productFormRef"
          :model="productForm"
          :rules="rules"
          label-width="100px"
          class="product-form"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="productForm.name" placeholder="请输入产品名称" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="productForm.description"
              type="textarea"
              placeholder="请输入产品描述"
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number
              v-model="productForm.price"
              :precision="2"
              :step="0.1"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input-number
              v-model="productForm.stock"
              :min="0"
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-input v-model="productForm.category" placeholder="请输入产品分类" />
          </el-form-item>
          <el-form-item label="图片链接" prop="image">
            <el-input v-model="productForm.image" placeholder="请输入图片链接" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="productForm.status" placeholder="请选择状态" style="width: 100%">
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
import { useProductStore } from '../store/product'

const productStore = useProductStore()

// 状态
const products = ref([])
const loading = ref(false)
const saveLoading = ref(false)
const dialogFormVisible = ref(false)
const dialogStatus = ref('create')
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const productFormRef = ref(null)

// 产品表单
const productForm = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  image: '',
  status: 'active'
})

// 过滤器
const filters = reactive({
  category: '',
  status: ''
})

// 选项
const categoryOptions = [
  { value: '电子产品', label: '电子产品' },
  { value: '家居用品', label: '家居用品' },
  { value: '服装', label: '服装' },
  { value: '书籍', label: '书籍' },
  { value: '其他', label: '其他' }
]

const statusOptions = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '已下架' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入产品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入产品库存', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入产品分类', trigger: 'blur' }
  ]
}

// 方法
const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    
    if (search.value) {
      params.name = search.value
    }
    
    if (filters.category) {
      params.category = filters.category
    }
    
    if (filters.status) {
      params.status = filters.status
    }
    
    const response = await productStore.fetchProducts(params)
    
    if (response && response.success) {
      products.value = response.data.data
      totalItems.value = response.data.count
    } else {
      ElMessage.error('获取产品列表失败')
    }
  } catch (error) {
    console.error('获取产品列表错误:', error)
    ElMessage.error('获取产品列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProducts()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchProducts()
}

const resetProductForm = () => {
  if (productFormRef.value) {
    productFormRef.value.resetFields()
  }
  
  Object.assign(productForm, {
    id: null,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: '',
    status: 'active'
  })
}

const handleAddProduct = () => {
  resetProductForm()
  dialogStatus.value = 'create'
  dialogFormVisible.value = true
}

const handleEditProduct = (row) => {
  Object.assign(productForm, { ...row })
  dialogStatus.value = 'update'
  dialogFormVisible.value = true
}

const handleDeleteProduct = (row) => {
  ElMessageBox.confirm(
    `确认删除产品 "${row.name}" 吗?`,
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await productStore.deleteProduct(row.id)
      
      if (response.success) {
        ElMessage.success('删除成功')
        // 重新获取当前页数据
        fetchProducts()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除产品错误:', error)
      ElMessage.error('删除产品失败')
    }
  }).catch(() => {})
}

const submitForm = async () => {
  if (!productFormRef.value) return
  
  await productFormRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true
      try {
        let response
        
        if (dialogStatus.value === 'create') {
          response = await productStore.createProduct(productForm)
        } else {
          response = await productStore.updateProduct(productForm.id, productForm)
        }
        
        if (response.success) {
          ElMessage.success(
            dialogStatus.value === 'create' ? '创建成功' : '更新成功'
          )
          dialogFormVisible.value = false
          fetchProducts()
        } else {
          ElMessage.error(response.message || (dialogStatus.value === 'create' ? '创建失败' : '更新失败'))
        }
      } catch (error) {
        console.error('保存产品错误:', error)
        ElMessage.error(dialogStatus.value === 'create' ? '创建产品失败' : '更新产品失败')
      } finally {
        saveLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.product-management-container {
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

.product-form {
  padding: 20px 0;
}
</style>