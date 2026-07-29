# Platform Super Admin

The platform console is a separate security domain mounted at `/api/v1/platform`.
Tenant access tokens cannot pass its middleware, and platform tokens cannot pass
tenant authentication. Platform administrators live in `platform_admins` and
never carry an organization reference.

## Bootstrap

Set `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD` (12+ characters), and
optionally `PLATFORM_ADMIN_NAME` for the first start. The account is only created
when the email does not already exist. Remove the plaintext password from the
runtime environment after bootstrap. Always provide separate, random 32+ character
values for `PLATFORM_JWT_ACCESS_SECRET` and `PLATFORM_JWT_REFRESH_SECRET`.

The web console is available at `/platform/login`. There is intentionally no link
to it from tenant navigation.

## Security boundaries

- Platform access and refresh tokens use distinct secrets and token-type claims.
- Access tokens expire after 10 minutes by default; refresh sessions after 12 hours.
- Refresh tokens are stored only as SHA-256 hashes and rotate on refresh.
- A session version invalidates all prior access tokens on logout.
- Five failed logins lock the identity for 15 minutes; the route is independently
  rate-limited to eight attempts per 15 minutes.
- Sensitive mutations record actor, IP address, user agent, request ID, entity,
  action, and metadata in `platform_activity_logs`.
- Organizations use soft deletion so platform actions remain auditable.

## Module organization

```text
src/
  models/
    platform-admin.model.js
    platform.model.js
  validations/platform.validation.js
  middlewares/platform-auth.middleware.js
  services/platform.service.js
  controllers/platform.controller.js
  routes/platform.routes.js
```

External payment, mail, object-storage, and analytics providers should be added
behind services. Controllers and persistence models should depend on those service
contracts rather than provider SDKs, allowing providers to change without altering
the platform routes.
