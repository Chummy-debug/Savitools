import { NextRequest, NextResponse } from 'next/server';

async function getSecurityHeaders(path = '/'): Promise<Record<string, string>> {
  const baseUrl = process.env.NEXT_PUBLIC_TEST_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Security-Headers-Test',
    },
  });

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  return headers;
}

describe('Security Headers', () => {
  const requiredHeaders = [
    'content-security-policy',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
    'strict-transport-security',
    'x-dns-prefetch-control',
  ];

  const forbiddenHeaders = ['x-powered-by'];

  it('should have all required security headers on the home page', async () => {
    const headers = await getSecurityHeaders('/');

    for (const header of requiredHeaders) {
      expect(headers).toHaveProperty(header);
      expect(headers[header]).toBeTruthy();
    }

    for (const header of forbiddenHeaders) {
      expect(headers).not.toHaveProperty(header);
    }
  });

  it('should have CSP with frame-ancestors set to self', async () => {
    const headers = await getSecurityHeaders('/');
    const csp = headers['content-security-policy'];

    expect(csp).toContain("frame-ancestors 'self'");
  });

  it('should have X-Content-Type-Options: nosniff', async () => {
    const headers = await getSecurityHeaders('/');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  it('should have Referrer-Policy: strict-origin-when-cross-origin', async () => {
    const headers = await getSecurityHeaders('/');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('should have Permissions-Policy with restrictive defaults', async () => {
    const headers = await getSecurityHeaders('/');
    const permissionsPolicy = headers['permissions-policy'];

    expect(permissionsPolicy).toContain('accelerometer=()');
    expect(permissionsPolicy).toContain('camera=()');
    expect(permissionsPolicy).toContain('geolocation=()');
    expect(permissionsPolicy).toContain('microphone=()');
    expect(permissionsPolicy).toContain('payment=()');
  });

  it('should have HSTS header in production', async () => {
    if (process.env.NODE_ENV === 'production') {
      const headers = await getSecurityHeaders('/');
      expect(headers['strict-transport-security']).toContain('max-age=63072000');
      expect(headers['strict-transport-security']).toContain('includeSubDomains');
      expect(headers['strict-transport-security']).toContain('preload');
    }
  });

  it('should not expose X-Powered-By header', async () => {
    const headers = await getSecurityHeaders('/');
    expect(headers).not.toHaveProperty('x-powered-by');
  });
});