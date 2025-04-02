import { Module } from '@nestjs/common';
import { ShoppeBatchController } from './shoppe-batch.controller';
import { ShoppeBatchService } from './shoppe-batch.service';

@Module({
  imports: [],
  controllers: [ShoppeBatchController],
  providers: [ShoppeBatchService],
})
export class ShoppeBatchModule {}
