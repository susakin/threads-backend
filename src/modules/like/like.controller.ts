import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get('posts')
  @UseGuards(AuthGuard)
  async getUserLikePosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Request() request,
  ) {
    return this.likeService.getUserLikePosts(request.user?.id, page, pageSize);
  }

  @Get(':postId')
  async getPostLikesWithUsers(
    @Param('postId') postId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ) {
    const result = await this.likeService.getPostLikes(
      postId,
      req.user?.id,
      page,
      pageSize,
    );
    return result;
  }

  @Post(':postId')
  @UseGuards(AuthGuard)
  async likePost(@Param('postId') postId: string, @Request() request) {
    await this.likeService.createLike({ postId, uid: request.user?.id });
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  async unlikePost(@Param('postId') postId: string, @Request() request) {
    await this.likeService.unlikePost(postId, request.user?.id);
  }
}
