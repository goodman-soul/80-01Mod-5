import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { BorrowModule } from './modules/borrow/borrow.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ReservationModule } from './modules/reservation/reservation.module';

@Module({
  imports: [
    DatabaseModule,
    EquipmentModule,
    BorrowModule,
    WarehouseModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
