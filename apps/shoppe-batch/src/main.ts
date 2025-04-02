import { NestFactory } from '@nestjs/core';
import { ShoppeBatchModule } from './shoppe-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(ShoppeBatchModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
