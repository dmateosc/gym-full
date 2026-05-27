import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  aud?: string | string[];
  iat: number;
  exp: number;
  [key: string]: unknown;
}

interface JwksKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
}

// Simple in-memory cache: url → { keys, cachedAt }
const jwksCache = new Map<string, { keys: JwksKey[]; cachedAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchJwks(jwksUrl: string): Promise<JwksKey[]> {
  const cached = jwksCache.get(jwksUrl);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.keys;
  }
  const res = await fetch(jwksUrl);
  const { keys } = (await res.json()) as { keys: JwksKey[] };
  jwksCache.set(jwksUrl, { keys, cachedAt: Date.now() });
  return keys;
}

export class JwtVerifier {
  static verify(token: string, secret: string): JwtPayload | null {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      return null;
    }
  }

  static async verifyWithJwks(
    token: string,
    jwksUrl: string,
  ): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string') return null;

      const keys = await fetchJwks(jwksUrl);
      const header = decoded.header as { kid?: string; alg?: string };

      // Pick key matching kid (if present), otherwise first key
      const key = header.kid ? keys.find((k) => k.kid === header.kid) : keys[0];
      if (!key) return null;

      // Build PEM from JWK (only RSA/EC supported by jsonwebtoken)
      const pubKey = await crypto.subtle.importKey(
        'jwk',
        key as JsonWebKey,
        key.crv
          ? { name: 'ECDSA', namedCurve: key.crv }
          : { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        true,
        ['verify'],
      );
      const exported = await crypto.subtle.exportKey('spki', pubKey);
      const pem = `-----BEGIN PUBLIC KEY-----\n${Buffer.from(exported)
        .toString('base64')
        .match(/.{1,64}/g)!
        .join('\n')}\n-----END PUBLIC KEY-----`;

      return jwt.verify(token, pem) as JwtPayload;
    } catch {
      return null;
    }
  }
}
