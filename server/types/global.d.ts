import { MojoContext as BaseMojoContext } from '@mojojs/core';
import { PrismaClient } from '@prisma/client';

declare global {
  type MojoContext = BaseMojoContext;
}

declare module '@mojojs/core/lib/types' {
  interface SessionData {
    username?: string;
  }
}

declare module '@mojojs/core/lib/app' {
  interface App {
    prisma: PrismaClient;
  }
}
