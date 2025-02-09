import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  Delete,
  HttpException,
  UseGuards,
  Request as _Request,
  Query,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserService } from './user.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { SecurityGuard } from 'src/guards/security.guard';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(SecurityGuard)
  async createUser(
    @Body() user: CreateUserDto,
    @Req() req: Request,
  ): Promise<any> {
    try {
      const createUser = await this.userService.create(user, req.ip);
      return createUser;
    } catch (err) {
      throw new HttpException(err.message, 500);
    }
  }

  @Get('/recommended-users')
  async getRecommendedUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: Request,
  ): Promise<{ total: number; users: User[] }> {
    debugger;
    const currentUid = req.user?.id; // 假设用户对象可通过req.user访问到
    return this.userService.getRecommendedUsers(page, pageSize, currentUid);
  }

  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.findUserById(id, req.user.id);
  }

  @Get()
  async findUsersByQuery(
    @Query('query') query: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: Request,
  ): Promise<{ total: number; users: User[] }> {
    const currentUid = req.user?.id; // Assuming the user object is available in the request as req.user
    return this.userService.findUsersByQuery(query, page, pageSize, currentUid);
  }

  @Get('/username/:username')
  async getUserByUsername(
    @Param('username') username: string,
    @Req() req: Request,
  ): Promise<User> {
    return this.userService.findOneByUsername(username, req?.user?.id);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async updateUser(
    @_Request() request,
    @Body() updatedFields: Partial<User>,
  ): Promise<void> {
    await this.userService.findOneAndUpdate(request.user?.id, updatedFields);
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteUserByPassword(
    @_Request() request,
    @Body() password: { password: string },
  ): Promise<void> {
    await this.userService.deleteUserByPassword(
      request.user?.id,
      password.password,
    );
  }

  @Delete(':id')
  @UseGuards(SecurityGuard)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUserById(id);
  }
}
