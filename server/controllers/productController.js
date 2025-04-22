const { Product } = require('../models');

// @描述    获取所有产品
// @路由    GET /api/products
// @访问    公开
exports.getProducts = async (req, res) => {
  try {
    // 分页
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // 排序
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'DESC';
    
    // 过滤
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.status) where.status = req.query.status;
    
    // 查询数据库
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit,
      offset: startIndex,
      order: [[sort, order]]
    });
    
    // 分页结果
    const pagination = {};
    if (startIndex + limit < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count,
      pagination,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    获取单个产品
// @路由    GET /api/products/:id
// @访问    公开
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '未找到该产品'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    创建产品
// @路由    POST /api/products
// @访问    私有/管理员
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image, status } = req.body;
    
    // 创建产品
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image,
      status: status || 'active'
    });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    更新产品
// @路由    PUT /api/products/:id
// @访问    私有/管理员
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, image, status } = req.body;
    
    let product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '未找到该产品'
      });
    }
    
    // 更新产品信息
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (category) updateData.category = category;
    if (image !== undefined) updateData.image = image;
    if (status) updateData.status = status;
    
    await product.update(updateData);
    
    // 重新获取更新后的产品信息
    product = await Product.findByPk(req.params.id);
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    删除产品
// @路由    DELETE /api/products/:id
// @访问    私有/管理员
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '未找到该产品'
      });
    }
    
    await product.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};