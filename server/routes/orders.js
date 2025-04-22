const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 所有订单路由都需要登录
router.use(protect);

// 获取所有订单 - 普通用户只能看到自己的，管理员可以看到所有
router.get('/', getOrders);

// 获取单个订单 - 普通用户只能看到自己的，管理员可以看到所有
router.get('/:id', getOrder);

// 创建订单 - 所有已登录用户
router.post('/', createOrder);

// 更新和删除订单需要管理员权限
router.put('/:id', authorize('admin'), updateOrderStatus);
router.delete('/:id', authorize('admin'), deleteOrder);

module.exports = router;