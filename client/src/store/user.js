import { defineStore } from 'pinia'
import axios from 'axios'

// API 基础URL
const API_URL = 'http://localhost:8080/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    users: [],
    roles: [],
    permissions: [],
    pagination: {
      total: 0,
      current: 1,
      pageSize: 10
    }
  }),
  
  getters: {
    isAdmin: (state) => state.user && state.user.role === 'admin',
    isLoggedIn: (state) => state.isAuthenticated,
    getUserById: (state) => (id) => {
      return state.users.find(user => user.id === id) || null
    }
  },
  
  actions: {
    // 身份验证相关操作
    async login(credentials) {
      try {
        this.loading = true
        const response = await axios.post(`${API_URL}/auth/login`, credentials)
        
        if (response.data.success) {
          const { token, user } = response.data
          this.setUserData(token, user)
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '登录失败，请检查您的凭据'
        }
      } finally {
        this.loading = false
      }
    },
    
    async register(userData) {
      try {
        this.loading = true
        const response = await axios.post(`${API_URL}/auth/register`, userData)
        
        if (response.data.success) {
          const { token, user } = response.data
          this.setUserData(token, user)
          return { success: true }
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '注册失败，请稍后再试'
        }
      } finally {
        this.loading = false
      }
    },
    
    async checkAuth() {
      if (!this.token) return false
      
      try {
        // 配置请求头
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        
        // 获取用户信息
        const response = await axios.get(`${API_URL}/auth/me`)
        
        if (response.data.success) {
          this.user = response.data.data
          this.isAuthenticated = true
          return true
        } else {
          this.logout()
          return false
        }
      } catch (error) {
        this.logout()
        return false
      }
    },
    
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      axios.defaults.headers.common['Authorization'] = ''
    },
    
    setUserData(token, user) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    
    // 用户管理相关操作
    async fetchUsers(params = { page: 1, pageSize: 10 }) {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/users`, { params })
        
        if (response.data.success) {
          this.users = response.data.data
          this.pagination = {
            total: response.data.total,
            current: params.page,
            pageSize: params.pageSize
          }
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '获取用户列表失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async fetchUserById(id) {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/users/${id}`)
        
        if (response.data.success) {
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '获取用户详情失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async createUser(userData) {
      try {
        this.loading = true
        const response = await axios.post(`${API_URL}/users`, userData)
        
        if (response.data.success) {
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '创建用户失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async updateUser(id, userData) {
      try {
        this.loading = true
        const response = await axios.put(`${API_URL}/users/${id}`, userData)
        
        if (response.data.success) {
          // 如果更新的是当前用户，同步本地状态
          if (this.user && this.user.id === id) {
            this.user = { ...this.user, ...userData }
            localStorage.setItem('user', JSON.stringify(this.user))
          }
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '更新用户失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async deleteUser(id) {
      try {
        this.loading = true
        const response = await axios.delete(`${API_URL}/users/${id}`)
        
        if (response.data.success) {
          // 从本地列表中移除
          this.users = this.users.filter(user => user.id !== id)
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '删除用户失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    // 角色和权限管理
    async fetchRoles() {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/users/roles`)
        
        if (response.data.success) {
          this.roles = response.data.data
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '获取角色列表失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async fetchPermissions() {
      try {
        this.loading = true
        const response = await axios.get(`${API_URL}/users/permissions`)
        
        if (response.data.success) {
          this.permissions = response.data.data
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '获取权限列表失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    // 个人中心相关操作
    async updateProfile(profileData) {
      try {
        this.loading = true
        const response = await axios.put(`${API_URL}/users/profile`, profileData)
        
        if (response.data.success) {
          // 更新本地用户信息
          this.user = { ...this.user, ...profileData }
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '更新个人信息失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async changePassword(passwordData) {
      try {
        this.loading = true
        const response = await axios.put(`${API_URL}/users/change-password`, passwordData)
        
        if (response.data.success) {
          return { success: true }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '修改密码失败'
        }
      } finally {
        this.loading = false
      }
    },
    
    async uploadAvatar(formData) {
      try {
        this.loading = true
        const response = await axios.post(`${API_URL}/users/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (response.data.success) {
          // 更新本地用户头像
          this.user.avatar = response.data.data.avatarUrl
          localStorage.setItem('user', JSON.stringify(this.user))
          return { success: true, data: response.data.data }
        }
        return { success: false, message: response.data.message }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || '上传头像失败'
        }
      } finally {
        this.loading = false
      }
    }
  }
})