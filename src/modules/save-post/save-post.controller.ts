import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Delete,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { SavePostService } from './save-post.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('save-post')
export class SavePostController {
  constructor(private readonly savePostService: SavePostService) {}

  @Post(':postId')
  @UseGuards(AuthGuard)
  create(@Param('postId') postId: string, @Request() request) {
    return this.savePostService.create({ postId, uid: request.user?.id });
  }

  @Get('posts')
  @UseGuards(AuthGuard)
  async getUserLikePosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Request() request,
  ) {
    return this.savePostService.getUserSavedPosts(
      request.user?.id,
      page,
      pageSize,
    );
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  async unlikePost(@Param('postId') postId: string, @Request() request) {
    await this.savePostService.unsavePost(postId, request.user?.id);
  }
}
