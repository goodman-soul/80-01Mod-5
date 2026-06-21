import { Controller, Get, Param, Query } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentCategory, EquipmentStatus } from '../../common/types';

@Controller('api/equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get('types')
  getTypes(@Query('category') category?: EquipmentCategory) {
    return this.equipmentService.getAllTypes(category);
  }

  @Get('types/:id')
  getTypeById(@Param('id') id: string) {
    return this.equipmentService.getTypeById(id);
  }

  @Get('types/:id/alternatives')
  getAlternatives(@Param('id') id: string) {
    return this.equipmentService.getAlternativeTypes(id);
  }

  @Get('types/:id/equipments')
  getEquipmentsByType(
    @Param('id') typeId: string,
    @Query('status') status?: EquipmentStatus,
  ) {
    return this.equipmentService.getEquipmentsByType(typeId, status);
  }

  @Get('types/:id/available')
  getAvailable(@Param('id') typeId: string) {
    return this.equipmentService.getAvailableEquipments(typeId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.equipmentService.getEquipmentById(id);
  }
}
