import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Jewelleries, Jewellery } from '../../libs/dto/jewellery/jewellery';
import { Direction, Message } from '../../libs/enums/common.enum';
import {
	AgentJewelleriesInquiry,
	AllJewelleriesInquiry,
	OrdinaryInquiry,
	JewelleriesInquiry,
	JewelleryInput,
} from '../../libs/dto/jewellery/jewellery.input';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { JewelleryStatus } from '../../libs/enums/jewellery.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { JewelleryUpdate } from '../../libs/dto/jewellery/jewellery.update';
import * as moment from 'moment';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';

@Injectable()
export class JewelleryService {
	constructor(
		@InjectModel('Jewellery') private readonly jewelleryModel: Model<Jewellery>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createJewellery(input: JewelleryInput): Promise<Jewellery> {
		try {
			const result = await this.jewelleryModel.create(input);
			// Increase memberJewelleries +1
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberJewelleries', modifier: 1 });
			return result;
		} catch (err) {
			console.log('Error, jewellery.Service.model:', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getJewellery(memberId: ObjectId, jewelleryId: ObjectId): Promise<Jewellery> {
		const search: T = {
			_id: jewelleryId,
			jewelleryStatus: JewelleryStatus.AVAILABLE,
		};
		console.log('jewellery.service.ts getJewellery');

		const targetJewellery: Jewellery = await this.jewelleryModel.findOne(search).lean().exec();
		if (!targetJewellery) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: jewelleryId, viewGroup: ViewGroup.JEWELLERY };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.jewelleryStatsEditor({ _id: jewelleryId, targetKey: 'jewelleryViews', modifier: 1 });
				targetJewellery.jewelleryViews++;
			}

			const likeInput = { memberId: memberId, likeRefId: jewelleryId, likeGroup: LikeGroup.JEWELLERY };
			targetJewellery.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetJewellery.memberData = await this.memberService.getMember(null, targetJewellery.memberId);
		return targetJewellery;
	}

	public async updateJewellery(memberId: ObjectId, input: JewelleryUpdate): Promise<Jewellery> {
		let { jewelleryStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			jewelleryStatus: JewelleryStatus.AVAILABLE,
		};

		if (jewelleryStatus === JewelleryStatus.OUT_OF_STOCK) soldAt = moment().toDate();
		else if (jewelleryStatus === JewelleryStatus.RESERVED) deletedAt = moment().toDate();

		const result = await this.jewelleryModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberJewelleries',
				modifier: -1,
			});
		}

		return result;
	}

	public async getJewelleries(memberId: ObjectId, input: JewelleriesInquiry): Promise<Jewelleries> {
		const match: T = { jewelleryStatus: JewelleryStatus.AVAILABLE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.jewelleryModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: JewelleriesInquiry): void {
		const {
			memberId,
			locationList,
			roomsList,
			bedsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.jewelleryLocation = { $in: locationList };
		if (typeList && typeList.length) match.jewelleryType = { $in: typeList };

		if (pricesRange) match.jewelleryPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (squaresRange) match.jewelleryGram = { $gte: squaresRange.start, $lte: squaresRange.end };

		if (text) match.jewelleryTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
		}
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jewelleries> {
		return await this.likeService.getFavoriteJewelleries(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jewelleries> {
		return await this.viewService.getVisitedJewelleries(memberId, input);
	}

	public async getAgentJewelleries(memberId: ObjectId, input: AgentJewelleriesInquiry): Promise<Jewelleries> {
		const { jewelleryStatus } = input.search;
		console.log('jewellery.service.ts getAgentJewelleries', input);

		if (jewelleryStatus === JewelleryStatus.RESERVED) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			jewelleryStatus: jewelleryStatus ?? { $ne: JewelleryStatus.RESERVED },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.jewelleryModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetJewellery(memberId: ObjectId, likeRefId: ObjectId): Promise<Jewellery> {
		console.log('passed here 1');
		console.log(`${memberId}, ${likeRefId}`);

		const target: Jewellery = await this.jewelleryModel
			.findOne({ _id: likeRefId, jewelleryStatus: JewelleryStatus.AVAILABLE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		console.log('passed here 1');

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.JEWELLERY,
		};
		console.log('passed here 1');

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.jewelleryStatsEditor({
			_id: likeRefId,
			targetKey: 'jewelleryLikes',
			modifier: modifier,
		});

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllJewelleriesByAdmin(input: AllJewelleriesInquiry): Promise<Jewelleries> {
		const { jewelleryStatus, jewelleryLocationList } = input.search;
		const match: T = {};
		const sort: T = {
			[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
		};

		if (jewelleryStatus) match.jewelleryStatus = jewelleryStatus;
		if (jewelleryLocationList) match.jewelleryLocation = { $in: jewelleryLocationList };

		const result = await this.jewelleryModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateJewelleryByAdmin(input: JewelleryUpdate): Promise<Jewellery> {
		let { jewelleryStatus, soldAt, deletedAt } = input;
		const search: T = {
			_id: input._id,
			jewelleryStatus: JewelleryStatus.AVAILABLE,
		};

		if (jewelleryStatus === JewelleryStatus.OUT_OF_STOCK) soldAt = moment().toDate();
		else if (jewelleryStatus === JewelleryStatus.RESERVED) deletedAt = moment().toDate();

		const result = await this.jewelleryModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberJewelleries',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeJewelleryByAdmin(jewelleryId: ObjectId): Promise<Jewellery> {
		const search: T = { _id: jewelleryId, jewelleryStatus: JewelleryStatus.RESERVED };
		const result = await this.jewelleryModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async jewelleryStatsEditor(input: StatisticModifier): Promise<Jewellery> {
		const { _id, targetKey, modifier } = input;
		return await this.jewelleryModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}
