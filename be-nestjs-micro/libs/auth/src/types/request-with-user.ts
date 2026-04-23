import { JwtPayload } from '../interfaces/jwt-payload.interface';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
