<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="register-title">注册新用户</h2>
      <el-form
        :model="form"
        :rules="rules"
        ref="registerForm"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onRegister">注册</el-button>
          <el-button @click="goLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { prepareSecureCredentials } from "@/utils/passwordEncryption";

const router = useRouter();
const form = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};
const registerForm = ref(null);
import { useUserStore } from "@/store/user.js";
const userStore = useUserStore();

const onRegister = async () => {
  registerForm.value.validate(async (valid) => {
    if (valid) {
      // 准备注册数据并加密密码
      const registerData = {
        name: form.value.username,
        email: form.value.email,
        password: form.value.password,
      };
      // 使用密码加密工具处理凭据
      const secureRegisterData = prepareSecureCredentials(registerData);
      // 调用后端注册接口
      const res = await userStore.register(secureRegisterData);
      if (res && res.success) {
        ElMessage.success("注册成功！");
        router.push("/login");
      } else {
        ElMessage.error(res?.message || "注册失败，请重试");
      }
    }
  });
};
const goLogin = () => {
  router.push("/login");
};
</script>

<style lang="less" scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f6fa;
  
  .register-card {
    width: 400px;
    padding: 30px 20px;
    
    .register-title {
      text-align: center;
      margin-bottom: 20px;
    }
  }
}
</style>
