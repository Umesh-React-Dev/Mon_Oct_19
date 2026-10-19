import { pool, type UserRow } from '../../config/db';
import { conflict, notFound } from '../../errors/AppError';
import type { CreateUserDto, UpdateUserDto, UserResponseDto } from './user.dto';
import type { User } from './user.interface';

/**
 * Business logic. Knows nothing about Express (no req/res).
 * Users are stored in PostgreSQL.
 */

const toUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: new Date(row.created_at),
});

const toResponse = (user: User): UserResponseDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt.toISOString(),
});

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && 'code' in err && err.code === '23505';

const getOrThrow = async (id: number): Promise<User> => {
  const result = await pool.query<UserRow>('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
  const row = result.rows[0];
  if (!row) throw notFound(`User ${id} not found`);
  return toUser(row);
};

const assertEmailAvailable = async (email: string, exceptId?: number): Promise<void> => {
  const result = await pool.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1 AND ($2::int IS NULL OR id <> $2)',
    [email, exceptId ?? null],
  );
  if ((result.rowCount ?? 0) > 0) throw conflict('A user with that email already exists');
};

export const findAllUsers = async (): Promise<UserResponseDto[]> => {
  const result = await pool.query<UserRow>('SELECT id, name, email, created_at FROM users ORDER BY id');
  return result.rows.map((row) => toResponse(toUser(row)));
};

export const findUserById = async (id: number): Promise<UserResponseDto> => toResponse(await getOrThrow(id));

export const createUser = async (dto: CreateUserDto): Promise<UserResponseDto> => {
  await assertEmailAvailable(dto.email);
  try {
    const result = await pool.query<UserRow>(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at',
      [dto.name, dto.email],
    );
    const row = result.rows[0];
    if (!row) throw new Error('Insert did not return a user');
    return toResponse(toUser(row));
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('A user with that email already exists');
    throw err;
  }
};

export const updateUser = async (id: number, dto: UpdateUserDto): Promise<UserResponseDto> => {
  await getOrThrow(id);
  if (dto.email) await assertEmailAvailable(dto.email, id);

  const fields: string[] = [];
  const values: unknown[] = [];

  if (dto.name !== undefined) {
    values.push(dto.name);
    fields.push(`name = $${values.length}`);
  }
  if (dto.email !== undefined) {
    values.push(dto.email);
    fields.push(`email = $${values.length}`);
  }

  values.push(id);

  try {
    const result = await pool.query<UserRow>(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING id, name, email, created_at`,
      values,
    );
    const row = result.rows[0];
    if (!row) throw notFound(`User ${id} not found`);
    return toResponse(toUser(row));
  } catch (err) {
    if (isUniqueViolation(err)) throw conflict('A user with that email already exists');
    throw err;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  if ((result.rowCount ?? 0) === 0) throw notFound(`User ${id} not found`);
};
