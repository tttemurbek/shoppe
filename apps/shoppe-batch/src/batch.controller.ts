import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLBACK, BATCH_TOP_AGENTS, BATCH_TOP_JEWELLERIES } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Cron('00 * * * * *', { name: BATCH_ROLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLBACK;
			this.logger.debug('Executed');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_JEWELLERIES })
	public async batchTopJewelleries() {
		try {
			this.logger['context'] = BATCH_TOP_JEWELLERIES;
			this.logger.debug('Executed');
			await this.batchService.batchTopJewelleries();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_AGENTS })
	public async batchTopAgents() {
		try {
			this.logger['context'] = BATCH_TOP_AGENTS;
			this.logger.debug('Executed');
			await this.batchService.batchTopAgents();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Timeout(1000)
	handleTimeOut() {
		this.logger.debug('BATCH SERVER IS READY!');
	}

	// Interval
	@Interval(1000)
	handleInterval() {
		this.logger.debug('Interval Test');
	}
	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
