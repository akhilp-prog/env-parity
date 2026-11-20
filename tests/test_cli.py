from contextlib import redirect_stderr, redirect_stdout
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from env_parity.cli import main


class CliTests(unittest.TestCase):
    def invoke(self, template, target, *flags):
        with TemporaryDirectory() as directory:
            a, b = (Path(directory) / name for name in ("template", "target"))
            a.write_text(template, encoding="utf-8")
            b.write_text(target, encoding="utf-8")
            output = StringIO()
            with redirect_stdout(output), redirect_stderr(output):
                status = main([str(a), str(b), *flags])
            return status, output.getvalue()

    def test_reports_keys_without_values(self):
        status, output = self.invoke("TOKEN=\nPORT=\n", "TOKEN=secret-canary\nOTHER=abc\n", "--json")
        self.assertEqual(status, 1)
        self.assertIn('"missing": ["PORT"]', output)
        self.assertNotIn("secret-canary", output)

    def test_extra_keys_only_fail_in_strict_mode(self):
        args = ("PORT=\n", "PORT=3000\nEXTRA=123\n")
        self.assertEqual(self.invoke(*args)[0], 0)
        self.assertEqual(self.invoke(*args, "--strict")[0], 1)

    def test_handles_multiline_and_reports_duplicate(self):
        status, output = self.invoke("TOKEN=\n", 'TOKEN="first\nsecond"\nexport TOKEN=third\n')
        self.assertEqual(status, 1)
        self.assertIn("target_duplicates: TOKEN", output)
        self.assertNotIn("second", output)

    def test_invalid_input_does_not_echo_source(self):
        status, output = self.invoke("PORT=\n", 'PORT="secret-canary\n')
        self.assertEqual(status, 2)
        self.assertNotIn("secret-canary", output)
