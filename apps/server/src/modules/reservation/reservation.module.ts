import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [EquipmentModule],
  controllers: [ReservationController],
  providers: [ReservationService, MockRepository],
  exports: [ReservationService],
})
export class ReservationModule {}
