import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Role } from './role.enum';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signUp(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: Role,
  ) {
    return this.userService.signUp(username, email, password, role);
  }
}
