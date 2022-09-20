import axios from 'axios';

const POINT_REPO_URLS = {
  engine:
    'https://api.github.com/repos/pointnetwork/pointnetwork/releases/latest',
  sdk: 'https://api.github.com/repos/pointnetwork/pointsdk/releases/latest',
};

export async function getRepoInfo(repo: 'engine' | 'sdk') {
  const {
    data: { assets_url: assetsUrl, tag_name: latestTag },
  } = await axios.get(POINT_REPO_URLS[repo]);
  return {
    assetsUrl,
    latestTag,
  };
}
