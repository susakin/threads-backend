import { Controller, Post, UseGuards, Param, Request } from '@nestjs/common';
import { ViewService } from './view.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('view')
export class viewtController {
  constructor(private readonly viewService: ViewService) {}

  @Post(':postId')
  @UseGuards(AuthGuard)
  create(@Param('postId') postId: string, @Request() request) {
    return this.viewService.create({ postId, uid: request.user?.id });
  }
}
