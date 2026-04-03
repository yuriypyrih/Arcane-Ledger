export type ParsedCliArgs = {
  flags: Set<string>;
  values: Map<string, string>;
};

export function parseCliArgs(args: string[] = process.argv.slice(2)): ParsedCliArgs {
  const flags = new Set<string>();
  const values = new Map<string, string>();

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (!argument || !argument.startsWith("--")) {
      continue;
    }

    const normalizedArgument = argument.slice(2);

    if (normalizedArgument.includes("=")) {
      const [key, ...rawValue] = normalizedArgument.split("=");
      if (!key) {
        continue;
      }
      values.set(key, rawValue.join("="));
      continue;
    }

    const nextArgument = args[index + 1];

    if (typeof nextArgument === "string" && !nextArgument.startsWith("--")) {
      values.set(normalizedArgument, nextArgument);
      index += 1;
      continue;
    }

    flags.add(normalizedArgument);
  }

  return {
    flags,
    values
  };
}

export function hasFlag(args: ParsedCliArgs, name: string) {
  return args.flags.has(name);
}

export function getOption(args: ParsedCliArgs, name: string) {
  return args.values.get(name);
}
