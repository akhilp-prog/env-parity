import {compare, readKeys} from "./compare.mjs";

const byId = id => document.getElementById(id);
const status = byId("status");
const results = byId("results");
const template = byId("template");
const target = byId("target");
const strict = byId("strict");
const compareButton = byId("compare");
const example = byId("example");

function clearResults() {
  status.textContent = "";
  results.replaceChildren();
  results.hidden = true;
}

function render(result) {
  status.textContent = result.ok ? "Check passed." : "Check failed.";
  const groups = [
    ["Missing keys", result.missing],
    ["Extra keys", result.extra],
    ["Template duplicates", result.templateDuplicates],
    ["Target duplicates", result.targetDuplicates],
  ];

  for (const [label, keys] of groups) {
    const card = document.createElement("article");
    const heading = document.createElement("h2");
    heading.textContent = `${label} (${keys.length})`;
    card.append(heading);
    if (keys.length) {
      const list = document.createElement("ul");
      for (const key of keys) {
        const item = document.createElement("li");
        item.textContent = key;
        list.append(item);
      }
      card.append(list);
    } else {
      const empty = document.createElement("p");
      empty.textContent = "None";
      card.append(empty);
    }
    results.append(card);
  }
  results.hidden = false;
}

async function readFile(input, label) {
  const file = input.files[0];
  if (!file) throw new Error(`Choose a ${label.toLowerCase()} file.`);
  if (file.size > 1024 * 1024) throw new Error(`${label} exceeds the 1 MiB limit.`);
  let source;
  try {
    source = new TextDecoder("utf-8", {fatal: true}).decode(await file.arrayBuffer());
  } catch {
    throw new Error(`${label} could not be read as UTF-8.`);
  }
  try {
    return readKeys(source);
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

for (const control of [template, target, strict]) {
  control.addEventListener("change", clearResults);
}
compareButton.addEventListener("click", async () => {
  clearResults();
  const controls = [template, target, strict, compareButton, example];
  controls.forEach(control => { control.disabled = true; });
  try {
    const expected = await readFile(template, "Template");
    const actual = await readFile(target, "Target");
    render(compare(expected, actual, strict.checked));
  } catch (error) {
    status.textContent = error.message;
  } finally {
    controls.forEach(control => { control.disabled = false; });
  }
});
example.addEventListener("click", () => {
  clearResults();
  template.value = "";
  target.value = "";
  render(compare(readKeys("DATABASE_URL=\nAPI_TOKEN="), readKeys("DATABASE_URL=example\nDEBUG=true"), strict.checked));
  status.textContent = "Example · " + status.textContent;
});
