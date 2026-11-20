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
