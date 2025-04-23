// 统一日志工具 TypeScript 版本
// 支持 info、warn、error 级别，自动带时间戳

export type LogType = 'info' | 'warn' | 'error';

export function log(message: string, type: LogType = 'info') {
  const timestamp = new Date().toISOString();
  if (type === 'error') {
    // eslint-disable-next-line no-console
    console.error(`[${timestamp}] ERROR: ${message}`);
  } else if (type === 'warn') {
    // eslint-disable-next-line no-console
    console.warn(`[${timestamp}] WARN: ${message}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] INFO: ${message}`);
  }
}
