const { User } = require('../models');

// @描述    注册用户
// @路由    POST /api/auth/register
// @访问    公开
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ where: { email } });
    
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: '该邮箱已被注册' 
      });
    }

    // 创建用户
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    // 返回token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    用户登录
// @路由    POST /api/auth/login
// @访问    公开
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证邮箱和密码
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: '请提供邮箱和密码' 
      });
    }

    // 检查用户是否存在
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: '用户不存在' 
      });
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: '密码错误' 
      });
    }

    // 返回token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述    获取当前登录用户
// @路由    GET /api/auth/me
// @访问    私有
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      data: user
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

// @描述    退出登录 / 清除cookie
// @路由    GET /api/auth/logout
// @访问    私有
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: '已退出登录'
  });
};

// 生成token并发送响应
const sendTokenResponse = (user, statusCode, res) => {
  // 创建token
  const token = user.getSignedJwtToken();

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};