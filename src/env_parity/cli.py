import argparse
import json
from pathlib import Path
import re
import sys

from dotenv.parser import parse_stream

KEY = re.compile(r"[A-Za-z_][A-Za-z0-9_]*")


def read_keys(path):
    keys = set()
    duplicates = set()
    with path.open(encoding="utf-8-sig") as stream:
        for binding in parse_stream(stream):
            if binding.error:
                raise ValueError(f"invalid dotenv syntax near line {binding.original.line}")
            if binding.key is None:
                continue
            if binding.value is None or not KEY.fullmatch(binding.key):
                raise ValueError(f"invalid assignment near line {binding.original.line}")
            if binding.key in keys:
                duplicates.add(binding.key)
            keys.add(binding.key)
    return keys, duplicates


def main(argv=None):
    parser = argparse.ArgumentParser(description="Compare dotenv keys without printing values.")
    parser.add_argument("template", type=Path)
    parser.add_argument("target", type=Path)
    parser.add_argument("--strict", action="store_true", help="Also fail on keys absent from the template.")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    inputs = []
    for label, path in (("template", args.template), ("target", args.target)):
        try:
            inputs.append(read_keys(path))
        except (OSError, UnicodeError):
            print(f"{label}: could not read a UTF-8 dotenv file", file=sys.stderr)
            return 2
        except ValueError as error:
            print(f"{label}: {error}", file=sys.stderr)
            return 2
    (expected, template_duplicates), (actual, target_duplicates) = inputs
    result = {
        "missing": sorted(expected - actual),
        "extra": sorted(actual - expected),
        "template_duplicates": sorted(template_duplicates),
        "target_duplicates": sorted(target_duplicates),
    }
    failed = bool(result["missing"] or template_duplicates or target_duplicates or (args.strict and result["extra"]))
    if args.json:
        print(json.dumps({"ok": not failed, **result}, sort_keys=True))
    elif any(result.values()):
        for label, keys in result.items():
            if keys:
                print(f"{label}: {', '.join(keys)}")
    else:
        print("Environment keys match.")
    return int(failed)
