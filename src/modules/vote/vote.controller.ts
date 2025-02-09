import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { VoteService } from './vote.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateVoteDto } from './dto/create-vote.dto';

@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createPost(@Body() createVoteDto: CreateVoteDto, @Request() request) {
    createVoteDto.uid = request.user?.id;
    return this.voteService.create(createVoteDto);
  }
}
