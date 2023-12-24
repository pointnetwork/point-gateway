import cluster, { Worker } from 'cluster';
import pidtree from 'pidtree';
import { rmdir } from 'fs/promises';
import mkdirp from 'mkdirp';
import { server } from './web2server';
import { isNewerVersion } from './utils/encodedTagCmp';
import { getRepoInfo } from './utils/getEngineInfo';
import { getInstalledEngineTag } from './utils/getInstalledEngineTag';
import { encodeTag } from './utils/encodeTag';
import { createContext } from './utils/createContext';
import { downloadEngine } from './utils/downloadEngine';
import { startEngine } from './utils/startEngine';
import { engineHealthCheck } from './utils/engineHealthCheck';
import { getContextPath } from './utils/getContextPath';
import { log } from './utils/logger';
import { getInstalledSdkTag } from './utils/getInstalledSdkTag';
import { downloadSdk } from './utils/downloadSdk';

const PLATFORM = 'linux';
const OUTDATED_GATEWAY_SHUTDOWN_TIME = 30;
const CHECK_NEW_VERSION_INTERVAL_TIME = 10 * 60; // seconds
const GATEWAY_PORT = 5000;

function startGateway(envVars: Record<string, string | number>): Worker {
  return cluster.fork(envVars);
}

const workers: Record<string, Worker> = {};
const engines: Record<string, any> = {};

async function main(startServer = false) {
  if (cluster.isMaster) {
    await Promise.all([mkdirp('./opt/engine'), mkdirp('./opt/sdk')]);
    const [
      { assetsUrl: engineAssetsUrl, latestTag: engineLatestTag },
      { assetsUrl: sdkAssetsUrl, latestTag: sdkLatestTag },
      engineCurrentEncodedTag,
      sdkCurrentEncodedTag,
    ] = await Promise.all([
      getRepoInfo('engine'),
      getRepoInfo('sdk'),
      getInstalledEngineTag(),
      getInstalledSdkTag(),
    ]);

    const engineLatestEncodedTag = encodeTag(engineLatestTag);
    const sdkLatestEncodedTag = encodeTag(sdkLatestTag);
    const isNewEngineVersion = isNewerVersion(
      engineLatestEncodedTag,
      engineCurrentEncodedTag || '0_0_0'
    );
    const isNewSdkVersion = isNewerVersion(
      sdkLatestEncodedTag,
      sdkCurrentEncodedTag || '0_0_0'
    );

    if (isNewEngineVersion || isNewSdkVersion || startServer) {
      const context = await createContext(engineLatestTag);
      if (isNewEngineVersion) {
        log.info(
          `There is a new engine version available. Downloading version ${engineLatestTag}`
        );
        await downloadEngine(engineAssetsUrl, engineLatestTag, PLATFORM);
      }
      if (isNewSdkVersion) {
        log.info(
          `There is a new SDK version available. Downloading version ${sdkLatestTag}`
        );
        await downloadSdk(sdkAssetsUrl, sdkLatestTag);
      }
      log.info('Starting engine');
      engines[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`] =
        startEngine({
          tag: engineLatestTag,
          platform: PLATFORM,
          sdkPath: `./opt/sdk/${sdkLatestEncodedTag}`,
          ...context,
        });
      if (await engineHealthCheck(context.proxyPort, engineLatestTag, 20)) {
        log.info('Starting new gateway pointing to latest engine');
        const worker = startGateway({
          ENGINE_PROXY_PORT: context.proxyPort,
          ENGINE_VERSION: engineLatestEncodedTag,
          SDK_VERSION: sdkLatestEncodedTag,
        });
        Object.values(workers).forEach((existingWorker) => {
          existingWorker.send({
            newEngineVersion: engineLatestTag,
            newSdkVersion: sdkLatestTag,
          });
        });
        worker.on('exit', () => {
          log.info('Old gateway has been shut down. Stopping old engine.');
          delete workers[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`];
          const { pid } =
            engines[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`];
          pidtree(pid, function (err, pids) {
            pids.forEach((childrenPid) => process.kill(childrenPid));
          });
        });
        workers[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`] = worker;
      } else {
        log.error(
          'Healtcheck for the new engine has failed after many retries'
        );
        const { pid } =
          engines[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`];
        pidtree(pid, function (err, pids) {
          pids.forEach((childrenPid) => process.kill(childrenPid));
        });
        delete engines[`${engineLatestEncodedTag}__${sdkLatestEncodedTag}`];
        rmdir(getContextPath(engineLatestTag), { recursive: true });
      }
    }
    setTimeout(main, CHECK_NEW_VERSION_INTERVAL_TIME * 1000);
  } else {
    process.on(
      'message',
      function (msg: { newEngineVersion: string; newSdkVersion: string }) {
        if (
          (msg.newEngineVersion &&
            isNewerVersion(
              encodeTag(msg.newEngineVersion),
              process.env.ENGINE_VERSION
            )) ||
          (msg.newSdkVersion &&
            isNewerVersion(
              encodeTag(msg.newSdkVersion),
              process.env.SDK_VERSION
            ))
        ) {
          log.info(
            `Turning down old gateway version in ${OUTDATED_GATEWAY_SHUTDOWN_TIME} seconds`
          );
          setTimeout(
            () => process.exit(),
            OUTDATED_GATEWAY_SHUTDOWN_TIME * 1000
          );
        }
      }
    );
    server.listen(GATEWAY_PORT, '0.0.0.0', (err) => {
      if (err) {
        log.error(err);
      } else {
        log.info(
          `Gateway connected to the engine version ${process.env.ENGINE_VERSION}, sdk version ${process.env.SDK_VERSION}`
        );
      }
    });
  }
}

main(true);
