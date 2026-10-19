import { badRequest } from '../../errors/AppError';

/* ---------- Request DTOs (validated at the edge) ---------- */

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fail = (fieldErrors: Record<string, string[]>, formErrors?: string[]): never => {
  throw badRequest('Validation failed', {
    ...(formErrors ? { formErrors } : {}),
    ...(Object.keys(fieldErrors).length > 0 ? { fieldErrors } : {}),
  });
};

const readName = (value: unknown, fieldErrors: Record<string, string[]>): string | undefined => {
  if (typeof value !== 'string') {
    fieldErrors.name = ['Name must be a string'];
    return undefined;
  }
  const name = value.trim();
  if (name.length < 1 || name.length > 100) {
    fieldErrors.name = ['Name must be between 1 and 100 characters'];
    return undefined;
  }
  return name;
};

const readEmail = (value: unknown, fieldErrors: Record<string, string[]>): string | undefined => {
  if (typeof value !== 'string') {
    fieldErrors.email = ['Email must be a string'];
    return undefined;
  }
  const email = value.trim().toLowerCase();
  if (email.length > 255 || !EMAIL.test(email)) {
    fieldErrors.email = ['Invalid email'];
    return undefined;
  }
  return email;
};

const asBody = (body: unknown): Record<string, unknown> => {
  if (isRecord(body)) return body;
  return fail({}, ['Body must be a JSON object']);
};

export const parseCreateUser = (body: unknown): CreateUserDto => {
  const input = asBody(body);
  const fieldErrors: Record<string, string[]> = {};
  const name = readName(input.name, fieldErrors);
  const email = readEmail(input.email, fieldErrors);
  if (name === undefined || email === undefined) return fail(fieldErrors);

  return { name, email };
};

export const parseUpdateUser = (body: unknown): UpdateUserDto => {
  const input = asBody(body);
  const fieldErrors: Record<string, string[]> = {};
  const dto: UpdateUserDto = {};

  if ('name' in input) {
    const name = readName(input.name, fieldErrors);
    if (name !== undefined) dto.name = name;
  }
  if ('email' in input) {
    const email = readEmail(input.email, fieldErrors);
    if (email !== undefined) dto.email = email;
  }

  if (Object.keys(fieldErrors).length > 0) return fail(fieldErrors);
  if (dto.name === undefined && dto.email === undefined) {
    return fail({}, ['Provide at least one field to update']);
  }

  return dto;
};

export const parseUserId = (params: unknown): number => {
  const raw = isRecord(params) ? params.id : undefined;
  const id = typeof raw === 'string' || typeof raw === 'number' ? Number(raw) : Number.NaN;
  if (!Number.isInteger(id) || id <= 0) return fail({ id: ['id must be a positive integer'] });
  return id;
};

/* ---------- Response DTO (what clients see) ---------- */

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}
