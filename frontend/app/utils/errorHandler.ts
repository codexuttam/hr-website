/**
 * Enhanced error handling utilities for API responses and service calls
 */

export interface APIError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
}

export class ServiceError extends Error {
  public status?: number;
  public code?: string;
  public details?: any;
  public timestamp: string;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Safely parse JSON response with fallback
 */
export const safeJsonParse = async (response: Response): Promise<any> => {
  try {
    return await response.json();
  } catch (error) {
    console.warn('Failed to parse response as JSON:', error);
    return { error: 'Invalid JSON response' };
  }
};

/**
 * Extract meaningful error message from various error formats
 */
export const extractErrorMessage = (errorData: any, defaultMessage: string = 'Unknown error'): string => {
  if (typeof errorData === 'string') {
    return errorData;
  }

  if (errorData && typeof errorData === 'object') {
    return (
      errorData.details ||
      errorData.error ||
      errorData.message ||
      errorData.msg ||
      defaultMessage
    );
  }

  return defaultMessage;
};

/**
 * Create a standardized error from API response
 */
export const createAPIError = async (response: Response): Promise<ServiceError> => {
  const errorData = await safeJsonParse(response);
  const message = extractErrorMessage(errorData, `HTTP ${response.status}: ${response.statusText}`);
  
  return new ServiceError(
    message,
    response.status,
    errorData?.code,
    errorData
  );
};

/**
 * Handle fetch errors with retry logic
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Don't retry on client errors (4xx), only on server errors (5xx) or network issues
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      if (attempt === maxRetries) {
        return response; // Return the last response even if it failed
      }

      console.warn(`Request failed (attempt ${attempt}/${maxRetries}):`, response.status);
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw new ServiceError(
          `Network error after ${maxRetries} attempts: ${lastError.message}`,
          0,
          'NETWORK_ERROR',
          { originalError: lastError.message, attempts: maxRetries }
        );
      }

      console.warn(`Network error (attempt ${attempt}/${maxRetries}):`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Log errors in development with detailed information
 */
export const logError = (context: string, error: any, additionalInfo?: any): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error in ${context}`);
    console.error('Error:', error);
    if (error instanceof ServiceError) {
      console.log('Status:', error.status);
      console.log('Code:', error.code);
      console.log('Details:', error.details);
      console.log('Timestamp:', error.timestamp);
    }
    if (additionalInfo) {
      console.log('Additional Info:', additionalInfo);
    }
    console.groupEnd();
  }
};

/**
 * Create user-friendly error messages
 */
export const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof ServiceError) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You need to log in to perform this action.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  if (error?.code === 'NETWORK_ERROR') {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Validate response and throw appropriate errors
 */
export const validateResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    throw await createAPIError(response);
  }

  return await safeJsonParse(response);
};