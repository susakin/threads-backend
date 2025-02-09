import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Query,
  Request,
  Req,
  Delete,
} from '@nestjs/common';
import { UserRelationService } from './user-relation.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('user-relation')
export class UserRelationController {
  constructor(private readonly userRelationService: UserRelationService) {}

  @Post('follow/:uid')
  @UseGuards(AuthGuard)
  async followUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.followUser(request.user?.id, uid);
  }

  @Post('unfollow/:uid')
  @UseGuards(AuthGuard)
  async unfollowUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.unfollowUser(request.user?.id, uid);
  }

  @Delete('follow/:uid')
  @UseGuards(AuthGuard)
  async deleteFollowUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.unfollowUser(uid, request.user?.id);
  }

  @Post('block/:uid')
  @UseGuards(AuthGuard)
  async blockUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.buildRelation(
      request.user?.id,
      uid,
      'blocking',
    );
  }

  @Post('unblock/:uid')
  @UseGuards(AuthGuard)
  async unblockUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.dissolveRelation(
      request.user?.id,
      uid,
      'blocking',
    );
  }

  @Post('restricte/:uid')
  @UseGuards(AuthGuard)
  async restricteUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.buildRelation(
      request.user?.id,
      uid,
      'restricting',
    );
  }

  @Post('unrestricte/:uid')
  @UseGuards(AuthGuard)
  async unrestricteUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.dissolveRelation(
      request.user?.id,
      uid,
      'restricting',
    );
  }

  @Post('mute/:uid')
  @UseGuards(AuthGuard)
  async muteUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.buildRelation(
      request.user?.id,
      uid,
      'muting',
    );
  }

  @Post('unmute/:uid')
  @UseGuards(AuthGuard)
  async unmuteUser(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.dissolveRelation(
      request.user?.id,
      uid,
      'muting',
    );
  }

  @Post('unfollow-request/:uid')
  @UseGuards(AuthGuard)
  async deleteFollowRequest(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.unFollowPrivateUser(uid, request.user?.id);
  }

  @Post('follow-request/:uid')
  @UseGuards(AuthGuard)
  async followRequest(@Param('uid') uid: string, @Request() request) {
    await this.userRelationService.followPrivateUser(uid, request.user?.id);
  }

  @Get('following/:uid')
  //@UseGuards(AuthGuard)
  async getFollowingList(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Param('uid') uid: string,
    @Req() req: _Request,
  ) {
    return this.userRelationService.getFollowingList(
      uid,
      req?.user?.id,
      page,
      pageSize,
    );
  }

  @Get('follower/:uid')
  //@UseGuards(AuthGuard)
  async getFollowerList(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Param('uid') uid: string,
    @Req() req: _Request,
  ) {
    return this.userRelationService.getFollowerList(
      uid,
      req?.user?.id,
      page,
      pageSize,
    );
  }
}
