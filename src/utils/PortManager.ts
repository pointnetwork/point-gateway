/* Copyright © 2020 Ganchrow Scientific, SA all rights reserved */

import * as isPortUsed from 'tcp-port-used';

export class PortManager {
  private allPorts: number[] = [];

  constructor(initialPort: number, finalPort: number) {
    this.allPorts = Array.from(
      Array(finalPort - initialPort + 1),
      (_el, ix) => ix + initialPort
    );
  }

  public async getFreePort(): Promise<number> | never {
    try {
      if (this.allPorts.length > 0) {
        const position = this.getRandomNumber(0, this.allPorts.length);
        const port = this.allPorts[position];
        this.allPorts.splice(position, 1);
        if (!(await isPortUsed.check(port, '0.0.0.0'))) {
          return port;
        }
        throw Error(`Port in use ${port}`);
      }
      return Promise.reject(Error('Not available ports'));
    } catch {
      return this.getFreePort();
    }
  }

  private getRandomNumber(initial: number, final: number): number {
    const min = Math.ceil(initial);
    const max = Math.floor(final);
    const randomPort = Math.floor(Math.random() * (max - min) + min);
    return randomPort;
  }
}
