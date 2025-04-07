import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
	public async signup(): Promise<string> {
		return 'signup Executed';
	}

	public async login(): Promise<string> {
		return 'login Executed';
	}

	public async updateMember(): Promise<string> {
		return 'updateMember Executed';
	}

	public async getMember(): Promise<string> {
		return 'getMember Executed';
	}
}
