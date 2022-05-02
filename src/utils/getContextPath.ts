import { encodeTag } from './encodeTag';

export function getContextPath(tag: string) {
  return `./opt/${encodeTag(tag)}/context`;
}
