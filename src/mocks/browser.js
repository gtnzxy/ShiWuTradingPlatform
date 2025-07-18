import { setupWorker } from 'msw/browser';
import { handlers } from './handlersFixed';

// 设置Service Worker
export const worker = setupWorker(...handlers);

// 在开发环境中启动Mock Service Worker
if (process.env.NODE_ENV === 'development') {
  worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
}
