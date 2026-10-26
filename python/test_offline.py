import importlib.util
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("example", ROOT / "python/01-inspect-public-server/main.py")
example = importlib.util.module_from_spec(spec)
spec.loader.exec_module(example)


class OfflineTests(unittest.TestCase):
    def test_fixture(self):
        result = json.loads((ROOT / "fixtures/inspection/synthetic.json").read_text())
        self.assertIn("OFFLINE | SYNTHETIC SAMPLE", example.projection(result, False)[0])

    def test_terminal(self):
        self.assertNotIn("\x1b", example.text("\x1b[31mSAMPLE\n"))

    def test_endpoint(self):
        for value in ["http://localhost/mcp", "https://127.0.0.1/mcp", "https://host.local/mcp", "https://user:secret@did.is/mcp", "https://did.is/mcp?token=secret", "https://did.is/mcp#secret"]:
            with self.assertRaises(ValueError):
                example.endpoint(value)
        self.assertEqual(example.endpoint("https://did.is/mcp"), "https://did.is/mcp")

    def test_malformed(self):
        with self.assertRaises(RuntimeError):
            example.projection({"status": "INSPECTED"}, False)


if __name__ == "__main__":
    unittest.main()
