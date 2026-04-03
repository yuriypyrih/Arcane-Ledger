import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRequestHandler<TResponse extends Response = Response> = (
  request: Request,
  response: TResponse,
  next: NextFunction
) => Promise<unknown>;

export function asyncHandler<TResponse extends Response>(handler: AsyncRequestHandler<TResponse>): RequestHandler {
  return (request, response, next) => {
    void handler(request, response as TResponse, next).catch(next);
  };
}
