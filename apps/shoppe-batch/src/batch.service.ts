import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/shoppe/src/libs/dto/member/member';
import { Jewellery } from 'apps/shoppe/src/libs/dto/jewellery/jewellery';
import { MemberStatus, MemberType } from 'apps/shoppe/src/libs/enums/member.enum';
import { JewelleryStatus } from 'apps/shoppe/src/libs/enums/jewellery.enum';
import { Model } from 'mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Jewellery') private readonly jewelleryModel: Model<Jewellery>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.jewelleryModel
			.updateMany(
				{
					jewelleryStatus: JewelleryStatus.AVAILABLE,
				},
				{ jewelleryRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopJewelleries(): Promise<void> {
		const jewelleries: Jewellery[] = await this.jewelleryModel
			.find({
				jewelleryStatus: JewelleryStatus.AVAILABLE,
				jewelleryRank: 0,
			})
			.exec();

		const promisedList = jewelleries.map(async (ele: Jewellery) => {
			const { _id, jewelleryLikes, jewelleryViews } = ele;
			const rank = jewelleryLikes * 2 + jewelleryViews * 1;
			return await this.jewelleryModel.findOneAndUpdate(_id, { jewelleryRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberType: MemberType.AGENT,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberJewelleries, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberJewelleries * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}

	public getHello(): string {
		return 'Welcome to Shoppe-BATCH server!';
	}
}
