import * as log from 'loglevel';

export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

export type LogMethod = (...args: any[]) => void;

export type LogSink = {
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
};

export type LoggerConfig = {
  defaultLevel: LogLevel;
  domains?: Record<string, LogLevel>;
  sinks?: LogSink[];
};

// Create a wrapper around loglevel's default behavior
function createDefaultLogSink(): LogSink {
  // Create a temporary logger to get the default methodFactory behavior
  const tempLogger = log.getLogger('__default__');
  const originalFactory = tempLogger.methodFactory.bind(tempLogger);
  
  return {
    trace: originalFactory('trace', log.levels.TRACE, '__default__'),
    debug: originalFactory('debug', log.levels.DEBUG, '__default__'),
    info: originalFactory('info', log.levels.INFO, '__default__'),
    warn: originalFactory('warn', log.levels.WARN, '__default__'),
    error: originalFactory('error', log.levels.ERROR, '__default__'),
  };
}

// Default sink that uses loglevel's built-in behavior
export const CONSOLE_SINK: LogSink = createDefaultLogSink();

export class Logger {
  private static configured = false;
  private static config: LoggerConfig = {
    defaultLevel: "info",
    domains: {},
    sinks: [CONSOLE_SINK]
  };
  private static sinks: LogSink[] = [CONSOLE_SINK];

  private logger: log.Logger;
  private domain: string;

  constructor(domain: string) {
    if (!Logger.configured) {
      Logger.configureLogging();
    }

    this.domain = domain;
    this.logger = log.getLogger(domain);

    // Apply domain-specific or default log level
    const level = Logger.config?.domains?.[domain] || Logger.config.defaultLevel;
    this.logger.setLevel(level);

    // Set up method factory for this logger
    this.setupMethodFactory();
  }

  private get domainPrefix(): string {
    return `[${this.domain}]`;
  }

  static configureLogging(config?: LoggerConfig): void {
    if (config) {
      const sinks = config.sinks || [CONSOLE_SINK];
      Logger.config = {
        defaultLevel: config.defaultLevel || "info",
        domains: config.domains || {},
        sinks: sinks
      };
      Logger.sinks = sinks;
    }

    // Try to read log level from URL parameter
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const logParam = urlParams.get('log');
      if (logParam && isValidLogLevel(logParam)) {
        Logger.config.defaultLevel = logParam as LogLevel;
      }
    }

    // Set default level for root logger
    log.setLevel(Logger.config.defaultLevel);

    Logger.configured = true;
  }

  private setupMethodFactory(): void {
    const originalFactory = this.logger.methodFactory;
    const domain = this.domain;
    const sinks = Logger.sinks;

    this.logger.methodFactory = function (methodName, level, loggerName) {
      const rawMethod = originalFactory(methodName, level, loggerName);
      
      return function (...args: any[]) {
        // Add domain prefix to the first argument if available
        const prefixedArgs = [`[${domain}]`, ...args];
        
        // Call all configured sinks
        sinks.forEach(sink => {
          try {
            sink[methodName](...prefixedArgs);
          } catch (err) {
            // If a sink fails, log to console and continue
            console.error(`Logger sink failed for ${methodName}:`, err);
          }
        });
      };
    };

    // Rebuild the logger methods with the new factory
    this.logger.setLevel(this.logger.getLevel());
  }

  trace(...args: any[]): void {
    if (this.logger.getLevel() <= log.levels.TRACE) {
      this.logger.trace(...args);
    }
  }

  debug(...args: any[]): void {
    if (this.logger.getLevel() <= log.levels.DEBUG) {
      this.logger.debug(...args);
    }
  }

  info(...args: any[]): void {
    if (this.logger.getLevel() <= log.levels.INFO) {
      this.logger.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (this.logger.getLevel() <= log.levels.WARN) {
      this.logger.warn(...args);
    }
  }

  error(...args: any[]): void {
    if (this.logger.getLevel() <= log.levels.ERROR) {
      this.logger.error(...args);
    }
  }
}

function isValidLogLevel(level: string): level is LogLevel {
  return ["trace", "debug", "info", "warn", "error"].includes(level);
}
