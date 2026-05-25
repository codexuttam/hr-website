/**
 * Comprehensive error handling utilities for PDF storage operations
 * Provides custom error classes, Supabase Storage error mapping, logging, and retry logic
 */

import { ServiceError, logError as baseLogError } from './errorHandler';

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base error class for PDF storage operations
 */
export class PDFStorageError extends ServiceError {
  public operation?: string;
  public resumeId?: number;
  public userId?: string;
  public retryable: boolean;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: any,
    operation?: string,
    resumeId?: number,
    userId?: string,
    retryable: boolean = false
  ) {
    super(message, status, code, details);
    this.name = 'PDFStorageError';
    this.operation = operation;
    this.resumeId = resumeId;
    this.userId = userId;
    this.retryable = retryable;
  }
}

/**
 * Error for file size validation failures
 */
export class FileSizeError extends PDFStorageError {
  public fileSize: number;
  public maxSize: number;

  constructor(fileSize: number, maxSize: number, resumeId?: number) {
    super(
      `PDF file size (${(fileSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSize / 1024 / 1024}MB)`,
      400,
      'FILE_TOO_LARGE',
      { fileSize, maxSize },
      'upload',
      resumeId,
      undefined,
      false
    );
    this.name = 'FileSizeError';
    this.fileSize = fileSize;
    this.maxSize = maxSize;
  }
}

/**
 * Error for storage quota exceeded
 */
export class StorageQuotaError extends PDFStorageError {
  constructor(details?: any, userId?: string) {
    super(
      'Storage quota exceeded. Please delete some files or contact support.',
      507,
      'STORAGE_QUOTA_EXCEEDED',
      details,
      'upload',
      undefined,
      userId,
      false
    );
    this.name = 'StorageQuotaError';
  }
}

/**
 * Error for file not found in storage
 */
export class FileNotFoundError extends PDFStorageError {
  public storagePath?: string;

  constructor(storagePath?: string, resumeId?: number) {
    super(
      'PDF file not found in storage',
      404,
      'FILE_NOT_FOUND',
      { storagePath },
      'download',
      resumeId,
      undefined,
      false
    );
    this.name = 'FileNotFoundError';
    this.storagePath = storagePath;
  }
}

/**
 * Error for network/connection issues
 */
export class NetworkError extends PDFStorageError {
  public attempts: number;

  constructor(message: string, attempts: number, operation?: string, resumeId?: number) {
    super(
      message,
      0,
      'NETWORK_ERROR',
      { attempts },
      operation,
      resumeId,
      undefined,
      true
    );
    this.name = 'NetworkError';
    this.attempts = attempts;
  }
}

/**
 * Error for authentication/authorization failures
 */
export class AuthorizationError extends PDFStorageError {
  constructor(message: string, status: number, resumeId?: number, userId?: string) {
    super(
      message,
      status,
      status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      undefined,
      undefined,
      resumeId,
      userId,
      false
    );
    this.name = 'AuthorizationError';
  }
}

// ============================================================================
// Supabase Storage Error Mapping
// ============================================================================

/**
 * Map Supabase Storage errors to user-friendly messages
 */
export const mapSupabaseStorageError = (
  error: any,
  operation: string = 'storage operation',
  resumeId?: number,
  userId?: string
): PDFStorageError => {
  // Handle null/undefined errors
  if (!error) {
    return new PDFStorageError(
      'Unknown storage error occurred',
      500,
      'UNKNOWN_ERROR',
      undefined,
      operation,
      resumeId,
      userId,
      false
    );
  }

  const errorMessage = error.message || error.error || error.msg || String(error);
  const errorCode = error.statusCode || error.status || error.code;

  // Network/connection errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ETIMEDOUT'
  ) {
    return new NetworkError(
      'Network connection error. Please check your internet connection.',
      1,
      operation,
      resumeId
    );
  }

  // Authentication errors
  if (errorCode === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('not authenticated')) {
    return new AuthorizationError(
      'You must be logged in to perform this action',
      401,
      resumeId,
      userId
    );
  }

  // Authorization/permission errors
  if (
    errorCode === 403 ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('permission') ||
    errorMessage.includes('not allowed') ||
    errorMessage.includes('access denied')
  ) {
    return new AuthorizationError(
      'You do not have permission to access this file',
      403,
      resumeId,
      userId
    );
  }

  // File not found
  if (
    errorCode === 404 ||
    errorMessage.includes('not found') ||
    errorMessage.includes('does not exist')
  ) {
    return new FileNotFoundError(error.path, resumeId);
  }

  // Storage quota exceeded
  if (
    errorCode === 507 ||
    errorMessage.includes('quota') ||
    errorMessage.includes('storage limit') ||
    errorMessage.includes('insufficient storage')
  ) {
    return new StorageQuotaError(error, userId);
  }

  // Invalid file type
  if (
    errorCode === 415 ||
    errorMessage.includes('invalid file type') ||
    errorMessage.includes('unsupported media type')
  ) {
    return new PDFStorageError(
      'Invalid file type. Only PDF files are allowed.',
      415,
      'INVALID_FILE_TYPE',
      error,
      operation,
      resumeId,
      userId,
      false
    );
  }

  // Bucket not found
  if (errorMessage.includes('bucket') && errorMessage.includes('not found')) {
    return new PDFStorageError(
      'Storage configuration error. Please contact support.',
      500,
      'BUCKET_NOT_FOUND',
      error,
      operation,
      resumeId,
      userId,
      false
    );
  }

  // Rate limiting
  if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return new PDFStorageError(
      'Too many requests. Please wait a moment and try again.',
      429,
      'RATE_LIMITED',
      error,
      operation,
      resumeId,
      userId,
      true
    );
  }

  // Server errors (retryable)
  if (errorCode >= 500 && errorCode < 600) {
    return new PDFStorageError(
      'Storage service temporarily unavailable. Please try again.',
      errorCode,
      'SERVER_ERROR',
      error,
      operation,
      resumeId,
      userId,
      true
    );
  }

  // Generic error
  return new PDFStorageError(
    errorMessage || 'An error occurred during PDF storage operation',
    errorCode || 500,
    'STORAGE_ERROR',
    error,
    operation,
    resumeId,
    userId,
    false
  );
};

/**
 * Get user-friendly error message for PDF storage errors
 */
export const getPDFStorageErrorMessage = (error: any): string => {
  if (error instanceof FileSizeError) {
    return error.message;
  }

  if (error instanceof StorageQuotaError) {
    return 'Your storage quota has been exceeded. Please delete some files or contact support.';
  }

  if (error instanceof FileNotFoundError) {
    return 'The PDF file could not be found. It may have been deleted or moved.';
  }

  if (error instanceof NetworkError) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  if (error instanceof AuthorizationError) {
    if (error.status === 401) {
      return 'Please log in to access this file.';
    }
    return 'You do not have permission to access this file.';
  }

  if (error instanceof PDFStorageError) {
    switch (error.code) {
      case 'INVALID_FILE_TYPE':
        return 'Invalid file type. Only PDF files are allowed.';
      case 'BUCKET_NOT_FOUND':
        return 'Storage configuration error. Please contact support.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'SERVER_ERROR':
        return 'Storage service temporarily unavailable. Please try again in a few moments.';
      default:
        return error.message || 'An error occurred while processing your PDF.';
    }
  }

  // Fallback for unknown errors
  return error?.message || 'An unexpected error occurred. Please try again.';
};

// ============================================================================
// Error Logging Utilities
// ============================================================================

/**
 * Log PDF storage operation errors with detailed context
 */
export const logPDFStorageError = (
  error: any,
  context: string,
  additionalInfo?: {
    resumeId?: number;
    userId?: string;
    operation?: string;
    fileSize?: number;
    storagePath?: string;
    [key: string]: any;
  }
): void => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      status: error?.status,
      retryable: error?.retryable,
    },
    ...additionalInfo,
  };

  // Use base error logger for consistent formatting
  baseLogError(context, error, errorInfo);

  // Additional production logging could be added here
  // e.g., send to error tracking service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with error tracking service
    console.error('[PDF Storage Error]', JSON.stringify(errorInfo));
  }
};

/**
 * Log successful PDF storage operations for monitoring
 */
export const logPDFStorageSuccess = (
  operation: string,
  details: {
    resumeId?: number;
    userId?: string;
    fileSize?: number;
    storagePath?: string;
    duration?: number;
    [key: string]: any;
  }
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`✅ PDF Storage Success: ${operation}`, {
      timestamp: new Date().toISOString(),
      operation,
      ...details,
    });
  }

  // Production metrics logging
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send metrics to monitoring service
    console.log('[PDF Storage Success]', JSON.stringify({
      timestamp: new Date().toISOString(),
      operation,
      ...details,
    }));
  }
};

// ============================================================================
// Retry Utility with Exponential Backoff
// ============================================================================

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'SERVER_ERROR', 'RATE_LIMITED'],
  onRetry: () => {},
};

/**
 * Execute an async operation with exponential backoff retry logic
 */
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable =
        error instanceof PDFStorageError &&
        error.retryable &&
        config.retryableErrors.includes(error.code || '');

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === config.maxAttempts || !isRetryable) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );

      // Call retry callback
      config.onRetry(attempt, error);

      // Log retry attempt
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `Retry attempt ${attempt}/${config.maxAttempts} after ${delay}ms`,
          { error: error?.message, code: error?.code }
        );
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper for PDF storage operations with automatic retry
 */
export const withPDFStorageRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  resumeId?: number,
  userId?: string,
  customOptions?: RetryOptions
): Promise<T> => {
  const startTime = Date.now();

  try {
    const result = await retryWithBackoff(operation, {
      ...customOptions,
      onRetry: (attempt, error) => {
        logPDFStorageError(
          error,
          `${operationName} - Retry ${attempt}`,
          { resumeId, userId, operation: operationName }
        );
        customOptions?.onRetry?.(attempt, error);
      },
    });

    const duration = Date.now() - startTime;
    logPDFStorageSuccess(operationName, {
      resumeId,
      userId,
      duration,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logPDFStorageError(error, operationName, {
      resumeId,
      userId,
      operation: operationName,
      duration,
    });
    throw error;
  }
};

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate PDF file size
 */
export const validatePDFSize = (
  fileSize: number,
  maxSize: number = 10 * 1024 * 1024, // 10MB default
  resumeId?: number
): void => {
  if (fileSize > maxSize) {
    throw new FileSizeError(fileSize, maxSize, resumeId);
  }

  if (fileSize === 0) {
    throw new PDFStorageError(
      'PDF file is empty',
      400,
      'EMPTY_FILE',
      { fileSize },
      'upload',
      resumeId,
      undefined,
      false
    );
  }
};

/**
 * Validate PDF file type
 */
export const validatePDFType = (file: File | Blob, resumeId?: number): void => {
  if (file instanceof File) {
    if (!file.type || file.type !== 'application/pdf') {
      throw new PDFStorageError(
        'Invalid file type. Only PDF files are allowed.',
        415,
        'INVALID_FILE_TYPE',
        { fileType: file.type },
        'upload',
        resumeId,
        undefined,
        false
      );
    }
  }
  // For Blob, we assume it's a PDF since we're generating it
};

/**
 * Validate storage path format
 */
export const validateStoragePath = (path: string): boolean => {
  // Expected format: {user_id}/{resume_id}/{timestamp}.pdf
  const pathRegex = /^[a-zA-Z0-9-]+\/\d+\/\d+\.pdf$/;
  return pathRegex.test(path);
};
