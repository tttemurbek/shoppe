// src/libs/enums/faq.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum FaqCategory {
  GENERAL = 'GENERAL',
  ACCOUNT = 'ACCOUNT',
  PAYMENT = 'PAYMENT',
  SERVICE = 'SERVICE',
  SECURITY = 'SECURITY',
  POLICY = 'POLICY',
  OTHER = 'OTHER',
}

export enum FaqStatus {
  HOLD = 'HOLD',
  ACTIVE = 'ACTIVE',
  DELETE = 'DELETE',
}

registerEnumType(FaqCategory, {
  name: 'FaqCategory',
});

registerEnumType(FaqStatus, {
  name: 'FaqStatus',
});