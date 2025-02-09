import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HidePostService } from './hide-post.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('hide-post')
export class HidePostController {
  constructor(private readonly hidePostService: HidePostService) {}

  @Post(':postId')
  @UseGuards(AuthGuard)
  create(@Param('postId') postId: string, @Request() request) {
    return this.hidePostService.create({
      postId,
      uid: request.user?.id,
    });
  }

  @Delete(':postId')
  @UseGuards(AuthGuard)
  remove(@Param('postId') postId: string, @Request() request) {
    return this.hidePostService.deleteByPostId(postId, request.user?.id);
  }
}
