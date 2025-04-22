<template>
  <div class="user-detail-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>用户详情</h2>
        <span class="subtitle">查看和编辑用户详细信息</span>
      </div>
    </div>
    <el-card shadow="never" class="detail-card">
      <el-form :model="user" label-width="100px" v-if="user">
        <el-form-item label="用户名">
          <el-input v-model="user.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="user.email" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="user.role">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="user.status" active-value="active" inactive-value="disabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
      <div v-else class="empty-info">未找到用户信息</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../../store/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const user = ref(null)

onMounted(async () => {
  const id = route.query.id
  if (id) {
    const res = await userStore.fetchUserById(id)
    if (res.success) {
      user.value = res.data
    } else {
      ElMessage.error(res.message || '获取用户信息失败')
    }
  }
})

const handleSave = async () => {
  if (!user.value) return
  const res = await userStore.updateUser(user.value)
  if (res.success) {
    ElMessage.success('保存成功')
    goBack()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.user-detail-container {
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
