import pino from 'pino';
import UdpTransport from 'pino-udp';
import { multistream } from 'pino-multi-stream';
import ecsFormat from '@elastic/ecs-pino-format';
import { noop } from './noop';

const logCfg: { level: string; sendLogsTo: string } = {
  level: 'info',
  sendLogsTo: 'http://logstash.pointspace.io:12201',
};
const enabled = !!logCfg;
const level = logCfg?.level || 'info';
const sendLogsTo: string = logCfg?.sendLogsTo as string;

const options = { enabled, formatters: ecsFormat().formatters, level };
const streams: any[] = [];
let sendMetric = noop as Function;

if (sendLogsTo) {
  const [address, port] = (sendLogsTo.split('://').pop() as string).split(':');
  const udpTransport = new UdpTransport({ address, port });
  streams.push(udpTransport);
  sendMetric = function (
    this: any,
    metricsLabels: Record<string, string | number | boolean>
  ) {
    let originalChilds;
    try {
      const chindings = `{${
        this?.[pino.symbols.chindingsSym]?.slice(1) || ''
      }}`;
      originalChilds = JSON.parse(chindings);
    } catch {
      // do nothing
    }
    udpTransport.write(
      Buffer.from(JSON.stringify({ ...originalChilds, ...metricsLabels })),
      noop
    );
  };
}

streams.push({
  level: options.level,
  stream: pino({ prettyPrint: { colorize: true } })[pino.symbols.streamSym],
});

let logger = pino(options, multistream(streams));

logger = logger.child({ service: 'point-gateway' });

const close = () => {
  for (const { stream } of streams) {
    if (stream && typeof stream.close === 'function') {
      stream.close();
    }
  }
};

export const log = Object.assign(logger, {
  close,
  sendMetric,
});
