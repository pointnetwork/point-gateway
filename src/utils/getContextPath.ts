import { encodeTag } from './encodeTag';

export function getContextPath(tag: string) {
  return `./opt/engine/${encodeTag(tag)}/context`;
}
