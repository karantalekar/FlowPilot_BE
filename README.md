# FlowPilot Backend

Production-ready Node.js, Express, TypeScript, MongoDB, Redis, Socket.IO, JWT, RBAC, Razorpay, and AI backend for a SaaS/B2B business operations platform.

## Features

- JWT auth with refresh tokens, bcrypt password hashing, Google login endpoint, password reset, email verification token flow
- Multi-tenant organizations with `super_admin`, `admin`, `manager`, and `employee` roles
- CRM leads/customers with search, filters, sorting, and pagination
- Project and task APIs with Kanban data, comments, assignees, and activity logs
- AI assistant with conversations, document upload, document Q&A, and report generation
- Analytics dashboard, CRM analytics, and project analytics
- Razorpay Checkout, webhooks, subscription state, usage limits, and payment history
- In-app, email-ready, and Socket.IO real-time notifications
- Admin APIs, centralized error handling, Zod validation, Helmet, CORS, rate limiting, Winston/Morgan logging
- Docker, Swagger, Postman collection, Jest, and GitHub Actions CI

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

API: `http://localhost:5000`

Docs: `http://localhost:5000/docs`

Health: `http://localhost:5000/health`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

## Environment

Required for local boot:

- `MONGODB_URI`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional integrations:

- `GEMINI_API_KEY` for live AI responses (`GEMINI_MODEL` defaults to `gemini-2.5-flash`)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_PRO`, `RAZORPAY_PLAN_BUSINESS`
- SMTP settings for real email delivery
- Google OAuth settings for Passport callback support

## API Layout

All application endpoints are under `/api/v1`.

- Auth: `/auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh-token`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`
- Organizations: `/organizations`, `/organizations/current`, `/organizations/:id`
- CRM: `/leads`, `/customers`
- Projects: `/projects`, `/projects/:id/kanban`, `/tasks`
- AI: `/ai/chat`, `/ai/conversations`, `/ai/documents/upload`, `/ai/documents/ask`, `/ai/reports/generate`
- Analytics: `/analytics/dashboard`, `/analytics/crm`, `/analytics/projects`
- Billing: `/billing/create-subscription`, `/billing/verify-payment`, `/billing/webhook`, `/billing/subscription`, `/billing/payment-history`
- Notifications: `/notifications`, `/notifications/:id/read`, `/notifications/read-all`
- Admin: `/admin/users`, `/admin/organizations`, `/admin/subscriptions`, `/admin/audit-logs`, `/admin/stats`

## Auth Flow

Register returns `accessToken` and `refreshToken`. Send the access token on protected routes:

```http
Authorization: Bearer <accessToken>
```

Use `/api/v1/auth/refresh-token` with the refresh token to rotate credentials.

## Razorpay Webhooks

Use the raw webhook endpoint:

```bash
Configure `https://your-api.example.com/api/v1/billing/webhook` in the Razorpay Dashboard.
```

Set the webhook secret as `RAZORPAY_WEBHOOK_SECRET` and subscribe to payment and subscription events.

## Testing

```bash
npm test
npm run typecheck
```

## Notes

The AI document model stores chunks and optional embedding arrays so it is ready for vector search integration. The current implementation performs text-context retrieval from MongoDB and can be upgraded to Atlas Vector Search, Pinecone, Weaviate, or Redis Vector without changing route contracts.

<!-- Start The Backend  -->

docker compose up -d

<!-- Stop The Backend -->

docker compose down

NODE_ENV=development
PORT=5000
APP_NAME=FlowPilot
CLIENT_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000

MONGODB_URI=mongodb://mongo:27017/flowpilot
REDIS_URL=redis://redis:6379
REDIS_ENABLED=true

JWT_ACCESS_SECRET=replace-with-strong-access-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

COOKIE_SECRET=replace-with-cookie-secret
BCRYPT_SALT_ROUNDS=12

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PRO=
RAZORPAY_PLAN_BUSINESS=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@example.com

UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
