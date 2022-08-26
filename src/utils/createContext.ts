import { join } from 'path';
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
    const keysPath = join(keystoreSrc || '', 'key.json');
    const fileExist = await fileExists(keysPath);
    console.log({ keysPath, keystoreSrc, fileExist });
    if (keystoreSrc && fileExist) {
      console.log(`Found identity in ${keysPath}`);
      await copyFile(keysPath, keystorePath);
    } else {
      console.log('Creating new identity');
      await generateAndSaveKeys(keystorePath);
    }
    return {
      apiPort: await apiPorts.getFreePort(),
      proxyPort: await proxyPorts.getFreePort(),
      datadirPath,
      keystorePath,
    };
  };
}

export const createContext = createContextFactory();
