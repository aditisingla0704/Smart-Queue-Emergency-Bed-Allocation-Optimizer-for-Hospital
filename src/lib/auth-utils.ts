import { auth } from './auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import type { Session } from 'next-auth';

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(roles: string[]): Promise<Session> {
  const session = await requireAuth();
  if (!roles.includes(session.user.role)) {
    redirect('/unauthorized');
  }
  return session;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
