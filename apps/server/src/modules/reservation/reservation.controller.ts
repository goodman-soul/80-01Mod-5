import { Controller, Get, Post, Param, Body, Query, HttpCode } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import type { CreateReservationDto } from './reservation.service';
import { ReservationStatus } from '../../common/types';

@Controller('api/reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  getAll(@Query('status') status?: ReservationStatus) {
    return this.reservationService.getAll(status);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.reservationService.getById(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateReservationDto) {
    return this.reservationService.create(dto);
  }

  @Post(':id/confirm')
  @HttpCode(200)
  confirm(@Param('id') id: string) {
    return this.reservationService.confirm(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.reservationService.cancel(id, body?.reason);
  }

  @Post(':id/complete')
  @HttpCode(200)
  complete(@Param('id') id: string) {
    return this.reservationService.complete(id);
  }
}
