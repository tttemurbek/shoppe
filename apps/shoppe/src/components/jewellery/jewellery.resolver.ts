import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { JewelleryService } from './jewellery.service';
import { Jewellery, Jewelleries } from '../../libs/dto/jewellery/jewellery';
import {
	AgentJewelleriesInquiry,
	AllJewelleriesInquiry,
	OrdinaryInquiry,
	JewelleriesInquiry,
	JewelleryInput,
} from '../../libs/dto/jewellery/jewellery.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { JewelleryUpdate } from '../../libs/dto/jewellery/jewellery.update';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class JewelleryResolver {
	constructor(private readonly jewelleryService: JewelleryService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Jewellery)
	public async createJewellery(
		@Args('input') input: JewelleryInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewellery> {
		console.log('Mutation: createJewellery');
		input.memberId = memberId;
		return await this.jewelleryService.createJewellery(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Jewellery)
	public async getJewellery(
		@Args('jewelleryId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewellery> {
		console.log('Query getJewellery');
		const jewelleryId = shapeIntoMongoObjectId(input);
		return await this.jewelleryService.getJewellery(memberId, jewelleryId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Jewellery)
	public async updateJewellery(
		@Args('input') input: JewelleryUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewellery> {
		console.log('Mutation: updateJewellery');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.jewelleryService.updateJewellery(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Jewelleries)
	public async getJewelleries(
		@Args('input') input: JewelleriesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewelleries> {
		console.log('Query getJewelleries');
		return await this.jewelleryService.getJewelleries(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Jewelleries)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewelleries> {
		console.log('Query getFavorites');
		return await this.jewelleryService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Jewelleries)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewelleries> {
		console.log('Query getVisited');
		return await this.jewelleryService.getVisited(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query((returns) => Jewelleries)
	public async getAgentJewelleries(
		@Args('input') input: AgentJewelleriesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewelleries> {
		console.log('Query: getAgentJewelleries');
		return await this.jewelleryService.getAgentJewelleries(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Jewellery)
	public async likeTargetJewellery(
		@Args('jewelleryId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Jewellery> {
		console.log('Mutation: likeTargetJewellery');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.jewelleryService.likeTargetJewellery(memberId, likeRefId);
	}

	/**ADMIN */

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Jewelleries)
	public async getAllJewelleriesByAdmin(@Args('input') input: AllJewelleriesInquiry): Promise<Jewelleries> {
		console.log('Query: getAllJewelleriesByAdmin');
		return await this.jewelleryService.getAllJewelleriesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Jewellery)
	public async updateJewelleryByAdmin(@Args('input') input: JewelleryUpdate): Promise<Jewellery> {
		console.log('Mutation: updateJewelleryByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.jewelleryService.updateJewelleryByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Jewellery)
	public async removeJewelleryByAdmin(@Args('jewelleryId') input: string): Promise<Jewellery> {
		console.log('QueMutationry: removeJewelleryByAdmin');
		console.log('jewelleryId', input);

		const jewelleryId = shapeIntoMongoObjectId(input);
		return await this.jewelleryService.removeJewelleryByAdmin(jewelleryId);
	}
}
