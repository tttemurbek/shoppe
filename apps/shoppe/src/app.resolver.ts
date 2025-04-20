import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class AppResolver {
	@Query(() => String)
	public sayHello() {
		return 'GraphQL API is up and running!';
	}
}
