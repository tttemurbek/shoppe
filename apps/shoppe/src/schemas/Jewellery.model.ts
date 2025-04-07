import { Schema } from 'mongoose';
import { JewelleryLocation, JewelleryStatus, JewelleryType } from '../libs/enums/jewellery.enum';

const JewellerySchema = new Schema(
	{
		jewelleryType: {
			type: String,
			enum: JewelleryType,
			required: true,
		},

		jewelleryStatus: {
			type: String,
			enum: JewelleryStatus,
			default: JewelleryStatus.AVAILABLE,
		},

		jewelleryLocation: {
			type: String,
			enum: JewelleryLocation,
			required: true,
		},

		jewelleryAddress: {
			type: String,
			required: true,
		},

		jewelleryTitle: {
			type: String,
			required: true,
		},

		jewelleryPrice: {
			type: Number,
			required: true,
		},

		jewelleryViews: {
			type: Number,
			default: 0,
		},

		jewelleryLikes: {
			type: Number,
			default: 0,
		},

		jewelleryComments: {
			type: Number,
			default: 0,
		},

		jewelleryRank: {
			type: Number,
			default: 0,
		},

		jewelleryImages: {
			type: [String],
			required: true,
		},

		jewelleryDesc: {
			type: String,
		},

		jewelleryBarter: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'jewelleries' },
);

JewellerySchema.index(
	{ jewelleryType: 1, jewelleryLocation: 1, jewelleryTitle: 1, jewelleryPrice: 1 },
	{ unique: true },
);

export default JewellerySchema;
