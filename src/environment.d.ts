declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENGINE_PROXY_PORT: number;
      ENGINE_VERSION: string;
      SDK_VERSION: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
