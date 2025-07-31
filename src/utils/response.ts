import { LambdaResponse, ApiResponse } from '../types';

export function createResponse(
  statusCode: number,
  data?: any,
  message?: string,
  error?: string
): LambdaResponse {
  const response: ApiResponse = {
    success: statusCode >= 200 && statusCode < 300,
    data,
    message,
    error
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify(response)
  };
}

export function successResponse(data?: any, message?: string): LambdaResponse {
  return createResponse(200, data, message);
}

export function badRequestResponse(message: string): LambdaResponse {
  return createResponse(400, undefined, undefined, message);
}

export function internalServerErrorResponse(message: string = 'Internal server error'): LambdaResponse {
  return createResponse(500, undefined, undefined, message);
} 