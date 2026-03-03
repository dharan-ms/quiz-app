type LogMeta = Record<string, unknown>;

function serialize(meta?: LogMeta) {
  return meta ? ` ${JSON.stringify(meta)}` : "";
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}${serialize(meta)}`);
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}${serialize(meta)}`);
  },
  error(message: string, meta?: LogMeta) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}${serialize(meta)}`);
  },
};
