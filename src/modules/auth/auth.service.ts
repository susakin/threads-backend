import { HttpException, Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from './schema/auth.schema';
import * as crypto from 'crypto';
import { UserService } from 'src/modules/user/user.service';
const jwt = require('jsonwebtoken');
import { RedisService } from '../redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../user/schema/user.schema';

@Injectable()
export class AuthService {
  token: string;
  constructor(
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {
    this.token = '';
  }

  generateAuthToken(uid: string): string {
    const payload = { uid };
    const token = jwt.sign(payload, this.token, { expiresIn: '15d' });

    return token;
  }

  async validateTokenAndGetUser(token: string): Promise<any> {
    try {
      token = token.replace('Bearer ', '');
      const { uid } = jwt.verify(token.replace('Bearer ', ''), this.token);
      const cachedToken = await this.redisService.get(uid);
      if (cachedToken === token) {
        const user = await this.userService.findUserById(uid, uid);
        return user;
      }
      throw new Error('Invalid or expired token');
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async generateAuthInfo(
    uid: string,
    account: string,
    password: string,
  ): Promise<void> {
    const existingAuth = await this.authModel.findOne({ uid });
    const user = await this.userService.findUserById(uid);
    if (!existingAuth && user) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
        .toString('hex');

      if (existingAuth) {
        await this.authModel.deleteOne({ id: existingAuth.id }); // 删除现有的认证信息
      }

      await this.authModel.create({
        id: uuidv4(),
        uid: user.id,
        salt,
        password: hashedPassword,
        account,
      });
    }
  }

  validatePassword(
    password: string,
    salt: string,
    hashedPassword: string,
  ): boolean {
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === hashedPassword;
  }

  async validatePasswordByUid(uid, password: string): Promise<boolean> {
    const authInfo = await this.authModel.findOne({ uid });

    if (!authInfo) {
      throw new HttpException('Invalid authInfo', 500);
    }
    return this.validatePassword(password, authInfo.salt, authInfo.password);
  }

  async login(
    account: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    const authInfo = await this.authModel.findOne({ account });

    if (!authInfo) {
      throw new HttpException('Invalid authInfo', 500);
    }

    const user = await this.userService.findUserById(authInfo.uid);

    if (!user) {
      throw new HttpException('Invalid authInfo', 500);
    }

    if (this.validatePassword(password, authInfo.salt, authInfo.password)) {
      const token = this.generateAuthToken(user.id);
      this.redisService.set(user.id, token, 60 * 60 * 24 * 15);
      return { token, user };
    } else {
      throw new HttpException('Invalid credentials', 500);
    }
  }

  async logout(authToken): Promise<void> {
    const decodedToken = jwt.verify(authToken, this.token);
    const userId = decodedToken.uid;
    this.redisService.delete(userId);
  }

  async deleteAuthInfoByUid(uid: string): Promise<void> {
    await this.authModel.deleteOne({ uid });
  }

  async isAccountExists(account: string): Promise<boolean> {
    const existingAuth = await this.authModel.findOne({ account });
    return !!existingAuth;
  }
}
