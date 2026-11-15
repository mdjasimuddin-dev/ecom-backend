import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const registerUser = async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AuthService.registerUser(payload);

  res.send({
    data: result,
  });
};

export const AuthController = {
  registerUser,
};
