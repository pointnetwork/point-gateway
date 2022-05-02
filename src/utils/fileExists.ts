import { statAsync } from './statAsync';

export async function fileExists(pathToCheck: string): Promise<boolean> {
  try {
    await statAsync(pathToCheck);
    return true;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}
