import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    throw new UnauthorizedException();
  }

  async signIn(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = {
      email: user.email,
      role: user.role,
      mobileNumber: user.mobileNumber,
      id: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
