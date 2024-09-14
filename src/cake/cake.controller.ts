import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../user/roles.decorator';
import { Role } from '../user/role.enum';
import { JwtAuthGuard } from '../user/jwt-auth.guard';
import { RolesGuard } from '../user/roles.guard';

@Controller('cakes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CakeController {
  @Get()
  @Roles(Role.Customer, Role.Admin)
  findAllCakes() {
    return 'All available cakes';
  }

  @Post()
  @Roles(Role.Admin)
  createCake() {
    return 'Cake created';
  }
}
