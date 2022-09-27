import fastify from 'fastify';
import proxy from 'fastify-http-proxy';
import { log } from './utils/logger';

export const server = fastify({ logger: true });

const ENGINE_PROXY_PORT = process.env.ENGINE_PROXY_PORT || 8666;
const ENGINE_URL = `https://localhost:${ENGINE_PROXY_PORT}`;

server.register(proxy, {
  upstream: ENGINE_URL,
  websocket: true,
  replyOptions: {
    rewriteRequestHeaders: (request, headers) => {
      const { rawHeaders } = request;
      const host = rawHeaders[rawHeaders.indexOf('Host') + 1];
      return { ...headers, host: host.split('.').slice(0, -1).join('.') };
    },
    onError: (reply, error) => {
      try {
        // this error is not parseable
        // if (JSON.parse(error).code === 'FST_ERR_CTP_INVALID_MEDIA_TYPE') {
        //   reply.send(
        //     'The site is only available in read mode. Please run Point Network to get full access to Web 3.0.'
        //   );
        // } else {
        //   reply.send(error);
        // }
        reply.send(error);
      } catch (e) {
        log.error('Proxy error:', e);
        reply.send(error);
      }
    },
  },
});
