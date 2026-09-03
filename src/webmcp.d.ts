export {};

declare global {
  type MiaunologWebMcpToolAnnotations = {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };

  type MiaunologWebMcpTool = {
    name: string;
    title?: string;
    description: string;
    inputSchema?: Record<string, unknown>;
    execute: (
      input: Record<string, unknown>,
      options: { signal: AbortSignal },
    ) => unknown | Promise<unknown>;
    annotations?: MiaunologWebMcpToolAnnotations;
  };

  interface ModelContext {
    registerTool(
      tool: MiaunologWebMcpTool,
      options?: { signal?: AbortSignal; exposedTo?: string[] },
    ): Promise<void>;
    getTools(options?: Record<string, unknown>): Promise<unknown[]>;
  }

  interface Document {
    readonly modelContext?: ModelContext;
  }

  interface Window {
    __miaunologWebMcpAbort?: AbortController;
  }
}
