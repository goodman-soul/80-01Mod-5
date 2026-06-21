import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { MockRepository } from '../../database/mock-repository';
import { EquipmentModule } from '../equipment/equipment.module';

@Module({
  imports: [EquipmentModule],
  controllers: [BorrowController],
  providers: [BorrowService, MockRepository],
  exports: [BorrowService],
})
export class BorrowModule {}
