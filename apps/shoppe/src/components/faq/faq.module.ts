// src/modules/faq/faq.module.ts
 import { Module } from '@nestjs/common';
 import { MongooseModule } from '@nestjs/mongoose';
 import { AuthModule } from '../auth/auth.module';
 import NoticeSchema from '../../schemas/Notice.model';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';
 
 @Module({
   imports: [
     MongooseModule.forFeature([
       { name: 'Notice', schema: NoticeSchema }  // Register Notice model
     ]),
     AuthModule, 
   ],
   providers: [FaqService, FaqResolver],
   exports: [FaqService],
 })
 export class FaqModule {}