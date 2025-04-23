import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

// 保护路由 - 需要登录
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

    // 获取用户信息
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '用户不存在' 
      });
    }

    // 将用户信息添加到请求对象
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: '无效的令牌' 
    });
  }
};

// 授权检查 - 验证用户角色
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '需要登录' 
      });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `用户角色 ${user.role} 无权访问此路由` 
      });
    }
    next();
  };
};
