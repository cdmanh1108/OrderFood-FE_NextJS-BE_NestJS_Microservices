import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ERRORS, getErrorDefinition } from '../constants/error-code.constant';
import { RpcErrorPayload } from '../interfaces/rpc-error-payload.interface';

export function extractRpcError(error: unknown): RpcErrorPayload {
  if (typeof error === 'object' && error !== null) {
    const maybeWrapped = error as { error?: unknown };

    const candidate =
      typeof maybeWrapped.error === 'object' && maybeWrapped.error !== null
        ? (maybeWrapped.error as Partial<RpcErrorPayload>)
        : (error as Partial<RpcErrorPayload>);

    return {
      code:
        typeof candidate.code === 'string'
          ? candidate.code
          : ERRORS.INTERNAL_ERROR.code,
      message:
        typeof candidate.message === 'string'
          ? candidate.message
          : ERRORS.INTERNAL_ERROR.message,
      details: candidate.details,
    };
  }

  return {
    code: ERRORS.INTERNAL_ERROR.code,
    message: ERRORS.INTERNAL_ERROR.message,
  };
}

export function mapRpcErrorToHttpException(error: unknown): Error {
  const rpcError = extractRpcError(error);
  const definitionError = getErrorDefinition(rpcError.code);

  const body = {
    code: rpcError.code,
    message: rpcError.message || definitionError.message,
    details: rpcError.details,
  };

  switch (definitionError.statusCode) {
    case 400:
      return new BadRequestException(body);

    case 401:
      return new UnauthorizedException(body);

    case 403:
      return new ForbiddenException(body);

    case 404:
      return new NotFoundException(body);

    case 409:
      return new ConflictException(body);

    case 500:
    default:
      return new InternalServerErrorException(body);
  }
}
