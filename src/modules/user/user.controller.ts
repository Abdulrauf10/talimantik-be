import { Request, Response } from 'express';
import * as UserService from './user.service';

export async function getMeController(req: Request, res: Response) {
  try {
    const user = await UserService.getMe((req.user as any).id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getUsersController(req: Request, res: Response) {
  try {
    const { page, perPage, search } = req.query;
    const users = await UserService.getUsers({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      search: search?.toString() || '',
    });
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUserController(req: Request, res: Response) {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateUserController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserService.updateUser(id, req.body);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteUserController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await UserService.deleteUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
