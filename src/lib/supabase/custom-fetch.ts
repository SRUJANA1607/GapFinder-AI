import https from 'node:https';
import http from 'node:http';

/**
 * Custom fetch implementation for Node.js environments on Windows.
 * Node 22's undici fetch can encounter ConnectTimeoutError on dual-stack IPv4/IPv6 connections.
 * This standard https/http wrapper provides immediate, reliable socket connections for Supabase SSR.
 */
export async function customServerFetch(
  input: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  // If running in browser, use native window.fetch
  if (typeof window !== 'undefined') {
    return window.fetch(input, init);
  }

  return new Promise((resolve, reject) => {
    try {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : input.url;

      const parsedUrl = new URL(urlStr);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      // Extract and normalize headers
      const headers: Record<string, string> = {};

      if (init?.headers) {
        if (typeof (init.headers as Headers).forEach === 'function') {
          (init.headers as Headers).forEach((value, key) => {
            headers[key] = value;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, value]) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, init.headers);
        }
      }

      // If input was a Request object and has headers not overridden
      if (typeof input === 'object' && 'headers' in input && input.headers) {
        if (typeof (input.headers as Headers).forEach === 'function') {
          (input.headers as Headers).forEach((value, key) => {
            if (!headers[key]) headers[key] = value;
          });
        }
      }

      const method = (init?.method || (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();

      const req = client.request(
        parsedUrl,
        {
          method,
          headers,
          timeout: 20000,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          res.on('end', () => {
            const bodyBuffer = Buffer.concat(chunks);
            const responseHeaders = new Headers();

            for (const [key, val] of Object.entries(res.headers)) {
              if (Array.isArray(val)) {
                val.forEach((item) => responseHeaders.append(key, item));
              } else if (val !== undefined) {
                responseHeaders.set(key, val);
              }
            }

            const isNullBodyStatus =
              res.statusCode === 204 ||
              res.statusCode === 205 ||
              res.statusCode === 304 ||
              res.statusCode === 101;
            const responseBody = isNullBodyStatus ? null : bodyBuffer;

            resolve(
              new Response(responseBody, {
                status: res.statusCode || 200,
                statusText: res.statusMessage || '',
                headers: responseHeaders,
              })
            );
          });
        }
      );

      req.on('timeout', () => {
        req.destroy(new Error(`CustomServerFetch connection timed out to ${parsedUrl.hostname}`));
      });

      req.on('error', (err) => {
        reject(err);
      });

      // Handle body
      if (init?.body) {
        if (typeof init.body === 'string' || Buffer.isBuffer(init.body)) {
          req.write(init.body);
        } else if (typeof (init.body as unknown as { pipe?: unknown }).pipe === 'function') {
          (init.body as unknown as { pipe: (dest: unknown) => void }).pipe(req);
          return;
        } else {
          req.write(String(init.body));
        }
      }

      req.end();
    } catch (err) {
      reject(err);
    }
  });
}
