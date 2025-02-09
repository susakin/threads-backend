import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpException,
  Req,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get('user-activities/:type?')
  @UseGuards(AuthGuard)
  async findByTo(
    @Request() request,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Param('type') type: string,
  ) {
    const currentUid = request.user?.id;
    return this.activityService.findByTo(currentUid, type, page, pageSize);
  }

  @Get('new-activities-after-id/:type?')
  @UseGuards(AuthGuard)
  async newActivitiesAfterId(
    @Request() request,
    @Query('id') id: string,
    @Query('pageSize') pageSize: number,
    @Param('type') type: string, // 可选的 'type' 参数
  ) {
    const currentUid = request.user?.id;
    const newActivities = await this.activityService.getNewActivitiesAfterId(
      currentUid,
      id,
      type,
      pageSize,
    );
    return newActivities;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Request() request, @Param('id') id: string) {
    const currentUid = request.user?.id;

    const activity = await this.activityService.findById(id);
    if (activity.to !== currentUid) {
      throw new HttpException('Unauthorized', 401);
    }
    return this.activityService.delete(id);
  }

  @Get('/post/:postId')
  async getPostSummary(
    @Param('postId') postId: string,
    //@Query('activityCount') activityCount: number,
    @Req() req: _Request,
  ) {
    const currentUid = req.user?.id;
    const summary = await this.activityService.getPostSummary(
      currentUid,
      postId,
      20,
    );
    return summary;
  }

  @Get('/post/:postCode/:type')
  async getPostActivity(
    @Param('postCode') postCode: string,
    @Param('type') type: string,
    @Query('pageSize') pageSize: number,
    @Query('page') page: number,
    @Req() req: _Request,
  ) {
    const currentUid = req.user?.id;
    const summary = await this.activityService.findByPostCode(
      postCode,
      currentUid,
      type,
      page,
      pageSize,
    );
    return summary;
  }

  @Post('/mark-as-read')
  @UseGuards(AuthGuard)
  async markActivitiesAsRead(@Request() request, @Body('ids') ids: string[]) {
    const currentUid = request.user?.id;
    try {
      const modifiedCount = await this.activityService.markActivitiesAsRead(
        currentUid,
        ids,
      );
      return { modifiedCount };
    } catch (error) {
      throw new HttpException('Internal Server Error', 500);
    }
  }

  @Get('/unread')
  @UseGuards(AuthGuard)
  async hasUnreadActivity(@Request() request) {
    return await this.activityService.getUnreadActivityNum(request.user?.id);
  }
}
