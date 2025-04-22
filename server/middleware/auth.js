const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 保护路由 - 需要登录
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从请求头中获取令牌
    token = req.headers.authorization.split(' ')[1];
  }

  // 确保令牌存在
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: '无权访问此路由，请先登录' 
    });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 获取用户信息
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '用户不存在' 
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: '无效的令牌' 
    });
  }
};

// 授权检查 - 验证用户角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: '需要登录' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `用户角色 ${req.user.role} 无权访问此路由` 
      });
    }
    next();
  };
};