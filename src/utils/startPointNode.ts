import { exec } from 'child_process';
import { encodeTag } from './encodeTag';
import { log } from './logger';

export function startPointNode({
  tag,
  proxyPort,
  apiPort,
  datadirPath,
  // keystorePath,
  platform,
  sdkPath,
}: {
  tag: string;
  proxyPort: number;
  apiPort: number;
  datadirPath: string;
  // keystorePath: string;
  platform: string;
  sdkPath: string;
}) {
  const pointPath = `./opt/${encodeTag(tag)}/bin/${platform}/point`;
  const pointserver = exec(
    // `chmod 777 ${pointPath} && DATADIR=${datadirPath} ZPROXY_PORT=${proxyPort} NODE_ENV=production POINT_KEYSTORE=${keystorePath} API_PORT=${apiPort} ${pointPath}`
    `chmod 777 ${pointPath} && DATADIR=${datadirPath} ZPROXY_PORT=${proxyPort} NODE_ENV=production API_PORT=${apiPort} SDK_FILE=${sdkPath} ${pointPath}`
  );
  log.info('started server');
  pointserver.stderr?.pipe(process.stderr);
  pointserver.stdout?.pipe(process.stdout);
  return pointserver;
}
