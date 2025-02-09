import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { RepostService } from './repost.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('repost')
export class RepostController {
  constructor(private readonly repostService: RepostService) {}

  @Post(':postId')
  @UseGuards(AuthGuard)
  async createRepost(@Param('postId') postId: string, @Request() request) {
    return this.repostService.createRepost({ postId, uid: request.user?.id });
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  async unrepostPost(@Param('postId') postId: string, @Request() request) {
    return this.repostService.unRepostPost(postId, request.user?.id);
  }

  @Get('post/:postId')
  async getPostReposts(
    @Param('postId') postId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Req() req: _Request,
  ) {
    return this.repostService.getPostReposts(
      postId,
      req.user?.id,
      page,
      pageSize,
    );
  }

  @Get('user/:uid')
  async getRepostsByUserId(
    @Param('uid') uid: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 10,
    @Req() req: _Request,
  ) {
    return this.repostService.getRepostsByUid(
      uid,
      req.user?.id,
      page,
      pageSize,
    );
  }
}
