// Apply before importing app/routes: some route configuration is evaluated at import time.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "arcane-ledger-disposable-tests-only-secret";
process.env.AUTH_COOKIE_SECURE = "false";
process.env.AUTH_COOKIE_NAME = "arcane_ledger_session";
process.env.FRONTEND_URL = "http://127.0.0.1:4175";
process.env.CORS_ALLOWED_ORIGINS = "http://127.0.0.1:4175";
for (const key of [
  "MONGODB_URI",
  "MONGO_INITDB_ROOT_USERNAME",
  "MONGO_INITDB_ROOT_PASSWORD",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "CHARACTER_AVATAR_S3_BUCKET",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY"
])
  process.env[key] = "";
