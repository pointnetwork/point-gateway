import { writeFile } from 'fs/promises';
import { generateMnemonic } from 'bip39';
import { resolve as pathResolve } from 'path';
import { generate } from 'randomstring';

export async function generateAndSaveKeys(destFolder: string) {
  const phrase = generateMnemonic();
  await writeFile(
    pathResolve(destFolder, 'key.json'),
    JSON.stringify({ phrase })
  );
  const token = generate();
  await writeFile(pathResolve(destFolder, 'token.txt'), token);
}
