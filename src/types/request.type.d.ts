import { User } from '../modules/user/user.entity'; // 假设User类型定义在这个文件中

declare global {
  namespace Express {
    interface Request {
      user?: User; // 扩展Request对象，添加user属性
    }
  }
}
