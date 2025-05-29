import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import JewellerySchema from 'apps/shoppe/src/schemas/Jewellery.model';
import MemberSchema from 'apps/shoppe/src/schemas/Member.model';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([
			{
				name: 'Jewellery',
				schema: JewellerySchema,
			},
		]),
		MongooseModule.forFeature([
			{
				name: 'Member',
				schema: MemberSchema,
			},
		]),
	],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
