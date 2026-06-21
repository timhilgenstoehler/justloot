const PREFIX = '[auth]';

export function authLog(message: string, data?: unknown): void {
  const ts = new Date().toISOString().slice(11, 23);
  if (data !== undefined) {
    console.log(`${PREFIX} ${ts} ${message}`, data);
  } else {
    console.log(`${PREFIX} ${ts} ${message}`);
  }
}
