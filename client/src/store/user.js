import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    loading: false
  }),
  
  getters: {
    isAdmin: (state) => state.user && state.user.role === 'admin',
    isLoggedIn: (state) => state.isAuthenticated
  },
  
  actions: {
    async login(credentials) {
      try {
        this.loading = true
        const response = await axios.post('http://localhost:8080/api/auth/login', credentials)
        
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
        const response = await axios.post('http://localhost:8080/api/auth/register', userData)
        
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
        const response = await axios.get('http://localhost:8080/api/auth/me')
        
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
    }
  }
})