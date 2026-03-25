import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Single shared mock instance — all tests import this same object.
// jest.config.js maps any import of '*/config/prisma' to this file.
const prismaMock = mockDeep<PrismaClient>();

export type PrismaMock = DeepMockProxy<PrismaClient>;
export { prismaMock };
export default prismaMock;
