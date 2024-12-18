import fs from 'fs/promises';
import path from 'path';

export async function logToFile(message: string, filename: string = 'app.log') {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, filename);
    await fs.appendFile(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch {
    // Silently fail if we can't log
  }
}
