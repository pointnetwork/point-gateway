declare global {
  namespace NodeJS {
    interface ProcessEnv {
      POINT_NODE_PROXY_PORT: number;
      POINT_NODE_VERSION: string;
      POINT_SDK_VERSION: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
