import { promises as fs } from 'fs';
import { statAsync } from './statAsync';

export const makeSurePathExists = async (
  pathToCheck: string,
  createIfNotExists = false
) => {
  try {
    await statAsync(pathToCheck);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT' && createIfNotExists) {
      await fs.mkdir(pathToCheck, { recursive: true });
    } else {
      throw e;
    }
  }
};
