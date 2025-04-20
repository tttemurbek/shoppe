import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	JEWELLERY = 'JEWELLERY',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
