import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	@UsePipes(ValidationPipe)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		try {
			console.log('Mutation signup called');
			console.log('Signup Input:', input);
			return this.memberService.signup(input);
		} catch (error) {
			console.error('Error in signup:', error);
			throw new InternalServerErrorException(error);
		}
	}

	@Mutation(() => Member)
	@UsePipes(ValidationPipe)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		try {
			console.log('Mutation login called');
			console.log('Login Input:', input);
			return this.memberService.login(input);
		} catch (error) {
			console.error('Error in signup:', error);
			throw new InternalServerErrorException(error);
		}
	}

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		console.log('Mutation updateMember called');
		return this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query getMember called');
		return this.memberService.getMember();
	}
}
