#!/bin/bash
set -e
ROOT=/home/user/workspace/DeltPay/dist
PROJECT_NAME=deltpay-wave1

cd "$ROOT"

# Step 1 — ensure project exists (idempotent — ignore 409/400)
echo "Ensuring project $PROJECT_NAME exists..."
CREATE_RESP=$(curl -sk -X POST "https://api.vercel.com/v11/projects" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$PROJECT_NAME\",\"framework\":null}")
PROJECT_ID=$(echo "$CREATE_RESP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
  # Already exists — look it up
  echo "Create failed (probably exists), looking up..."
  LOOKUP=$(curl -sk "https://api.vercel.com/v9/projects/$PROJECT_NAME" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  PROJECT_ID=$(echo "$LOOKUP" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('id',''))")
fi

echo "Project ID: $PROJECT_ID"
[ -z "$PROJECT_ID" ] && { echo "Could not resolve project id"; exit 1; }

# Step 2 — upload all files under $ROOT
FILES=$(find . -type f | sed 's|^\./||')
echo "Uploading $(echo "$FILES" | wc -l) files..."
echo "$FILES" | while read -r f; do
  [ -z "$f" ] && continue
  SHA=$(sha1sum "$f" | awk '{print $1}')
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
done
echo "All files uploaded."

# Step 3 — build deployment payload
python3 << PY
import json, hashlib
from pathlib import Path
ROOT = Path("$ROOT")
files = []
for p in ROOT.rglob("*"):
    if not p.is_file(): continue
    rel = p.relative_to(ROOT).as_posix()
    data = p.read_bytes()
    files.append({"file": rel, "sha": hashlib.sha1(data).hexdigest(), "size": len(data)})
payload = {
    "name": "$PROJECT_NAME",
    "project": "$PROJECT_ID",
    "target": "production",
    "files": files,
    "projectSettings": {"framework": None}
}
Path("/tmp/deploy-payload.json").write_text(json.dumps(payload))
print(f"Payload: {len(files)} files")
PY

# Step 4 — create deployment
echo "Creating deployment..."
curl -sk -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary "@/tmp/deploy-payload.json" > /tmp/deploy-resp.json

python3 -c "import json; d=json.load(open('/tmp/deploy-resp.json')); print('URL:', d.get('url')); print('ID:', d.get('id')); print('State:', d.get('readyState'))"

# Step 5 — disable SSO protection
echo "Disabling SSO..."
curl -sk -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ssoProtection":null}' -o /tmp/sso.out -w "%{http_code}\n"

echo "DONE."
