<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="register-header">
        <h2>用户注册</h2>
      </div>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="0" class="register-form">
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" placeholder="姓名" prefix-icon="el-icon-user">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" placeholder="邮箱" prefix-icon="el-icon-message">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" placeholder="密码" type="password" prefix-icon="el-icon-lock">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" placeholder="确认密码" type="password" prefix-icon="el-icon-lock">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="register-button" @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="register-footer">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

// 状态和引用
const registerForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
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
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const registerFormRef = ref(null)
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 注册逻辑
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const { confirmPassword, ...userData } = registerForm
      const response = await userStore.register(userData)
      
      if (response.success) {
        ElMessage.success('注册成功!')
        router.push('/dashboard')
      } else {
        ElMessage.error(response.message || '注册失败，请稍后重试')
      }
    } catch (error) {
      ElMessage.error('注册过程中发生错误')
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.register-card {
  width: 400px;
  border-radius: 8px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-form {
  margin-top: 20px;
}

.register-button {
  width: 100%;
}

.register-footer {
  margin-top: 15px;
  text-align: center;
}
</style>