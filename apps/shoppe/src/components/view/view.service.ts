import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/jewellery/jewellery.input';
import { Jewelleries } from '../../libs/dto/jewellery/jewellery';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistance(input);
		if (!viewExist) {
			console.log(' - New View Insert -');
			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistance(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		console.log(search);

		return await this.viewModel.findOne(search).exec();
	}

	public async getVisitedJewelleries(memberId: ObjectId, input: OrdinaryInquiry): Promise<Jewelleries> {
		const { page, limit } = input;
		const match: T = {
			viewGroup: ViewGroup.JEWELLERY,
			memberId: memberId,
		};

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'jewelleries',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedJewellery',
					},
				},
				{ $unwind: '$visitedJewellery' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedJewellery.memberData' },
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

		result.list = data[0].list.map((ele) => ele.visitedJewellery);
		console.log('1111112121212', result);

		return result;
	}
}
