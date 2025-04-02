import { Module } from '@nestjs/common';
import { ShoppeBatchController } from './shoppe-batch.controller';
import { ShoppeBatchService } from './shoppe-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ShoppeBatchController],
  providers: [ShoppeBatchService],
})
export class ShoppeBatchModule {}
