import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  iss?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, unknown>;
}

interface JwkKey {
  kty: string;
  use?: string;
  kid?: string;
  alg?: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
}

export class JwtVerifier {
  private static jwksCache = new Map<string, { keys: JwkKey[]; fetchedAt: number }>();
  private static readonly CACHE_TTL = 3_600_000;

  static async verifyWithJwks(token: string, jwksUrl: string): Promise<JwtPayload | null> {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    let header: { kid?: string; alg?: string };
    try {
      header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf-8'));
    } catch {
      return null;
    }

    const alg = header.alg ?? 'ES256';
    if (alg === 'HS256') return null;

    const keys = await this.fetchJwks(jwksUrl);
    if (!keys?.length) return null;

    const jwk = header.kid
      ? (keys.find((k) => k.kid === header.kid) ?? keys[0])
      : keys[0];

    if (!jwk) return null;

    let publicKey: crypto.KeyObject;
    try {
      publicKey = crypto.createPublicKey({ key: jwk as crypto.JsonWebKey, format: 'jwk' });
    } catch {
      return null;
    }

    const hashAlg = alg === 'ES384' ? 'SHA384' : alg === 'ES512' ? 'SHA512' : 'SHA256';
    const data = Buffer.from(`${headerB64}.${payloadB64}`);
    const signature = Buffer.from(signatureB64, 'base64url');

    try {
      const valid = crypto.verify(hashAlg, data, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signature);
      if (!valid) return null;
    } catch {
      return null;
    }

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    } catch {
      return null;
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  }

  private static async fetchJwks(url: string): Promise<JwkKey[] | null> {
    const cached = this.jwksCache.get(url);
    if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL) {
      return cached.keys;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) return cached?.keys ?? null;
      const data = await res.json() as { keys: JwkKey[] };
      this.jwksCache.set(url, { keys: data.keys, fetchedAt: Date.now() });
      return data.keys;
    } catch {
      return cached?.keys ?? null;
    }
  }

  static verify(token: string, secret: string): JwtPayload | null {
    if (!token || !secret) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const data = `${headerB64}.${payloadB64}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(data);
    const expectedSignature = hmac.digest('base64url');

    if (expectedSignature !== signatureB64) return null;

    let payload: JwtPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    } catch {
      return null;
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  }

  static decode(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    } catch {
      return null;
    }
  }
}
