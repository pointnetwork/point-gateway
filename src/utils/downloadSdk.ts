import axios from 'axios';
import { writeFile } from 'fs/promises';
import { encodeTag } from './encodeTag';

export async function downloadSdk(assetsUrl: string, latestTag: string) {
  const { data: assetsInfo } = await axios.get(assetsUrl);
  const downloadUrl = assetsInfo.find((assetInfo: { name: string }) =>
    assetInfo.name.startsWith('pointsdk')
  ).browser_download_url;
  const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
  await writeFile(`./opt/sdk/${encodeTag(latestTag)}`, Buffer.from(res.data));
}
