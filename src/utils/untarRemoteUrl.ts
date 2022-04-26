import axios from 'axios';
import tar from 'tar';

export async function untarRemoteUrl(fileUrl: string, dest: string) {
  const fileStream = await axios.get(fileUrl, { responseType: 'stream' });
  return new Promise((resolve) => {
    fileStream.data
      .pipe(
        tar.x({
          C: dest,
        })
      )
      .on('close', () => {
        resolve(null);
      });
  });
}
