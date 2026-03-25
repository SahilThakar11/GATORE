import { mockReset } from 'jest-mock-extended';
import { prismaMock } from './__mocks__/prisma';

// Reset the Prisma mock before every test to prevent state leaking between tests
beforeEach(() => {
  mockReset(prismaMock);
});
