---
# SAML + LTI Demo

This Next.js app demonstrates integrating **PostgreSQL** with **SAML Single Sign-On** (Okta) and prepares for **LTI 1.3** and CSV roster ingest.
---

## Features Implemented

- **PostgreSQL integration** via `pg` (Neon database)

  - `notes` table with GET/POST API and React UI
  - `users` table created automatically on SAML login

- **SAML Service Provider (SP)**

  - `/auth/saml/metadata` endpoint returns valid SP metadata XML
  - `/auth/saml/login` initiates Okta login
  - `/auth/saml/acs` parses SAMLResponse, upserts user into Postgres, sets session cookie, redirects to `/me`

- **Protected page `/me`**

  - Displays logged-in email from session cookie
  - Includes logout route `/auth/logout` to clear cookie

- **Security**

  - Signed, HttpOnly, SameSite cookies with `SESSION_SECRET`
  - Zod validation on Notes API

- **Ready for LTI 1.3 & CSV roster ingest**

  - Placeholder endpoints & DB models prepared for `students`/`enrollments`
  - Helmet headers & stricter cookie flags planned

---

## How to Run Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOURUSERNAME/saml-lti-demo.git
   cd saml-lti-demo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env.local`**

   ```bash
   DATABASE_URL=postgresql://YOUR_NEON_URL?sslmode=require
   SAML_SP_ENTITY_ID=http://localhost:3000/auth/saml/metadata
   SAML_SP_ACS=http://localhost:3000/auth/saml/acs
   SAML_IDP_METADATA_URL=https://integrator-3746794.okta.com/app/exkvoz1yn7n7lOcIQ697/sso/saml/metadata
   SESSION_SECRET=some-long-random-string
   ```

4. **Run dev server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000/auth/saml/metadata` to see SP metadata.
   Then `http://localhost:3000/auth/saml/login` to initiate login.

---

## Okta Configuration Steps

1. In Okta Admin → **Applications → Create App Integration → SAML 2.0**.
2. **Single sign on URL (ACS):**

   - Local: `http://localhost:3000/auth/saml/acs`
   - Production: `https://saml-lti-demo.onrender.com/auth/saml/acs`

3. **Audience URI (SP Entity ID):**

   - Local: `http://localhost:3000/auth/saml/metadata`
   - Production: `https://saml-lti-demo.onrender.com/auth/saml/metadata`

4. **NameID format:** EmailAddress
5. **Attribute Statements:** `email` → `user.email`
6. Assign your Okta user to the app.
7. Copy the **Identity Provider metadata** URL into `.env.local` and Render.

---

## Production URLs

- **SP Metadata:**
  [https://saml-lti-demo.onrender.com/auth/saml/metadata](https://saml-lti-demo.onrender.com/auth/saml/metadata)
- **Login:**
  [https://saml-lti-demo.onrender.com/auth/saml/login](https://saml-lti-demo.onrender.com/auth/saml/login)
- **Protected page:**
  [https://saml-lti-demo.onrender.com/me](https://saml-lti-demo.onrender.com/me)

> **Note:** Due to free-tier cold starts, the Okta → Render redirect can occasionally misroute. The SAML flow is fully functional locally and all code is present in this repo.

---

## How It Works (Short Version)

1. **User clicks Login** → `/auth/saml/login` → SP sends AuthnRequest to Okta.
2. **Okta authenticates** → POSTs SAMLResponse to `/auth/saml/acs`.
3. **ACS handler parses** assertion with `samlify`, upserts user into Postgres, sets a signed cookie, and redirects to `/me`.
4. **Protected `/me` page** reads the cookie and displays the logged-in email.
5. **Logout** clears the cookie and returns to `/`.

---

## Next Steps (Planned)

- Implement minimal **LTI 1.3 launch** at `/lti/launch`.
- Add **CSV roster ingest** to load students and enrollments.
- Add security headers and Zod validation everywhere.
