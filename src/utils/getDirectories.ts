import { readdir } from 'fs/promises';

export async function getDirectories(source: string) {
  return (await readdir(source, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
