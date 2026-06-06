export type OutputPart =
  | { kind: "text"; value: string }
  | { kind: "link"; label: string; href: string };

export type OutputLine = OutputPart[];

export type TerminalOutput = {
  lines: OutputLine[];
};

export type CommandResult =
  | { type: "output"; content: TerminalOutput }
  | { type: "error"; lines: string[] }
  | { type: "clear" }
  | { type: "exit"; message: string };

export type TerminalLine = {
  id: string;
  kind: "command" | "output" | "error";
  command?: string;
  output?: TerminalOutput;
  error?: string[];
};

export type ExecuteContext = {
  history: string[];
};

export type CommandRegistryEntry = {
  command: string;
  aliases: string[];
  description: string;
  short_description: string;
  category: string;
  hidden: boolean;
  example: string;
  data_key?: string;
  accepts_args?: boolean;
  arg_description?: string;
  response?: string;
};
