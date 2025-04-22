import { defineStore } from 'pinia'
import axios from 'axios'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    order: null,
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: 10
  }),
  
  getters: {
    getOrderById: (state) => (id) => {
      return state.orders.find(order => order.id === id)
    }
  },
  
  actions: {
    async fetchOrders(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        const queryParams = new URLSearchParams({
          page: params.page || this.currentPage,
          limit: params.limit || this.pageSize,
          ...params
        })
        
        const response = await axios.get(`http://localhost:8080/api/orders?${queryParams.toString()}`)
        
        if (response.data.success) {
          this.orders = response.data.data
          this.totalCount = response.data.count
          this.currentPage = params.page || this.currentPage
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取订单列表失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async fetchOrderById(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.get(`http://localhost:8080/api/orders/${id}`)
        
        if (response.data.success) {
          this.order = response.data.data
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取订单详情失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async createOrder(orderData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.post('http://localhost:8080/api/orders', orderData)
        
        if (response.data.success) {
          // 刷新订单列表
          await this.fetchOrders()
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '创建订单失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(id, statusData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.put(`http://localhost:8080/api/orders/${id}`, statusData)
        
        if (response.data.success) {
          // 更新本地订单列表中的数据
          const index = this.orders.findIndex(order => order.id === id)
          if (index !== -1) {
            this.orders[index] = response.data.data
          }
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '更新订单状态失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async deleteOrder(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.delete(`http://localhost:8080/api/orders/${id}`)
        
        if (response.data.success) {
          // 从本地订单列表中删除
          this.orders = this.orders.filter(order => order.id !== id)
          return { success: true }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '删除订单失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})