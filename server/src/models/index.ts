import User from './User';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';
import { sequelize } from '../config/db';

// 用户和订单关系：一对多
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// 订单和订单项关系：一对多
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// 产品和订单项关系：一对多
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

export {
  User,
  Product,
  Order,
  OrderItem,
  sequelize
};
