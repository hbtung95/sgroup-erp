/**
 * SGAPIClient - Tahoe Calm API Wrapper
 * Aligned with Google App Script Client logic but for Universal environment.
 */

interface APIOptions {
  timeoutMs?: number;
  silent?: boolean;
  toastOnError?: boolean;
  toastTitle?: string;
  ctx?: string;
}

export interface APIResponse<T = any> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
  details?: string;
}

export const SGAPIClient = {
  /**
   * Main call function
   */
  async call<T = any>(method: string, payload: any = {}, opts: APIOptions = {}): Promise<T> {
    const {
      timeoutMs = 15000,
      silent = false,
      toastOnError = true,
      toastTitle = 'Có lỗi xảy ra',
      ctx = '',
    } = opts;

    return new Promise((resolve, reject) => {
      let done = false;

      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        const err = this.normalizeError({ message: 'Request timeout', code: 'TIMEOUT' }, { ctx, method });
        if (!silent) this.maybeToastError(err, toastOnError, toastTitle);
        reject(err);
      }, timeoutMs);

      // Note: In AppScript environment, we use google.script.run
      // In a standard Backend environment, we might use fetch()
      // This is a bridge implementation
      try {
        const gasRunner = (window as any).google?.script?.run;
        
        if (gasRunner) {
          // App Script Environment
          gasRunner
            .withSuccessHandler((res: any) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              resolve(res);
            })
            .withFailureHandler((e: any) => {
              if (done) return;
              done = true;
              clearTimeout(timer);
              const err = this.normalizeError(e, { ctx, method });
              if (!silent) this.maybeToastError(err, toastOnError, toastTitle);
              reject(err);
            })[method](payload);
        } else {
          // Fallback or Standard API (Placeholder for future REST integration)
          console.warn(`[SGAPI] Running in non-GAS environment. Calling method: ${method}`);
          // For now, we simulate a mock response or you can add fetch() logic here
          // resolve({ ok: true, data: {} } as any);
        }
      } catch (e) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        const err = this.normalizeError(e, { ctx, method });
        if (!silent) this.maybeToastError(err, toastOnError, toastTitle);
        reject(err);
      }
    });
  },

  /**
   * Helper to normalize various error formats from GAS or REST
   */
  normalizeError(e: any, meta: { ctx: string; method: string }) {
    const out = {
      ok: false,
      code: 'ERROR',
      message: 'Unknown error',
      details: '',
      ctx: meta.ctx,
      method: meta.method,
    };

    if (!e) return out;

    if (typeof e === 'string') {
      out.message = e;
      return out;
    }

    out.message = e.message || out.message;
    out.code = e.code || out.code;
    out.details = e.stack || e.details || '';

    return out;
  },

  /**
   * Integration with Toast system (Placeholder)
   */
  maybeToastError(err: any, enabled: boolean, title: string) {
    if (!enabled) return;
    console.error(`[SGAPI Error] ${title}: ${err.message}`, err);
    // You can call your SGToast.show() here
  }
};

/**
 * Convenience shortcuts
 */
export const API = {
  boot: () => SGAPIClient.call('svc_boot', {}, { ctx: 'boot', toastTitle: 'Khởi tạo thất bại' }),
  ping: () => SGAPIClient.call('svc_ping', {}, { silent: true, timeoutMs: 5000 }),
};
