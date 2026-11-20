export function readKeys(source) {
  const keys = new Set();
  const duplicates = new Set();
  const lines = source.replace(/^\uFEFF/, "").split(/\r\n|\n|\r/);

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trimStart();
    if (!line || line.startsWith("#")) continue;

    const assignment = /^(?:export\s+)?(?:'([A-Za-z_][A-Za-z0-9_]*)'|([A-Za-z_][A-Za-z0-9_]*))\s*=\s*(.*)$/.exec(line);
    const invalid = () => new Error(`Invalid assignment near line ${index + 1}.`);
    if (!assignment) throw invalid();
    const key = assignment[1] ?? assignment[2];
    const value = assignment[3];
    const quote = value[0];
    if (quote === "'" || quote === '"') {
      const closing = quote === "'" ? /^(?:\\'|[^'])*'/ : /^(?:\\["\\]|[^"])*"/;
      let rest = value.slice(1);
      let end = closing.exec(rest);
      const error = invalid();
      while (!end && index + 1 < lines.length) {
        rest = lines[++index];
        end = closing.exec(rest);
      }
      if (!end || !/^\s*(?:#.*)?$/.test(rest.slice(end[0].length))) throw error;
    }
    if (keys.has(key)) duplicates.add(key);
    keys.add(key);
  }
  return {keys, duplicates};
}

export function compare(template, target, strict = false) {
  const missing = [...template.keys].filter(key => !target.keys.has(key)).sort();
  const extra = [...target.keys].filter(key => !template.keys.has(key)).sort();
  return {
    ok: !(missing.length || template.duplicates.size || target.duplicates.size || (strict && extra.length)),
    missing,
    extra,
    templateDuplicates: [...template.duplicates].sort(),
    targetDuplicates: [...target.duplicates].sort(),
  };
}
