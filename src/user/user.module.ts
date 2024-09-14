import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import TypeORM for the User entity
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export UserService to allow other modules to use it
})
export class UserModule {}
