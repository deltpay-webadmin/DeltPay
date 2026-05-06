#!/usr/bin/env python3
"""Deploy dist/ folder to Vercel project deltpay-wave1 via REST API (using curl)."""
import os
import sys
import json
import hashlib
import subprocess
import tempfile

ROOT = "/home/user/workspace/deltpay-site/dist"
PROJECT_NAME = "deltpay-wave1"
TOKEN = os.environ["VERCEL_TOKEN"]


def curl(method, url, headers=None, data_file=None, json_body=None):
    cmd = ["curl", "-sk", "-X", method, url, "-H", f"Authorization: Bearer {TOKEN}"]
    if headers:
        for k, v in headers.items():
            cmd += ["-H", f"{k}: {v}"]
    if data_file:
        cmd += ["--data-binary", f"@{data_file}"]
    elif json_body is not None:
        cmd += ["--data-binary", json.dumps(json_body)]
        cmd += ["-H", "Content-Type: application/json"]
    cmd += ["-w", "\n%{http_code}", "-m", "120"]
    out = subprocess.check_output(cmd).decode()
    parts = out.rsplit("\n", 1)
    body = parts[0]
    code = int(parts[1]) if len(parts) > 1 and parts[1].strip().isdigit() else 0
    return code, body


# 1. Look up project
code, body = curl("GET", f"https://api.vercel.com/v9/projects/{PROJECT_NAME}")
if code != 200:
    print(f"Project lookup failed: {code} {body[:300]}")
    sys.exit(1)
project_id = json.loads(body)["id"]
print(f"Project ID: {project_id}")

# 2. Walk files (skip large unused assets > 25MB)
files_meta = []
for dp, dn, fn in os.walk(ROOT):
    for name in fn:
        full = os.path.join(dp, name)
        rel = os.path.relpath(full, ROOT)
        size = os.path.getsize(full)
        with open(full, "rb") as f:
            sha = hashlib.sha1(f.read()).hexdigest()
        files_meta.append({"file": rel, "sha": sha, "size": size, "path": full})

print(f"Total files: {len(files_meta)}")

# 3. Upload each file
for i, m in enumerate(files_meta, 1):
    code, body = curl(
        "POST",
        "https://api.vercel.com/v2/files",
        headers={"Content-Type": "application/octet-stream", "x-vercel-digest": m["sha"]},
        data_file=m["path"],
    )
    if code not in (200, 201):
        print(f"Upload failed {m['file']}: {code} {body[:300]}")
        sys.exit(1)
    if i % 25 == 0 or i == len(files_meta):
        print(f"  uploaded {i}/{len(files_meta)}")

# 4. Create deployment
payload = {
    "name": PROJECT_NAME,
    "project": project_id,
    "files": [{"file": m["file"], "sha": m["sha"], "size": m["size"]} for m in files_meta],
    "target": "production",
    "projectSettings": {"framework": None, "outputDirectory": None},
}
# write to temp file
with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as t:
    json.dump(payload, t)
    payload_path = t.name

cmd = [
    "curl", "-sk", "-X", "POST",
    "https://api.vercel.com/v13/deployments",
    "-H", f"Authorization: Bearer {TOKEN}",
    "-H", "Content-Type: application/json",
    "--data-binary", f"@{payload_path}",
    "-m", "120",
]
out = subprocess.check_output(cmd).decode()
try:
    resp = json.loads(out)
except Exception:
    print("Bad response:")
    print(out[:1500])
    sys.exit(1)
if resp.get("error"):
    print("Deploy error:")
    print(json.dumps(resp, indent=2)[:1500])
    sys.exit(1)
print(f"Deployment URL: https://{resp.get('url')}")
print(f"Inspector:      {resp.get('inspectorUrl')}")
print(f"Aliases:        {resp.get('alias')}")
