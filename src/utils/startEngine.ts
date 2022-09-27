import { exec } from 'child_process';
import { encodeTag } from './encodeTag';
import { log } from './logger';

export function startEngine({
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
  const enginePath = `./opt/engine/${encodeTag(tag)}/bin/${platform}/point`;
  const engineProcess = exec(
    // `chmod 777 ${pointPath} && DATADIR=${datadirPath} ZPROXY_PORT=${proxyPort} NODE_ENV=production POINT_KEYSTORE=${keystorePath} API_PORT=${apiPort} ${pointPath}`
    `chmod 777 ${enginePath} && DATADIR=${datadirPath} ZPROXY_PORT=${proxyPort} NODE_ENV=production API_PORT=${apiPort} SDK_FILE=${sdkPath} MODE=gateway ${enginePath}`
  );
  log.info('started server');
  engineProcess.stderr?.pipe(process.stderr);
  engineProcess.stdout?.pipe(process.stdout);
  return engineProcess;
}
