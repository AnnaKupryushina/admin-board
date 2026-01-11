Simple Node/Express auth server for local development

- Starts on port 4000 by default.
- Endpoint: POST /auth/login
  - body: { email, password }
  - sample user: admin@example.com / password123
  - returns: { token, user }

Run locally:

```bash
cd server
npm install
npm start
```

Set `VITE_API_BASE=http://localhost:4000` in the frontend environment (e.g. `.env`) to point the frontend to this backend.
