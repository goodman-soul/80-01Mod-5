import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import type { CreateBorrowRequestDto } from './borrow.service';
import { BorrowRequestStatus } from '../../common/types';

@Controller('api/borrow')
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Get()
  getAll(@Query('status') status?: BorrowRequestStatus) {
    return this.borrowService.getAll(status);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.borrowService.getById(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateBorrowRequestDto) {
    return this.borrowService.create(dto);
  }

  @Post(':id/approve')
  @HttpCode(200)
  approve(@Param('id') id: string) {
    return this.borrowService.approve(id);
  }

  @Post(':id/reject')
  @HttpCode(200)
  reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.borrowService.reject(id, body.reason);
  }
}
