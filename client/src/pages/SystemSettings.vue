<template>
  <div class="system-settings-container">
    <div class="header-actions">
      <div class="page-title">
        <h2>系统设置</h2>
        <span class="subtitle">管理系统参数和通知设置</span>
      </div>
    </div>
    <el-card shadow="never" class="settings-card">
      <el-form :model="settings" label-width="120px">
        <el-form-item label="系统名称">
          <el-input v-model="settings.systemName" />
        </el-form-item>
        <el-form-item label="管理员邮箱">
          <el-input v-model="settings.adminEmail" />
        </el-form-item>
        <el-form-item label="通知开关">
          <el-switch v-model="settings.notifyEnabled" />
        </el-form-item>
        <el-form-item label="登录超时时间(分钟)">
          <el-input-number v-model="settings.sessionTimeout" :min="5" :max="1440" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const settings = ref({
  systemName: '演示管理系统',
  adminEmail: '',
  notifyEnabled: true,
  sessionTimeout: 30
})

onMounted(() => {
  // 这里可调用API获取系统设置
})

const handleSave = () => {
  // 这里可调用API保存设置
  ElMessage.success('设置已保存（演示）')
}
</script>

<style scoped>
.system-settings-container {
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
.settings-card {
  background: #fff;
  margin-top: 10px;
  padding: 20px;
}
</style>
