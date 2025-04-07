import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { JewelleryModule } from './jewellery/jewellery.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		JewelleryModule,
		BoardArticleModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FollowModule,
	],
})
export class ComponentsModule {}
