// index.ts - 启动服务入口
import app from "./app";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PORT = process.env.PORT || 8080;

import { sequelize } from "./models";

(async () => {
  // 启动前自动清空所有表，彻底避免外键冲突，仅开发环境使用
  // try {
  //   await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  //   await sequelize.query('DROP TABLE IF EXISTS order_items;');
  //   await sequelize.query('DROP TABLE IF EXISTS orders;');
  //   await sequelize.query('DROP TABLE IF EXISTS products;');
  //   await sequelize.query('DROP TABLE IF EXISTS users;');
  //   await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  //   console.log('数据库所有表已自动清空（顺序删除，外键已彻底清理）');
  // } catch (err) {
  //   console.error('自动清空表出错:', err);
  // }

  await sequelize.sync({ force: true }); // 强制重建表结构
  app.listen(PORT, () => {
    console.log(`服务已启动，监听端口: ${PORT}`);
  });
})();
