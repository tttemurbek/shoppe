import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { JewelleryLocation, JewelleryStatus, JewelleryType } from '../../enums/jewellery.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Jewellery {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => JewelleryType)
	jewelleryType: JewelleryType;

	@Field(() => JewelleryStatus)
	jewelleryStatus: JewelleryStatus;

	@Field(() => JewelleryLocation)
	jewelleryLocation: JewelleryLocation;

	@Field(() => String)
	jewelleryAddress: string;

	@Field(() => String)
	jewelleryTitle: string;

	@Field(() => Number)
	jewelleryPrice: number;

	@Field(() => Number)
	jewelleryGram: number;

	@Field(() => Int)
	jewelleryViews: number;

	@Field(() => Int)
	jewelleryLikes: number;

	@Field(() => Int)
	jewelleryComments: number;

	@Field(() => Int)
	jewelleryRank: number;

	@Field(() => [String])
	jewelleryImages: string[];

	@Field(() => String, { nullable: true })
	jewelleryDesc: string;

	@Field(() => Boolean)
	jewelleryBarter: boolean;

	@Field(() => Boolean)
	jewelleryRent: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	/** from aggregation */

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Jewelleries {
	@Field(() => [Jewellery])
	list: Jewellery[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
