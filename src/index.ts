import cluster, { Worker } from 'cluster';
import pidtree from 'pidtree';
import { rmdir } from 'fs/promises';
import { server } from './web2server';
import { isNewerVersion } from './utils/encodedTagCmp';
import { getPointNodeInfo } from './utils/getPointNodeInfo';
import { getInstalledTag } from './utils/getInstalledTag';
import { encodeTag } from './utils/encodeTag';
import { createContext } from './utils/createContext';
import { downloadPointNode } from './utils/downloadPointNode';
import { startPointNode } from './utils/startPointNode';
import { nodePointHealthCheck } from './utils/nodePointHealthCheck';
import { getContextPath } from './utils/getContextPath';
import { log } from './utils/logger';

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
    const { assetsUrl, latestTag } = await getPointNodeInfo();
    const currentEncodedTag = await getInstalledTag();
    const latestEncodedTag = encodeTag(latestTag);
    const isNewVersion = isNewerVersion(
      latestEncodedTag,
      currentEncodedTag || '0_0_0'
    );
    if (isNewVersion || startServer) {
      const context = await createContext(
        latestTag,
        process.env.POINT_KEY_PATH
      );
      if (isNewVersion) {
        log.info(
          `There is a new version available. Downloading version ${latestTag}`
        );
        await downloadPointNode(assetsUrl, latestTag, PLATFORM);
      }
      log.info('Starting point node');
      pointNodes[latestEncodedTag] = startPointNode({
        tag: latestTag,
        platform: PLATFORM,
        ...context,
      });
      if (await nodePointHealthCheck(context.proxyPort, latestTag, 20)) {
        log.info('Starting new gateway pointing to latest point node');
        const worker = startGateway({
          POINT_NODE_PROXY_PORT: context.proxyPort,
          POINT_NODE_VERSION: latestEncodedTag,
        });
        Object.values(workers).forEach((existingWorker) => {
          existingWorker.send({ newVersion: latestTag });
        });
        worker.on('exit', () => {
          log.info('Old gateway has been shut down. Stopping old point node.');
          delete workers[latestEncodedTag];
          const { pid } = pointNodes[latestEncodedTag];
          pidtree(pid, function (err, pids) {
            pids.forEach((childrenPid) => process.kill(childrenPid));
          });
        });
        workers[latestEncodedTag] = worker;
      } else {
        log.error(
          'Healtcheck for new point node has failed after many retries'
        );
        const { pid } = pointNodes[latestEncodedTag];
        pidtree(pid, function (err, pids) {
          pids.forEach((childrenPid) => process.kill(childrenPid));
        });
        delete pointNodes[latestEncodedTag];
        rmdir(getContextPath(latestTag), { recursive: true });
      }
    }
    setTimeout(main, CHECK_NEW_VERSION_INTERVAL_TIME * 1000);
  } else {
    process.on('message', function (msg: { newVersion: string }) {
      if (msg.newVersion) {
        if (
          isNewerVersion(
            encodeTag(msg.newVersion),
            process.env.POINT_NODE_VERSION
          )
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
    });
    server.listen(GATEWAY_PORT, (err) => {
      if (err) {
        log.error(err);
      } else {
        log.info(
          `Gateway connected to point node version ${process.env.POINT_NODE_VERSION}`
        );
      }
    });
  }
}

main(true);
