export function encodeTag(tag: string) {
  return tag.slice(1).split('.').join('_');
}
