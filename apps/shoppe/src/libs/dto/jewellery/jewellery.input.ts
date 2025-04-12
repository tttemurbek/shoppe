import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { JewelleryLocation, JewelleryStatus, JewelleryType } from '../../enums/jewellery.enum';
import { ObjectId } from 'mongoose';
import { availableOptions, availableJewellerySorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class JewelleryInput {
	@IsNotEmpty()
	@Field(() => JewelleryType)
	jewelleryType: JewelleryType;

	@IsNotEmpty()
	@Field(() => JewelleryLocation)
	jewelleryLocation: JewelleryLocation;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jewelleryAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	jewelleryTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	jewelleryPrice: number;

	@IsNotEmpty()
	@Field(() => Number)
	jewelleryGram: number;

	@IsNotEmpty()
	@Field(() => [String])
	jewelleryImages: string[];

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

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}

@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class SquaresRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class PeriodsRange {
	@Field(() => Date)
	start: number;

	@Field(() => Date)
	end: number;
}

@InputType()
class PISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: ObjectId;

	@IsOptional()
	@Field(() => [JewelleryLocation], { nullable: true })
	locationList?: JewelleryLocation[];

	@IsOptional()
	@Field(() => [JewelleryType], { nullable: true })
	typeList?: JewelleryType[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	roomsList?: Number[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	bedsList?: Number[];

	@IsOptional()
	@IsIn(availableOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[];

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => SquaresRange, { nullable: true })
	squaresRange?: SquaresRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class JewelleriesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJewellerySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PISearch)
	search: PISearch;
}

@InputType()
class APISearch {
	@IsOptional()
	@Field(() => JewelleryStatus, { nullable: true })
	jewelleryStatus?: JewelleryStatus;
}

@InputType()
export class AgentJewelleriesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJewellerySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => APISearch)
	search: APISearch;
}

@InputType()
class ALPISearch {
	@IsOptional()
	@Field(() => JewelleryStatus, { nullable: true })
	jewelleryStatus?: JewelleryStatus;

	@IsOptional()
	@Field(() => [JewelleryLocation], { nullable: true })
	jewelleryLocationList?: JewelleryLocation[];
}

@InputType()
export class AllJewelleriesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableJewellerySorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALPISearch)
	search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
