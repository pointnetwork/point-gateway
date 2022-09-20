import { resolve as pathResolve } from 'path';
import { copyFile } from 'fs/promises';
import { fileExists } from './fileExists';
import { getContextPath } from './getContextPath';
import { makeSurePathExists } from './makeSurePathExists';
import { PortManager } from './PortManager';
import { generateAndSaveKeys } from './generateAndSaveKeys';

function createContextFactory() {
  const proxyPorts = new PortManager(3666, 3800);
  const apiPorts = new PortManager(2468, 2490);
  return async function createContext(tagName: string, keystoreSrc?: string) {
    const datadirPath = getContextPath(tagName);
    const keystorePath = `${datadirPath}/keystore`;
    await makeSurePathExists(keystorePath, true);
    const keysPath = pathResolve(keystoreSrc || '', 'key.json');
    const sdkPath = pathResolve(datadirPath, 'pointsdk-v0.0.37.js'); // TODO
    if (keystoreSrc && (await fileExists(keysPath))) {
      await copyFile(keysPath, `${keystorePath}/key.json`);
    } else {
      await generateAndSaveKeys(keystorePath);
    }
    return {
      apiPort: await apiPorts.getFreePort(),
      proxyPort: await proxyPorts.getFreePort(),
      datadirPath,
      keystorePath,
      sdkPath,
    };
  };
}

export const createContext = createContextFactory();
