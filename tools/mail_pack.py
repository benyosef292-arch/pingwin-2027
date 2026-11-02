#!/usr/bin/env python3
"""Encrypt the daily mail summary for the site.

Usage: MAIL_KEY=<team key> python3 tools/mail_pack.py mail.json mail.enc.json

The site decrypts mail.enc.json in the browser with the team link key,
so the repo (which is public) never holds the mail summary in plain text.
"""
import base64, json, os, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

IT = 200_000

def main(src, dst):
    key = os.environ.get("MAIL_KEY", "")
    if not key:
        sys.exit("MAIL_KEY is not set")
    data = json.load(open(src, encoding="utf-8"))
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode()
    salt, iv = os.urandom(16), os.urandom(12)
    k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=IT).derive(key.encode())
    ct = AESGCM(k).encrypt(iv, raw, None)
    b = lambda x: base64.b64encode(x).decode()
    json.dump({"v": 1, "it": IT, "salt": b(salt), "iv": b(iv), "ct": b(ct)}, open(dst, "w"))
    print("wrote", dst, len(raw), "bytes of summary")

if __name__ == "__main__":
    main(*sys.argv[1:3])
