import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpException,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, ReplyAuth } from './dto/create-post.dot';
import { Post as PostItem } from './schema/post.schema';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() createPostDto: CreatePostDto, @Request() request) {
    createPostDto.uid = request.user?.id;
    return this.postService.createPost(createPostDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: PostItem,
    @Request() request,
  ) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    return this.postService.updatePost(id, updatePostDto);
  }

  @Patch(':id/reply-auth')
  @UseGuards(AuthGuard)
  async updatePostReplyAuth(
    @Param('id') id: string,
    @Body('replyAuth') replyAuth: ReplyAuth,
    @Request() request,
  ) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    return this.postService.updatePostReplyAuth(id, replyAuth);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deletePost(@Param('id') id: string, @Request() request) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    return this.postService.deletePost(id);
  }

  @Get('user/:uid')
  async findPostsByUid(
    @Param('uid') uid: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ) {
    return this.postService.findPostsByUid(uid, req?.user?.id, page, pageSize);
  }

  @Get('timeline')
  async getTimelinePosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ): Promise<{ total: number; posts: any }> {
    return this.postService.findTimelinePosts(req.user?.id, page, pageSize);
  }

  @Get('code/:code')
  async findPostByCode(@Param('code') code: string, @Req() req: _Request) {
    return this.postService.findPostByCode(code, req.user?.id);
  }

  @Patch(':id/pin')
  @UseGuards(AuthGuard)
  async pinPost(@Param('id') id: string, @Request() request) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    const updatedPost = await this.postService.pinToProfile(id);
    return updatedPost;
  }

  @Patch(':id/pin-to-comment')
  @UseGuards(AuthGuard)
  async pinToComment(@Param('id') id: string, @Request() request) {
    const user = request.user; // 从请求中获取用户信息

    const updatedPost = await this.postService.pinToComment(id, user.id);
    return updatedPost;
  }

  @Patch(':id/unpin-to-comment')
  @UseGuards(AuthGuard)
  async unpinToComment(@Param('id') id: string, @Request() request) {
    const user = request.user; // 从请求中获取用户信息

    const updatedPost = await this.postService.unpinToComment(id, user.id);
    return updatedPost;
  }

  @Patch(':id/like-and-view-counts')
  @UseGuards(AuthGuard)
  async updateLikeAndviewtsDisabled(
    @Param('id') id: string,
    @Request() request,
    @Body('likeAndViewCountDisabled') likeAndViewCountDisabled: boolean,
  ) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    const updatedPost = await this.postService.updateLikeAndviewtsDisabled(
      id,
      likeAndViewCountDisabled,
    );
    return updatedPost;
  }

  @Patch(':id/unpin')
  @UseGuards(AuthGuard)
  async unpinPost(@Param('id') id: string, @Request() request) {
    const user = request.user; // 从请求中获取用户信息
    if (!(await this.postService.checkIsPostOwner(id, user?.id))) {
      throw new HttpException('Unauthorized', 401); // 如果用户不是帖子的所有者，抛出异常
    }

    const updatedPost = await this.postService.unpinToProfile(id);
    return updatedPost;
  }

  @Get('/detail/:code')
  async getPostDetail(@Param('code') code: string, @Req() req: _Request) {
    return this.postService.findPostParentChainByCode(code, req.user?.id);
  }

  @Get('/replies/uid/:uid')
  async getUserReplies(
    @Param('uid') uid: string,
    @Query('pageSize') pageSize: number,
    @Query('page') page: number,
    @Req() req: _Request,
  ) {
    return this.postService.findRepliesByUid(uid, req.user?.id, page, pageSize);
  }

  @Get('/profile-pinned')
  @UseGuards(AuthGuard)
  async getUserPinned(@Req() req: _Request) {
    return this.postService.getUserPinned(req.user?.id);
  }

  @Get('/:id/pinned')
  @UseGuards(AuthGuard)
  async getPostCommentPinned(@Param('id') id: string) {
    return this.postService.getPostCommentPinned(id);
  }

  @Get('/replies/:id')
  async getUserRepost(
    @Param('id') id: string,
    @Query('pageSize') pageSize: number,
    @Query('page') page: number,
    @Query('excludePostCode') excludePostCode: string,
    @Req() req: _Request,
  ) {
    return this.postService.findReplyPostsById(
      id,
      req.user?.id,
      page,
      pageSize,
      excludePostCode,
    );
  }

  @Get('timeline-after-id/:id?')
  async getTimelineAfterId(
    @Param('id') id: string,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ): Promise<{ posts: any }> {
    return this.postService.findTimeLinePostsAfterId(
      req.user?.id,
      id,
      pageSize,
    );
  }

  @Get('reply-after-id/:id?')
  @UseGuards(AuthGuard)
  async getCommentAfterId(
    @Param('id') id: string,
    @Query('replyId') replyId: string,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ): Promise<{ posts: any }> {
    return this.postService.getReplyAfterId(
      req.user?.id,
      id,
      replyId,
      pageSize,
    );
  }

  @Get('following-posts')
  async getFollowingPosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ): Promise<{ total: number; posts: any }> {
    return this.postService.findFollowingPosts(req.user?.id, page, pageSize);
  }

  @Get('following-posts-after-id/:id?')
  async getFollowingPostsAfterId(
    @Param('id') id: string,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ): Promise<{ posts: any }> {
    return this.postService.findFollowingPostsAfterId(
      req.user?.id,
      id,
      pageSize,
    );
  }

  @Get('/search')
  async findPostsByQuery(
    @Query('caption') caption: string,
    @Query('tag') tag: string,
    @Query('filter') filter: 'recent',
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ) {
    return await this.postService.findPostsByQuery(
      { caption, tag, filter },
      req.user?.id,
      page,
      pageSize,
    );
  }

  @Get(':id')
  async findPostById(@Param('id') id: string, @Req() req: _Request) {
    return this.postService.findPostById(id, req.user?.id);
  }
}
