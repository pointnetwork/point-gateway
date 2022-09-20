import { readdir } from 'fs/promises';
import { encodedTagCmp } from './encodedTagCmp';

const encodedTagRegex = /\d_\d_\d/;

export async function getInstalledSdkTag() {
  try {
    const sdkFiles = (await readdir('./opt/sdk', { withFileTypes: true }))
      .map((entry) => entry.name)
      .filter((fileName) => fileName.match(encodedTagRegex));
    sdkFiles.sort(encodedTagCmp).reverse();
    return sdkFiles[0];
  } catch (e) {
    return undefined;
  }
}
