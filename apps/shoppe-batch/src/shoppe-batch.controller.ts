import { Controller, Get } from '@nestjs/common';
import { ShoppeBatchService } from './shoppe-batch.service';

@Controller()
export class ShoppeBatchController {
  constructor(private readonly shoppeBatchService: ShoppeBatchService) {}

  @Get()
  getHello(): string {
    return this.shoppeBatchService.getHello();
  }
}
