import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    product: null,
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    pageSize: 10
  }),
  
  getters: {
    getProductById: (state) => (id) => {
      return state.products.find(product => product.id === id)
    }
  },
  
  actions: {
    async fetchProducts(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        const queryParams = new URLSearchParams({
          page: params.page || this.currentPage,
          limit: params.limit || this.pageSize,
          ...params
        })
        
        const response = await axios.get(`http://localhost:5000/api/products?${queryParams.toString()}`)
        
        if (response.data.success) {
          this.products = response.data.data
          this.totalCount = response.data.count
          this.currentPage = params.page || this.currentPage
          return { success: true, data: response.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取产品列表失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async fetchProductById(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.get(`http://localhost:5000/api/products/${id}`)
        
        if (response.data.success) {
          this.product = response.data.data
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '获取产品详情失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async createProduct(productData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.post('http://localhost:5000/api/products', productData)
        
        if (response.data.success) {
          // 刷新产品列表
          await this.fetchProducts()
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '创建产品失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async updateProduct(id, productData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.put(`http://localhost:5000/api/products/${id}`, productData)
        
        if (response.data.success) {
          // 更新本地产品列表中的数据
          const index = this.products.findIndex(product => product.id === id)
          if (index !== -1) {
            this.products[index] = response.data.data
          }
          return { success: true, data: response.data.data }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '更新产品失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    },
    
    async deleteProduct(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await axios.delete(`http://localhost:5000/api/products/${id}`)
        
        if (response.data.success) {
          // 从本地产品列表中删除
          this.products = this.products.filter(product => product.id !== id)
          return { success: true }
        }
      } catch (error) {
        this.error = error.response?.data?.message || '删除产品失败'
        return { success: false, message: this.error }
      } finally {
        this.loading = false
      }
    }
  }
})