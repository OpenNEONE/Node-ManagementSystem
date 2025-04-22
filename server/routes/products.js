const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// 获取产品列表和单个产品信息是公开的
router.get('/', getProducts);
router.get('/:id', getProduct);

// 创建、更新和删除产品需要管理员权限
router.use(protect);
router.use(authorize('admin'));

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;