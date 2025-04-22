<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>系统登录</h2>
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="0" class="login-form">
        <el-form-item prop="email">
          <el-input v-model="loginForm.email" placeholder="邮箱" prefix-icon="el-icon-message">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="密码" type="password" prefix-icon="el-icon-lock">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <router-link to="/register">没有账号？立即注册</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

// 状态和引用
const loginForm = reactive({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6个字符', trigger: 'blur' }
  ]
}

const loginFormRef = ref(null)
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 登录逻辑
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const response = await userStore.login(loginForm)
      if (response.success) {
        ElMessage.success('登录成功')
        router.push('/dashboard')
      } else {
        ElMessage.error(response.message || '登录失败，请检查邮箱和密码')
      }
    } catch (error) {
      ElMessage.error('登录过程中发生错误')
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  border-radius: 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.login-footer {
  margin-top: 15px;
  text-align: center;
}
</style>