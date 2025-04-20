import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import FollowSchema from '../../schemas/Follow.model';
import { AuthModule } from '../auth/auth.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import { JewelleryModule } from '../jewellery/jewellery.module';
import { ViewModule } from '../view/view.module';
import { BoardArticleModule } from '../board-article/board-article.module';
import { FollowResolver } from './follow.resolver';
import { FollowService } from './follow.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Follow',
				schema: FollowSchema,
			},
		]),
		AuthModule,
		MemberModule,
		LikeModule,
		JewelleryModule,
		ViewModule,
		BoardArticleModule,
		ViewModule,
	],
	providers: [FollowResolver, FollowService],
	exports: [FollowService],
})
export class FollowModule {}
