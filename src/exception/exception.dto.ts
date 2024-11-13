import { HttpStatus } from '@nestjs/common';

export interface ExceptionDto {
  statusCode: HttpStatus;
  timestamp: string;
  path: string;
  message: string | string[];
}
