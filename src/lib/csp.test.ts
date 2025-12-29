/**
 * Content Security Policy Tests
 * Feature: security-hardening
 * 
 * Validates: Requirements 4.1-4.6
 * - 4.1: CSP meta tag presence in HTML head
 * - 4.2: script-src restricted to 'self' and 'unsafe-eval'
 * - 4.3: connect-src restricted to 'self' and Supabase domains
 * - 4.4: img-src restricted to 'self', data URIs, and Supabase storage
 * - 4.5: worker-src allows 'self' and blob: for Web Workers
 * - 4.6: default-src set to 'none'
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Content Security Policy Configuration', () => {
  let htmlContent: string;
  let cspContent: string;

  beforeAll(() => {
    // Read the index.html file
    const indexPath = resolve(process.cwd(), 'index.html');
    htmlContent = readFileSync(indexPath, 'utf-8');
    
    // Extract CSP meta tag content
    const cspMatch = htmlContent.match(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i
    );
    cspContent = cspMatch ? cspMatch[1] : '';
  });

  /**
   * Requirement 4.1: THE Application SHALL include a Content Security Policy meta tag in the HTML head
   */
  it('should have CSP meta tag present in index.html', () => {
    expect(htmlContent).toContain('http-equiv="Content-Security-Policy"');
    expect(cspContent).toBeTruthy();
  });

  /**
   * Requirement 4.6: THE CSP SHALL set default-src to 'none' to deny all resources not explicitly allowed
   */
  it('should have default-src set to none', () => {
    expect(cspContent).toMatch(/default-src\s+'none'/);
  });

  /**
   * Requirement 4.2: THE CSP SHALL restrict script-src to 'self' and 'unsafe-eval'
   */
  it('should have script-src with self and unsafe-eval', () => {
    expect(cspContent).toMatch(/script-src[^;]*'self'/);
    expect(cspContent).toMatch(/script-src[^;]*'unsafe-eval'/);
  });

  /**
   * Requirement 4.3: THE CSP SHALL restrict connect-src to 'self' and Supabase domains only
   */
  it('should have connect-src with self and Supabase domains', () => {
    expect(cspContent).toMatch(/connect-src[^;]*'self'/);
    expect(cspContent).toMatch(/connect-src[^;]*https:\/\/\*\.supabase\.co/);
    expect(cspContent).toMatch(/connect-src[^;]*wss:\/\/\*\.supabase\.co/);
  });

  /**
   * Requirement 4.4: THE CSP SHALL restrict img-src to 'self', data URIs, and Supabase storage domains
   */
  it('should have img-src with self, data URIs, and Supabase storage', () => {
    expect(cspContent).toMatch(/img-src[^;]*'self'/);
    expect(cspContent).toMatch(/img-src[^;]*data:/);
    expect(cspContent).toMatch(/img-src[^;]*https:\/\/\*\.supabase\.co/);
  });

  /**
   * Requirement 4.5: THE CSP SHALL allow worker-src for 'self' and blob: to support Web Workers
   */
  it('should have worker-src with self and blob', () => {
    expect(cspContent).toMatch(/worker-src[^;]*'self'/);
    expect(cspContent).toMatch(/worker-src[^;]*blob:/);
  });

  /**
   * Additional security: frame-src should be restricted
   */
  it('should have frame-src set to none to prevent iframe embedding', () => {
    expect(cspContent).toMatch(/frame-src[^;]*'none'/);
  });

  /**
   * Verify CSP does not have overly permissive directives
   */
  it('should not have unsafe-inline in script-src', () => {
    // Extract just the script-src directive
    const scriptSrcMatch = cspContent.match(/script-src\s+([^;]+)/);
    const scriptSrc = scriptSrcMatch ? scriptSrcMatch[1] : '';
    expect(scriptSrc).not.toContain("'unsafe-inline'");
  });

  it('should not allow all https sources in img-src', () => {
    // Extract just the img-src directive
    const imgSrcMatch = cspContent.match(/img-src\s+([^;]+)/);
    const imgSrc = imgSrcMatch ? imgSrcMatch[1] : '';
    // Should not have https: without domain restriction
    expect(imgSrc).not.toMatch(/\bhttps:\s*[^/]/);
  });
});
