# Env Parity

Compare a dotenv template with a local or CI-generated environment file. Reports show missing, extra, and duplicate variable names. Values are never included in output, and the files are never modified.

## Run

Requires Python 3.10+.

```sh
python -m pip install .
env-parity .env.example .env
env-parity .env.example .env --strict --json
```

The template defines the required keys. Empty values count as assignments. Extra keys are reported and only fail in strict mode. Duplicate keys always fail. The checker does not load variables into your shell, expand references, or verify that values are usable. Keep real environment files out of Git.

| Exit | Meaning |
|---|---|
| 0 | Check passed |
| 1 | Missing keys, duplicates, or extras in strict mode |
| 2 | Invalid input or unreadable file |

Run the test suite with `python -m unittest discover -s tests -v`.

## Browser version

Compare files without installing Python. Select a template and target or use **Try example**. The browser reads the files locally, reports names only, and does not store or upload file contents. Each input can be up to 1 MiB and must be UTF-8.

Serve the static files locally from the repository root:

```sh
python -m http.server 8000 --directory web
```

Open http://localhost:8000. For Vercel, use the repository root and select **Other** if prompted for a framework. The root `vercel.json` publishes `web/` without a build or Python web entry point.
