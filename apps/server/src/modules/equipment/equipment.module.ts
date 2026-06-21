import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { MockRepository } from '../../database/mock-repository';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService, MockRepository],
  exports: [EquipmentService],
})
export class EquipmentModule {}
