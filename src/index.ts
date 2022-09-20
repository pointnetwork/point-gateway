import cluster, { Worker } from 'cluster';
import pidtree from 'pidtree';
import { rmdir } from 'fs/promises';
import mkdirp from 'mkdirp';
import { server } from './web2server';
import { isNewerVersion } from './utils/encodedTagCmp';
import { getRepoInfo } from './utils/getPointNodeInfo';
import { getInstalledNodeTag } from './utils/getInstalledNodeTag';
import { encodeTag } from './utils/encodeTag';
import { createContext } from './utils/createContext';
import { downloadPointNode } from './utils/downloadPointNode';
import { startPointNode } from './utils/startPointNode';
import { nodePointHealthCheck } from './utils/nodePointHealthCheck';
import { getContextPath } from './utils/getContextPath';
import { log } from './utils/logger';
import { getInstalledSdkTag } from './utils/getInstalledSdkTag';
import { downloadPointSdk } from './utils/downloadPointSdk';

const PLATFORM = 'linux';
const OUTDATED_GATEWAY_SHUTDOWN_TIME = 30;
const CHECK_NEW_VERSION_INTERVAL_TIME = 10 * 60; // seconds
const GATEWAY_PORT = 5000;

function startGateway(envVars: Record<string, string | number>): Worker {
  return cluster.fork(envVars);
}

const workers: Record<string, Worker> = {};
const pointNodes: Record<string, any> = {};

async function main(startServer = false) {
  if (cluster.isMaster) {
    await Promise.all([mkdirp('./opt/engine'), mkdirp('./opt/sdk')]);
    const [
      { assetsUrl: pointAssetsUrl, latestTag: pointLatestTag },
      { assetsUrl: sdkAssetsUrl, latestTag: sdkLatestTag },
      pointCurrentEncodedTag,
      sdkCurrentEncodedTag,
    ] = await Promise.all([
      getRepoInfo('engine'),
      getRepoInfo('sdk'),
      getInstalledNodeTag(),
      getInstalledSdkTag(),
    ]);

    const pointLatestEncodedTag = encodeTag(pointLatestTag);
    const sdkLatestEncodedTag = encodeTag(sdkLatestTag);
    const isNewPointVersion = isNewerVersion(
      pointLatestEncodedTag,
      pointCurrentEncodedTag || '0_0_0'
    );
    const isNewSdkVersion = isNewerVersion(
      sdkLatestEncodedTag,
      sdkCurrentEncodedTag || '0_0_0'
    );

    if (isNewPointVersion || isNewSdkVersion || startServer) {
      const context = await createContext(pointLatestTag);
      if (isNewPointVersion) {
        log.info(
          `There is a new engine version available. Downloading version ${pointLatestTag}`
        );
        await downloadPointNode(pointAssetsUrl, pointLatestTag, PLATFORM);
      }
      if (isNewSdkVersion) {
        log.info(
          `There is a new SDK version available. Downloading version ${sdkLatestTag}`
        );
        await downloadPointSdk(sdkAssetsUrl, sdkLatestTag);
      }
      log.info('Starting point node');
      pointNodes[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`] =
        startPointNode({
          tag: pointLatestTag,
          platform: PLATFORM,
          sdkPath: `./opt/sdk/${sdkLatestEncodedTag}`,
          ...context,
        });
      if (await nodePointHealthCheck(context.proxyPort, pointLatestTag, 20)) {
        log.info('Starting new gateway pointing to latest point node');
        const worker = startGateway({
          POINT_NODE_PROXY_PORT: context.proxyPort,
          POINT_NODE_VERSION: pointLatestEncodedTag,
          POINT_SDK_VERSION: sdkLatestEncodedTag,
        });
        Object.values(workers).forEach((existingWorker) => {
          existingWorker.send({
            newPointVersion: pointLatestTag,
            newSdkVersion: sdkLatestTag,
          });
        });
        worker.on('exit', () => {
          log.info('Old gateway has been shut down. Stopping old point node.');
          delete workers[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`];
          const { pid } =
            pointNodes[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`];
          pidtree(pid, function (err, pids) {
            pids.forEach((childrenPid) => process.kill(childrenPid));
          });
        });
        workers[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`] = worker;
      } else {
        log.error(
          'Healtcheck for new point node has failed after many retries'
        );
        const { pid } =
          pointNodes[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`];
        pidtree(pid, function (err, pids) {
          pids.forEach((childrenPid) => process.kill(childrenPid));
        });
        delete pointNodes[`${pointLatestEncodedTag}__${sdkLatestEncodedTag}`];
        rmdir(getContextPath(pointLatestTag), { recursive: true });
      }
    }
    setTimeout(main, CHECK_NEW_VERSION_INTERVAL_TIME * 1000);
  } else {
    process.on(
      'message',
      function (msg: { newPointVersion: string; newSdkVersion: string }) {
        if (
          (msg.newPointVersion &&
            isNewerVersion(
              encodeTag(msg.newPointVersion),
              process.env.POINT_NODE_VERSION
            )) ||
          (msg.newSdkVersion &&
            isNewerVersion(
              encodeTag(msg.newSdkVersion),
              process.env.POINT_SDK_VERSION
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
    server.listen(GATEWAY_PORT, (err) => {
      if (err) {
        log.error(err);
      } else {
        log.info(
          `Gateway connected to point node version ${process.env.POINT_NODE_VERSION}, sdk version ${process.env.POINT_SDK_VERSION}`
        );
      }
    });
  }
}

main(true);
