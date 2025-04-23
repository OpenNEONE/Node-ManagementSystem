import { Request, Response } from 'express';
import { Order, OrderItem, Product, User } from '../models';
import { sequelize } from '../config/db';

// @描述 获取所有订单
// @路由 GET /api/orders
// @访问 私有/管理员
export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) || 'DESC';
    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;
    const { rows: orders, count } = await Order.findAndCountAll({
      where,
      limit,
      offset: startIndex,
      order: [[sort, order]],
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
    const pagination: any = {};
    if (startIndex + limit < count) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    res.status(200).json({ success: true, count, pagination, data: orders });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 获取单个订单
// @路由 GET /api/orders/:id
// @访问 私有
export const getOrder = async (req: Request, res: Response) => {
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
      return res.status(404).json({ success: false, message: '未找到该订单' });
    }
    // 确保用户只能查看自己的订单（管理员除外）
    if ((order as any).userId !== (req as any).user.id && (req as any).user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '没有权限查看该订单' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 创建订单
// @路由 POST /api/orders
// @访问 私有
export const createOrder = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: '请提供订单项目' });
    }
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `产品ID ${item.productId} 不存在` });
      }
      if ((product as any).stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `产品 ${product.name} 库存不足` });
      }
      totalAmount += Number(product.price) * item.quantity;
    }
    const order = await Order.create({
      userId: (req as any).user.id,
      totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress,
      notes
    }, { transaction: t });
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }, { transaction: t });
      const product = await Product.findByPk(item.productId);
      await (product as any).update({ stock: (product as any).stock - item.quantity }, { transaction: t });
    }
    await t.commit();
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
    res.status(201).json({ success: true, data: completeOrder });
  } catch (error: any) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 更新订单状态
// @路由 PUT /api/orders/:id
// @访问 私有/管理员
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus } = req.body;
    let order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: '未找到该订单' });
    }
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '没有权限更新订单状态' });
    }
    await order.update({ status, paymentStatus });
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
    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 删除订单
// @路由 DELETE /api/orders/:id
// @访问 私有/管理员
export const deleteOrder = async (req: Request, res: Response) => {
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
      return res.status(404).json({ success: false, message: '未找到该订单' });
    }
    if ((req as any).user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '没有权限删除订单' });
    }
    for (const item of (order as any).OrderItems) {
      const product = await Product.findByPk(item.productId);
      await (product as any).update({ stock: (product as any).stock + item.quantity }, { transaction: t });
    }
    await OrderItem.destroy({ where: { orderId: (order as any).id }, transaction: t });
    await (order as any).destroy({ transaction: t });
    await t.commit();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    await t.rollback();
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
