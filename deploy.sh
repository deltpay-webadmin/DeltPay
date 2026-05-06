#!/bin/bash
set -e
ROOT=/home/user/workspace/deltpay-site/dist
PROJECT_NAME=deltpay-wave1

cd "$ROOT"

# Look up project
LOOKUP=$(curl -sk "https://api.vercel.com/v9/projects/$PROJECT_NAME" \
  -H "Authorization: Bearer $VERCEL_TOKEN")
PROJECT_ID=$(echo "$LOOKUP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))")
[ -z "$PROJECT_ID" ] && { echo "Could not resolve project id"; exit 1; }
echo "Project ID: $PROJECT_ID"

# Upload all files under $ROOT
FILES=$(find . -type f | sed 's|^\./||')
TOTAL=$(echo "$FILES" | wc -l)
echo "Uploading $TOTAL files..."

# Build JSON file list with sha + size
JSON_FILES="["
SEP=""
COUNT=0
echo "$FILES" | while IFS= read -r f; do
  [ -z "$f" ] && continue
  SHA=$(sha1sum "$f" | awk '{print $1}')
  SIZE=$(stat -c%s "$f")
  HTTP=$(curl -sk -X POST "https://api.vercel.com/v2/files" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/octet-stream" \
    -H "x-vercel-digest: $SHA" \
    --data-binary "@$f" -o /tmp/up.out -w "%{http_code}")
  if [ "$HTTP" != "200" ] && [ "$HTTP" != "201" ]; then
    echo "FAIL $f: HTTP $HTTP"
    cat /tmp/up.out
    exit 1
  fi
  printf '%s{"file":"%s","sha":"%s","size":%s}' "$SEP" "$f" "$SHA" "$SIZE" >> /tmp/files.json
  SEP=","
done > /tmp/upload.log

# Build files json
python3 <<PY
import json, hashlib, os
root = "$ROOT"
files = []
for dp, dn, fn in os.walk(root):
    for name in fn:
        full = os.path.join(dp, name)
        rel = os.path.relpath(full, root)
        with open(full, 'rb') as f:
            data = f.read()
        sha = hashlib.sha1(data).hexdigest()
        files.append({"file": rel, "sha": sha, "size": len(data)})
print(json.dumps(files))
PY > /tmp/files_meta.json

# Build deployment payload
python3 <<PY > /tmp/deploy_payload.json
import json
with open('/tmp/files_meta.json') as f:
    files = json.load(f)
payload = {
    "name": "$PROJECT_NAME",
    "project": "$PROJECT_ID",
    "files": files,
    "target": "production",
    "projectSettings": {"framework": None}
}
print(json.dumps(payload))
PY

DEPLOY=$(curl -sk -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/deploy_payload.json)
echo "$DEPLOY" > /tmp/deploy_resp.json
URL=$(echo "$DEPLOY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('url',''))")
ERR=$(echo "$DEPLOY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(json.dumps(d.get('error','')))")
echo "URL: https://$URL"
echo "ERROR: $ERR"
