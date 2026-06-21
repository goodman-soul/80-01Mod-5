import { Controller, Get, Post, Body, Param, HttpCode } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import type {
  ShipDto,
  ReturnItemDto,
  CompleteCleaningDto,
  RestockDto,
} from './warehouse.service';

@Controller('api/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('pending-shipments')
  getPendingShipments() {
    return this.warehouseService.getPendingShipments();
  }

  @Post('ship')
  @HttpCode(200)
  ship(@Body() dto: ShipDto) {
    return this.warehouseService.ship(dto);
  }

  @Get('shipments/:borrowRequestId')
  getShipment(@Param('borrowRequestId') borrowRequestId: string) {
    return this.warehouseService.getShipmentByBorrowRequest(borrowRequestId);
  }

  @Post('return')
  @HttpCode(200)
  returnItem(@Body() dto: ReturnItemDto) {
    return this.warehouseService.returnItem(dto);
  }

  @Get('pending-returns')
  getPendingReturns() {
    return this.warehouseService.getPendingReturns();
  }

  @Post('complete-cleaning')
  @HttpCode(200)
  completeCleaning(@Body() dto: CompleteCleaningDto) {
    return this.warehouseService.completeCleaning(dto);
  }

  @Post('restock')
  @HttpCode(200)
  restock(@Body() dto: RestockDto) {
    return this.warehouseService.restock(dto);
  }
}
