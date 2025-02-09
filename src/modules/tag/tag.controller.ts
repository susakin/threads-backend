import { Controller, Get, Param, Query } from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from './schema/tag.schema';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('/:text?')
  async findUsersByQuery(
    @Param('text') text: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<{ total: number; tags: Tag[] }> {
    return this.tagService.findByText(text, page, pageSize);
  }
}
