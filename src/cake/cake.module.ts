import { Module } from '@nestjs/common';
import { CakeController } from './cake.controller';

@Module({
  providers: [],
  controllers: [CakeController],
})
export class CakeModule {}
