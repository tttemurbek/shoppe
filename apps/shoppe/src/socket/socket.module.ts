import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { GeminiService } from './gemini.service';
import { AuthModule } from '../components/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [AuthModule, ConfigModule],
	providers: [SocketGateway, GeminiService],
	exports: [GeminiService],
})
export class SocketModule {}
