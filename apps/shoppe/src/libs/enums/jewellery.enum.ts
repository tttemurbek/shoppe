import { registerEnumType } from '@nestjs/graphql';

export enum JewelleryType {
	RING = 'RING',
	NECKLACE = 'NECKLACE',
	EARRING = 'EARRING',
}
registerEnumType(JewelleryType, {
	name: 'JewelleryType',
});

export enum JewelleryStatus {
	AVAILABLE = 'AVAILABLE',
	OUT_OF_STOCK = 'OUT_OF_STOCK',
	RESERVED = 'RESERVED',
}
registerEnumType(JewelleryStatus, {
	name: 'JewelleryStatus',
});

export enum JewelleryLocation {
	ONLINE_STORE = 'ONLINE_STORE',
	BRANCH_SEOUL = 'BRANCH_SEOUL',
	BRANCH_BUSAN = 'BRANCH_BUSAN',
	BRANCH_DAEGU = 'BRANCH_DAEGU',
	BRANCH_GWANGJU = 'BRANCH_GWANGJU',
	BRANCH_JEJU = 'BRANCH_JEJU',
}
registerEnumType(JewelleryLocation, {
	name: 'JewelleryLocation',
});
