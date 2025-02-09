import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Request as _Request } from 'express';

@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createQuote(
    @Body() createQuoteDto: CreateQuoteDto,
    @Request() request,
  ) {
    return this.quoteService.createQuote({
      ...createQuoteDto,
      uid: request.user?.id,
    });
  }

  @Get()
  async getPostQuotes(
    @Query('postId') postId: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Req() req: _Request,
  ) {
    return this.quoteService.getPostQuotes(
      postId,
      req.user?.id,
      page,
      pageSize,
    );
  }
}
