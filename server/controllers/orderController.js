const { Order, OrderItem, Product, User } = require('../models');
const { sequelize } = require('../config/db');

// @描述    获取所有订单
// @路由    GET /api/orders
// @访问    私有/管理员
exports.getOrders = async (req, res) => {
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
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    
    // 如果不是管理员，只能查看自己的订单
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }
    
    // 查询数据库
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ],
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
      data: orders
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

// @描述    获取单个订单
// @路由    GET /api/orders/:id
// @访问    私有
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price', 'image']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到该订单'
      });
    }
    
    // 确保用户只能查看自己的订单（管理员除外）
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限查看该订单'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
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

// @描述    创建订单
// @路由    POST /api/orders
// @访问    私有
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { items, shippingAddress, notes } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: '请提供订单项目'
      });
    }
    
    // 计算订单总金额并验证库存
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `未找到ID为${item.productId}的产品`
        });
      }
      
      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `产品"${product.name}"库存不足`
        });
      }
      
      totalAmount += product.price * item.quantity;
      
      // 减少产品库存
      await product.update({
        stock: product.stock - item.quantity
      }, { transaction: t });
    }
    
    // 创建订单
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      notes
    }, { transaction: t });
    
    // 创建订单项目
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      }, { transaction: t });
    }
    
    await t.commit();
    
    // 返回包含完整信息的订单
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: completeOrder
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    更新订单状态
// @路由    PUT /api/orders/:id
// @访问    私有/管理员
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    let order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到该订单'
      });
    }
    
    // 只有管理员可以更新订单状态
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限更新订单状态'
      });
    }
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    await order.update(updateData);
    
    // 重新获取更新后的订单信息
    order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: order
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

// @描述    删除订单
// @路由    DELETE /api/orders/:id
// @访问    私有/管理员
exports.deleteOrder = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到该订单'
      });
    }
    
    // 只有管理员可以删除订单
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '没有权限删除订单'
      });
    }
    
    // 如果订单已经发货或交付，不允许删除
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: '已发货或交付的订单不能删除'
      });
    }
    
    // 恢复产品库存
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      await product.update({
        stock: product.stock + item.quantity
      }, { transaction: t });
    }
    
    // 删除订单项
    await OrderItem.destroy({
      where: { orderId: order.id },
      transaction: t
    });
    
    // 删除订单
    await order.destroy({ transaction: t });
    
    await t.commit();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};