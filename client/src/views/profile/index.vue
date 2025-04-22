<template>
  <div class="user-profile-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>个人中心</h2>
        <span class="subtitle">管理个人信息和账号安全</span>
      </div>
    </div>
    <el-card shadow="never" class="profile-card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-form :model="user" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="user.username" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="user.email" />
            </el-form-item>
            <el-form-item label="角色">
              <el-input v-model="user.role" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="修改密码" name="password">
          <el-form :model="passwordForm" label-width="100px">
            <el-form-item label="原密码">
              <el-input v-model="passwordForm.oldPassword" type="password" />
            </el-form-item>
            <el-form-item label="新密码">
              <el-input v-model="passwordForm.newPassword" type="password" />
            </el-form-item>
            <el-form-item label="确认新密码">
              <el-input v-model="passwordForm.confirmPassword" type="password" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../store/user'

const userStore = useUserStore()
const user = ref({ username: '', email: '', role: '' })
const activeTab = ref('info')
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  const res = await userStore.getProfile()
  if (res.success) {
    user.value = res.data
  }
})

const handleSave = async () => {
  const res = await userStore.updateProfile(user.value)
  if (res.success) {
    ElMessage.success('保存成功')
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}
const handleChangePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  const res = await userStore.changePassword(passwordForm)
  if (res.success) {
    ElMessage.success('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } else {
    ElMessage.error(res.message || '密码修改失败')
  }
}
</script>

<style scoped>
.user-profile-container {
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
.profile-card {
  background: #fff;
  margin-top: 10px;
  padding: 20px;
}
</style>
