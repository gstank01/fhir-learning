# To do later: deployment and sign-in setup

**Status: not done yet.** The site runs locally (`npm run dev`), but the
Vercel deployment, database and sign-in credentials still need to be set up.
Until then, admin editing, visitor accounts and personal notes won't work on
the live site.

Never put any of these secrets in this repository or in a chat. Keep them in a
password manager.

## Checklist

### 1. Prepare secrets
- [ ] Choose an **admin password** (`ADMIN_PASSWORD`), a long passphrase. Save it in the password manager.
- [ ] Generate a **session secret** (`SESSION_SECRET`), about 64 random characters (password manager generator, or `openssl rand -base64 48`). Save it.

### 2. Database (pick one)
- [ ] **Option A:** reuse the existing Neon database from `fhir-standalone-launch`. In console.neon.tech, open the project, click **Connect**, and copy the connection string (`DATABASE_URL`).
- [ ] **Option B (recommended):** create a new Neon database from the Vercel project's **Storage** tab (step 4).

### 3. Create the Vercel project
- [ ] Vercel → **Add New… → Project** → import `gstank01/fhir-learning`.
- [ ] Framework Preset: **Other**. Root Directory: `./`. Leave build settings alone.
- [ ] Add environment variables: `ADMIN_PASSWORD`, `SESSION_SECRET`, and `DATABASE_URL` (Option A only).
- [ ] Click **Deploy**.

### 4. Connect the database (Option B only)
- [ ] Project → **Storage** → **Create Database** → **Neon**. Connect it to Production, Preview and Development.
- [ ] Redeploy: **Deployments → ⋯ → Redeploy**.

### 5. Check it works
- [ ] **Sign in → Admin sign-in** with the admin password. "Edit notes" appears.
- [ ] Create a visitor account, write a note in **My notes**, reload, and check it's still there.
- [ ] Optional: in Neon, check the tables `app_users`, `user_notes` and `exam_topic_notes` exist.

## If something goes wrong

| What you see | Fix |
|---|---|
| "Admin sign-in isn't set up yet" | Add `ADMIN_PASSWORD`, then redeploy. |
| "Personal notes aren't available" | Add `DATABASE_URL` for Production, then redeploy. |
| "Something went wrong on the server" | Check the project's **Logs** tab; usually a wrong connection string. |
| Topics don't load | Framework must be **Other**, Root Directory `./`. |
| A new setting has no effect | Redeploy. Settings only apply to new deployments. |

Full details are in the "Deploy on Vercel" section of [README.md](README.md).
