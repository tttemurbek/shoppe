import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_ROLBACK, BATCH_TOP_AGENTS, BATCH_TOP_JEWELLERIES } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('SocketEventsGateway');

	constructor(private readonly BatchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('00 00 01 * * *', { name: BATCH_ROLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLBACK;
			this.logger.debug('EXECUTED!');
			await this.BatchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 00 01 * * *', { name: BATCH_TOP_JEWELLERIES })
	public async batchTopFacilities() {
		try {
			this.logger['context'] = BATCH_TOP_JEWELLERIES;
			this.logger.debug('EXECUTED!');
			await this.BatchService.batchTopJewelleries();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 00 01 * * *', { name: BATCH_TOP_AGENTS })
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('EXECUTED!');
			await this.BatchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	/* 
  	@Interval(1000)
	handleInterval() {
		this.logger.debug('INTERVAL TEST');
	}*/
	@Get()
	getHello(): string {
		return this.BatchService.getHello();
	}
}