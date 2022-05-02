export function encodedTagCmp(encodedTag1: string, encodedTag2: string) {
  const tag1 = encodedTag1.split('_').map(Number);
  const tag2 = encodedTag2.split('_').map(Number);
  for (let ix = 0; ix < tag1.length; ix++) {
    if (tag1[ix] > tag2[ix]) {
      return 1;
    }
    if (tag1[ix] < tag2[ix]) {
      return -1;
    }
  }
  return 0;
}

export function isNewerVersion(newVersion: string, currentVersion: string) {
  return encodedTagCmp(newVersion, currentVersion) > 0;
}
