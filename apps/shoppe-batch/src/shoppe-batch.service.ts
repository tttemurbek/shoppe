import { Injectable } from '@nestjs/common';

@Injectable()
export class ShoppeBatchService {
  getHello(): string {
    return 'Hello World!';
  }
}
