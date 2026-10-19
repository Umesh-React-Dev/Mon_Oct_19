import { Router, type Request, type Response } from 'express';
import { validateBody } from '../../middlewares/validate';
import { parseCreateUser, parseUpdateUser, parseUserId, type CreateUserDto, type UpdateUserDto } from './user.dto';
import * as userService from './user.service';

/**
 * Controller + router for /users. Handlers translate HTTP <-> service calls.
 * No business logic and no try/catch: thrown errors and rejected promises
 * go to the central error handler.
 */
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  res.json({ data: await userService.findAllUsers() });
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = parseUserId(req.params);
  res.json({ data: await userService.findUserById(id) });
});

router.post('/', validateBody(parseCreateUser), async (req: Request<unknown, unknown, CreateUserDto>, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json({ data: user });
});

router.patch(
  '/:id',
  validateBody(parseUpdateUser),
  async (req: Request<{ id: string }, unknown, UpdateUserDto>, res: Response) => {
    const id = parseUserId(req.params);
    res.json({ data: await userService.updateUser(id, req.body) });
  },
);

router.delete('/:id', async (req: Request, res: Response) => {
  const id = parseUserId(req.params);
  await userService.deleteUser(id);
  res.status(204).end();
});

export default router;
