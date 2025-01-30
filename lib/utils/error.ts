export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;
  
    constructor(
      message: string,
      statusCode: number = 500,
      code: string = 'INTERNAL_ERROR',
      isOperational: boolean = true
    ) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.isOperational = isOperational;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class ValidationError extends AppError {
    constructor(message: string) {
      super(message, 400, 'VALIDATION_ERROR');
    }
  }
  
  export class AuthorizationError extends AppError {
    constructor(message: string = 'Unauthorized access') {
      super(message, 401, 'UNAUTHORIZED');
    }
  }
  
  export class NotFoundError extends AppError {
    constructor(resource: string) {
      super(`${resource} not found`, 404, 'NOT_FOUND');
    }
  }
  
  export class ConflictError extends AppError {
    constructor(message: string) {
      super(message, 409, 'CONFLICT');
    }
  }
  
  export function handleError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
  
    if (error instanceof Error) {
      return new AppError(
        error.message,
        500,
        'INTERNAL_ERROR',
        false
      );
    }
  
    return new AppError(
      'An unexpected error occurred',
      500,
      'INTERNAL_ERROR',
      false
    );
  }