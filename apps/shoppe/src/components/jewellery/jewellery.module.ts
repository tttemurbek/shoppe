import { Module } from '@nestjs/common';
import { JewelleryResolver } from './jewellery.resolver';
import { JewelleryService } from './jewellery.service';
import { MongooseModule } from '@nestjs/mongoose';
import JewellerySchema from '../../schemas/Jewellery.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Jewellery', schema: JewellerySchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
	],
	providers: [JewelleryResolver, JewelleryService],
	exports: [JewelleryService],
})
export class JewelleryModule {}
