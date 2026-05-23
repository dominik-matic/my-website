const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('node:path');

const PROTO_PATH = path.join(__dirname, 'proto', 'heimdallr.proto');
const HEIMDALLR_ADDR = process.env.HEIMDALLR_ADDR || 'heimdallr:50051';
const CHECK_DEADLINE_MS = 50;

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
});
const proto = grpc.loadPackageDefinition(packageDef).heimdallr.v1;

const client = new proto.RateLimiter(
  HEIMDALLR_ADDR,
  grpc.credentials.createInsecure()
);

function rateLimit(logger) {
  return (req, res, next) => {
    const deadline = new Date(Date.now() + CHECK_DEADLINE_MS);
    const key = `ip:${req.ip}`;

    client.Check({ key }, { deadline }, (err, resp) => {
      if (err) {
        logger.warn(`heimdallr unreachable for ${key}: ${err.message}`);
        return next();
      }
      if (!resp.allowed) {
        const retrySec = Math.max(1, Math.ceil(Number(resp.retryAfterMs) / 1000));
        res.set('Retry-After', String(retrySec));
        return res.status(429).send('Too Many Requests');
      }
      next();
    });
  };
}

module.exports = { rateLimit };
