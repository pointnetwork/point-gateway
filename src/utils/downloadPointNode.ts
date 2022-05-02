import axios from 'axios';
import { encodeTag } from './encodeTag';
import { untarRemoteUrl } from './untarRemoteUrl';

export async function downloadPointNode(
  assetsUrl: string,
  latestTag: string,
  platform: string
) {
  const { data: assetsInfo } = await axios.get(assetsUrl);
  const downloadUrl = assetsInfo.find((assetInfo: { name: string }) =>
    assetInfo.name.includes(platform)
  ).browser_download_url;
  await untarRemoteUrl(downloadUrl, `./opt/${encodeTag(latestTag)}`);
}
