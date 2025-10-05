import { Request, Response, NextFunction } from "express";
import DOMPurify from 'isomorphic-dompurify';

const failedLoginAttempts = new Map<string, { count: number; lockedUntil?: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  
  next();
};

export const httpsEnforcement = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.stripe.com; " +
    "frame-ancestors 'none';"
  );
  
  next();
};

export function recordFailedLogin(identifier: string): boolean {
  const now = Date.now();
  const record = failedLoginAttempts.get(identifier);
  
  if (record && record.lockedUntil && now < record.lockedUntil) {
    return false;
  }
  
  if (!record) {
    failedLoginAttempts.set(identifier, { count: 1 });
  } else if (record.lockedUntil && now >= record.lockedUntil) {
    failedLoginAttempts.set(identifier, { count: 1 });
  } else {
    record.count++;
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_DURATION;
    }
  }
  
  return true;
}

export function clearFailedLogin(identifier: string): void {
  failedLoginAttempts.delete(identifier);
}

export function isAccountLocked(identifier: string): { locked: boolean; remainingTime?: number } {
  const record = failedLoginAttempts.get(identifier);
  
  if (!record || !record.lockedUntil) {
    return { locked: false };
  }
  
  const now = Date.now();
  if (now >= record.lockedUntil) {
    failedLoginAttempts.delete(identifier);
    return { locked: false };
  }
  
  return { 
    locked: true, 
    remainingTime: Math.ceil((record.lockedUntil - now) / 1000)
  };
}

export function getFailedAttempts(identifier: string): number {
  const record = failedLoginAttempts.get(identifier);
  return record?.count || 0;
}
