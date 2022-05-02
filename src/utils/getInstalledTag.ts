import { encodedTagCmp } from './encodedTagCmp';
import { getDirectories } from './getDirectories';

const encodedTagRegex = /\d_\d_\d/;

export async function getInstalledTag() {
  try {
    const directories = (await getDirectories('./opt')).filter((folderName) =>
      folderName.match(encodedTagRegex)
    );
    directories.sort(encodedTagCmp).reverse();
    return directories[0];
  } catch (e) {
    return undefined;
  }
}
