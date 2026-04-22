import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;         // Supabase user UUID
  email?: string;
  role?: string;       // Supabase role (authenticated, anon, service_role)
  aud?: string;        // audience
  exp?: number;        // expiration timestamp
  iat?: number;        // issued at timestamp
  iss?: string;        // issuer
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, unknown>;
}

export class JwtVerifier {
  /**
   * Verifica un JWT de Supabase usando HMAC-SHA256 (HS256).
   * No requiere librerías externas — usa el módulo crypto de Node.js.
   */
  static verify(token: string, secret: string): JwtPayload | null {
    if (!token || !secret) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verificar la firma
    const data = `${headerB64}.${payloadB64}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('base64url');

    if (expectedSignature !== signatureB64) {
      return null;
    }

    // Decodificar el payload
    let payload: JwtPayload;
    try {
      const decoded = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      payload = JSON.parse(decoded);
    } catch {
      return null;
    }

    // Verificar expiración
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  }

  /**
   * Decodifica un JWT sin verificar la firma (útil para debug).
   */
  static decode(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const decoded = Buffer.from(parts[1], 'base64url').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
