import { prisma } from './db';

export async function logAudit(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | string;
}): Promise<void> {
  const detailsStr = typeof params.details === 'string'
    ? params.details
    : JSON.stringify(params.details || {});

  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: detailsStr,
    },
  });
}
