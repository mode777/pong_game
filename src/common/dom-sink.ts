import { LogLevel, LogSink } from "./log";

export type DomSinkOptions = {
  maxLines?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: string;
  height?: string;
  zIndex?: number;
};

export class DomSink implements LogSink {
  private container: HTMLDivElement;
  private logContainer: HTMLDivElement;
  private maxLines: number;

  constructor(options: DomSinkOptions = {}) {
    this.maxLines = options.maxLines || 100;

    // Create overlay container
    this.container = document.createElement('div');
    this.container.style.position = 'fixed';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.container.style.color = '#ffffff';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.padding = '10px';
    this.container.style.overflow = 'auto';
    this.container.style.pointerEvents = 'auto';
    this.container.style.boxSizing = 'border-box';
    this.container.style.zIndex = String(options.zIndex || 10000);

    // Set position
    const position = options.position || 'top-right';
    switch (position) {
      case 'top-left':
        this.container.style.top = '10px';
        this.container.style.left = '10px';
        break;
      case 'top-right':
        this.container.style.top = '10px';
        this.container.style.right = '10px';
        break;
      case 'bottom-left':
        this.container.style.bottom = '10px';
        this.container.style.left = '10px';
        break;
      case 'bottom-right':
        this.container.style.bottom = '10px';
        this.container.style.right = '10px';
        break;
    }

    this.container.style.width = options.width || '400px';
    this.container.style.height = options.height || '300px';

    // Create log container
    this.logContainer = document.createElement('div');
    this.container.appendChild(this.logContainer);

    // Add to document
    if (document.body) {
      document.body.appendChild(this.container);
    } else {
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(this.container);
      });
    }
  }

  private formatArgs(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'string') {
        return arg;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
  }

  private addLogEntry(level: LogLevel, args: any[]): void {
    const entry = document.createElement('div');
    entry.style.marginBottom = '4px';
    entry.style.wordWrap = 'break-word';

    // Color based on log level
    const colors: Record<LogLevel, string> = {
      trace: '#888888',
      debug: '#00aaff',
      info: '#00ff00',
      warn: '#ffaa00',
      error: '#ff0000',
    };
    entry.style.color = colors[level];

    // Add timestamp
    const timestamp = new Date().toISOString().substring(11, 23);
    entry.textContent = `[${timestamp}] ${this.formatArgs(args)}`;

    this.logContainer.appendChild(entry);

    // Limit number of log lines
    while (this.logContainer.children.length > this.maxLines) {
      this.logContainer.removeChild(this.logContainer.firstChild!);
    }

    // Auto-scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;
  }

  trace(...args: any[]): void {
    this.addLogEntry('trace', args);
  }

  debug(...args: any[]): void {
    this.addLogEntry('debug', args);
  }

  info(...args: any[]): void {
    this.addLogEntry('info', args);
  }

  warn(...args: any[]): void {
    this.addLogEntry('warn', args);
  }

  error(...args: any[]): void {
    this.addLogEntry('error', args);
  }

  destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  clear(): void {
    this.logContainer.innerHTML = '';
  }
}