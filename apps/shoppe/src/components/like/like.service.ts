import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { Model, ObjectId } from 'mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/jewellery/jewellery.input';
import { Jewelleries } from '../../libs/dto/jewellery/jewellery';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		console.log('passed here 3');

		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;
		console.log('passed here 4');
		console.log('EXIST', exist);

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error: likeServiceModel', err);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`like modifier is ${modifier}`);

		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteJewelleries(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jewelleries> {
		const { page, limit } = input;
		const match: T = {
			likeGroup: LikeGroup.JEWELLERY,
			memberId: memberId,
		};

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'jewelleries',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favouriteJewellery',
					},
				},
				{ $unwind: '$favouriteJewellery' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favouriteJewellery.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		console.log('data are:', data);
		const result: Jewelleries = {
			list: [],
			metaCounter: data[0].metaCounter,
		};

		result.list = data[0].list.map((ele) => ele.favouriteJewellery);
		console.log('1111112121212', result);

		return result;
	}
}
