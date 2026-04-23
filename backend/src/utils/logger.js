const PII_PATTERNS = [
  /Bearer\s+\S+/gi,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}\b/g,
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
]

function scrub(value) {
  if (typeof value !== 'string') return value
  return PII_PATTERNS.reduce((str, pattern) => str.replace(pattern, '[REDACTED]'), value)
}

function scrubArgs(args) {
  return args.map((arg) => {
    if (typeof arg === 'string') return scrub(arg)
    if (arg instanceof Error) return { message: scrub(arg.message), name: arg.name }
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.parse(scrub(JSON.stringify(arg)))
      } catch {
        return '[unserializable]'
      }
    }
    return arg
  })
}

function log(level, ...args) {
  const clean = scrubArgs(args)
  if (process.env.NODE_ENV === 'production') {
    console[level](JSON.stringify({ level, timestamp: new Date().toISOString(), message: clean }))
  } else {
    console[level](`[${level.toUpperCase()}]`, ...clean)
  }
}

export const logger = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
  debug: (...args) => process.env.NODE_ENV !== 'production' && log('debug', ...args),
}
