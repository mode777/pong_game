# Add logging

This project needs logging. Add a static logger class to the common module (/src/common/log.ts)

Implement the following interface
```typescript
type LogLevel = "trace" | "debug" | "info" | "warn" | "error"

type LoggerConfig = {
  defaultLevel: LogLevel; // default: info
  domains: Record<string, LogLevel>;
};

interface Logger {
    // configures logging for the whole project. If this is not called it is implicitly called on the first logging call. This will also try to read a "log" parameter from the url that overrides the default log level
    static configureLogging(config?: LoggerConfig)
    // creates a logger for the given domain
    static create(domain: string): Logger
    trace()
    debug()
    info()
    warn()
    error()
}
```

Implementation should use the loglevel library (please install) for the but should not expose any of it's types.
