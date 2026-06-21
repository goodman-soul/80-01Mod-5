import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [EquipmentModule],
  controllers: [WarehouseController],
  providers: [WarehouseService, MockRepository],
  exports: [WarehouseService],
})
export class WarehouseModule {}
