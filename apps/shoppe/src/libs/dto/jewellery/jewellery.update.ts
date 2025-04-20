import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { JewelleryLocation, JewelleryStatus, JewelleryType } from '../../enums/jewellery.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class JewelleryUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => JewelleryType, { nullable: true })
	jewelleryType?: JewelleryType;

	@IsOptional()
	@Field(() => JewelleryStatus, { nullable: true })
	jewelleryStatus?: JewelleryStatus;

	@IsOptional()
	@Field(() => JewelleryLocation, { nullable: true })
	jewelleryLocation?: JewelleryLocation;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	jewelleryAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	jewelleryTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	jewelleryPrice?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	jewelleryGram?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	jewelleryImages?: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	jewelleryDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jewelleryBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	jewelleryRent?: boolean;

	soldAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
