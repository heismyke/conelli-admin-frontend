# Conelli Admin

Vue/Vite admin dashboard for Conelli Engineering staff. It mirrors the CIS visual language while keeping the admin app separate from the investor portal.

Development data is persisted in `localStorage` so the workflow is testable immediately. `prisma/schema.prisma` defines the shared database schema expected by the future read-only investor portal.

Demo login:

- `admin@conelliengineering.com`
- any password

## Commands

```bash
npm install
npm run dev
npm run build
```
