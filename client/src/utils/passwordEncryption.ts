/**
 * 密码加密工具
 * 使用SHA-256对密码进行加密，增强传输安全性
 */
import CryptoJS from "crypto-js";

/**
 * 使用SHA-256对密码进行加密
 * 注意：这只是传输加密，不替代服务器端的bcrypt哈希存储
 * @param password 原始密码
 * @param salt 可选的盐值，默认使用固定盐（生产环境应使用随机盐或用户特定盐）
 * @returns 加密后的密码
 */
export const encryptPassword = (
  password: string,
  salt: string = "system-security-salt"
): string => {
  // 将密码与盐值组合
  const passwordWithSalt = password + salt;

  // 使用SHA-256进行哈希
  return CryptoJS.SHA256(passwordWithSalt).toString();
};

/**
 * 为登录/注册请求准备加密的凭据
 * @param credentials 原始凭据对象，包含密码
 * @returns 处理后的凭据，密码已加密
 */
export const prepareSecureCredentials = (credentials: {
  password: string;
  [key: string]: any;
}): any => {
  const secureCredentials = { ...credentials };

  // 加密密码
  if (secureCredentials.password) {
    secureCredentials.password = encryptPassword(secureCredentials.password);
  }

  return secureCredentials;
};
