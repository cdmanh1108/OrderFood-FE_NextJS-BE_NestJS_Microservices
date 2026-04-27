import type { Request } from 'express';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

export type RequestWithUser = Request & {
  user?: JwtPayload;
};
