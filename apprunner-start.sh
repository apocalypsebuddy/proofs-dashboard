#!/usr/bin/env sh
set -e
trap 'echo "❌ Failure at line $LINENO with exit code $?"' ERR

echo ">>> Environment:"
echo "    NODE_ENV      = $NODE_ENV"
echo "    PORT          = $PORT"
echo "    DATABASE_URL  = $DATABASE_URL"
echo "    AWS_S3_BUCKET = $AWS_S3_BUCKET"
echo "    NEXT_PUBLIC_COGNITO_USER_POOL_ID = $NEXT_PUBLIC_COGNITO_USER_POOL_ID"
echo "    NEXT_PUBLIC_COGNITO_CLIENT_ID    = $NEXT_PUBLIC_COGNITO_CLIENT_ID"

echo ">>> Versions:"
echo "    node     $(node -v)"
echo "    npm      $(npm -v)"
echo "    prisma   $(npx prisma -v | head -1)"

echo ">>> Testing raw TCP to Postgres…"
node -e "
  const net = require('net');
  const m = process.env.DATABASE_URL.match(/@(.+?):(\\d+)/);
  if (!m) { console.error('Couldn’t parse $DATABASE_URL'); process.exit(1); }
  const [ , host, port ] = m;
  const sock = net.createConnection({ host, port: Number(port) }, () => {
    console.log('✅ TCP OK to', host+':'+port);
    sock.end();
  });
  sock.on('error', err => { console.error('❌ uwu you made a fuckie 💩 TCP ERR:', err.message); process.exit(1); });
"

echo ">>> Running migrations…"
npx prisma migrate deploy
echo "✅ Migrations applied."

echo ">>> Listing migrations…"
ls -l prisma/migrations

echo ">>> Seeding database…"
npx prisma db seed
echo "✅ Seed complete."

echo ">>> Starting Next.js…"
echo "    CMD: npx next start -p \$PORT"
exec npx next start -p "$PORT"
