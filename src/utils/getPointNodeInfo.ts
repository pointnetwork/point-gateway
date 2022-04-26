import axios from 'axios';

const pointNodeRepoUrl =
  'https://api.github.com/repos/pointnetwork/pointnetwork/releases/latest';

export async function getPointNodeInfo() {
  const {
    data: { assets_url: assetsUrl, tag_name: latestTag },
  } = await axios.get(pointNodeRepoUrl);
  return {
    assetsUrl,
    latestTag,
  };
}
