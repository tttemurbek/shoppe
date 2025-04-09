import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
		console.log('Mutation signup called');
		console.log('Signup Input:', input);
		return this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation login called');
		console.log('Login Input:', input);
		return this.memberService.login(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => String)
	public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
		console.log('Query checkAuth called');
		console.log('memberNick=>', memberNick);
		return `Hi ${memberNick}, you are authenticated!`;
	}

	@Roles(MemberType.USER, MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => String)
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query checkAuthRoles called');
		return `Hi ${authMember.memberNick}, you are authenticated, you are ${authMember.memberType}! (memberId: ${authMember._id})`;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Member> {
		console.log('Mutation updateMember called');
		delete input._id;
		return this.memberService.updateMember(memberId, input);
	}

	@Query(() => String)
	public async getMember(): Promise<string> {
		console.log('Query getMember called');
		return this.memberService.getMember();
	}

	/** ADMIN **/

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async getAllMembersByAdmin(): Promise<string> {
		return this.memberService.getAllMembersByAdmin();
	}

	// Authorization: ADMIN
	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation updateMemberByAdmin called');
		return this.memberService.updateMemberByAdmin();
	}
}
