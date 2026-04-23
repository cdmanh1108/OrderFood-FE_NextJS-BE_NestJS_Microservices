import { RpcException } from '@nestjs/microservices';
import { RpcErrorPayload } from '../interfaces/rpc-error-payload.interface';

export class AppRpcException extends RpcException {
  constructor(payload: RpcErrorPayload) {
    super(payload);
  }
}
