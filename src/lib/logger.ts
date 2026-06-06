type Level = 'info' | 'warn' | 'error';

const queue: string[] = [];
let flushing = false;

function flush() {
  if (flushing) return;
  flushing = true;
  const batch = queue.splice(0);
  if (batch.length) {
    queueMicrotask(() => {
      batch.forEach((msg) => console.log(msg));
      flushing = false;
    });
  } else {
    flushing = false;
  }
}

export const logger = {
  info: (msg: string, data?: unknown) => {
    queue.push(`[INFO ${Date.now()}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`);
    flush();
  },
  warn: (msg: string, data?: unknown) => {
    queue.push(`[WARN ${Date.now()}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`);
    flush();
  },
  error: (msg: string, err?: unknown) => {
    queue.push(`[ERROR ${Date.now()}] ${msg}${err ? ' ' + String(err) : ''}`);
    flush();
  },
};
