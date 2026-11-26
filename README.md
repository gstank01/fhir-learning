# FHIR Foundational Prep

> **Setup still to do:** deployment, database and sign-in credentials aren't set up yet. See [SETUP-TODO.md](SETUP-TODO.md).

A study website for the **HL7 FHIR Foundational Implementer** exam. The sidebar
follows the competencies in HL7's official study guide. Each topic shows the
exam objectives, its share of the exam, and study notes. An admin can sign in
and edit the notes from the website.

## How it is built

| Part | Where | What it does |
|---|---|---|
| Website | `public/` | Plain HTML, CSS and JavaScript. No build step. |
| Topic structure | `lib/structure.js` | Domains, topics, exam weights and objectives from the study guide |
| FHIR resources | `lib/resources.js` | All R4 resources by category, with maturity and definition |
| Original notes | `content/*.md` | One Markdown file per topic. These are the starting notes. |
| API | `api/topics.js`, `api/auth.js` | Vercel serverless functions |
| Saved data | Neon Postgres | Tables `exam_topic_notes` (admin edits), `app_users` and `user_notes` (visitor accounts and their notes), created automatically on first use |
| Accounts | `lib/accounts.js`, `api/account.js`, `api/my-notes.js` | Visitor sign-up, sign-in and private notes |

When the admin saves a topic, the new notes are stored in the database and
shown instead of the Markdown file. **Restore original notes** in the editor
deletes the saved edit and shows the file again.

Which topics a visitor has marked as studied is kept in their own browser.

## Core resource concepts

The first group in the study-guide sidebar, **Core resource concepts** (marked
"Start here"), teaches how to read a resource definition: resource names,
elements and cardinality, icons, flags, data types, descriptions and
constraints, bindings and binding strength, and ValueSet vs CodeSystem. These
pages have no exam weight; they are background for every exam area.

The element icons in `public/img/fhir/` are copied from the FHIR R4
specification, which HL7 publishes under the CC0 public-domain licence.

## Study cards

The **Study cards** tab is a flashcard trainer with three decks:

- **Which resource?** Real-life scenarios ("A nurse gives a dose of morphine") with the resource that fits and a note on why. The cards are in `lib/studycards.js`; add more there.
- **Definition → resource:** every resource's official definition, with its name hidden.
- **Resource → what it's for:** the resource name; recall what it's used for.

Cards come in random order and can be filtered by category. Visitors mark
each card "I knew it" or "Still learning", and can hide the cards they know.
Those marks are kept in the visitor's browser. A random scenario card also
appears on the exam overview page.

## FHIR resources section

The **FHIR resources** tab at the top lists all 146 resources from the
[R4 resource list](https://hl7.org/fhir/R4/resourcelist.html), grouped the same
way: five categories (Foundation, Base, Clinical, Financial, Specialized) and
their sub-groups, shown as a horizontal bar under the header. The first tab,
**All**, shows every resource; the category tabs, the search box and the
Maturity and Progress filters narrow the list and can be combined. Each resource
page shows its maturity, its definition from the spec, a link to its spec
page, and study notes the admin can add.

The resource list is in `lib/resources.js`. Optional starting notes for a
resource go in `content/resources/<ResourceName>.md`.

## Deploy on Vercel

1. In Vercel, choose **Add New… → Project** and import this GitHub repository.
2. Leave **Root Directory** as the repository root and **Framework Preset** as
   **Other**. Leave the build command empty; `vercel.json` tells Vercel to
   serve the `public` folder.
3. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `ADMIN_PASSWORD` | The password you will use to sign in as admin. Make it long. |
   | `DATABASE_URL` | Your Neon connection string (the same kind your other project uses). |
   | `SESSION_SECRET` | Recommended. A long random string used to sign sign-in cookies. Without it, keys are derived from `ADMIN_PASSWORD` and `DATABASE_URL`. |

   You can reuse your existing Neon database; the app only creates and uses
   the `exam_topic_notes` table. You can also connect a new Neon database from
   Vercel's **Storage** tab, which sets `DATABASE_URL` for you.
4. Click **Deploy**.

Every push to GitHub redeploys the site automatically.

Without `DATABASE_URL` the site still works, but it is read-only: it shows the
original notes and the editor reports that saving is turned off.

## Visitor accounts and private notes

Anyone can create a free account (email and password) from **Sign in** in the
top right. Signed-in visitors get a **My notes** box at the bottom of every
study topic and FHIR resource page. Notes save automatically as they type,
support Markdown, and are private to that account. The **My notes** tab lists
everything they have written, newest first, with search.

- Passwords are hashed with scrypt; the site never stores them in plain text.
- Visitors stay signed in for 30 days.
- Visitors can delete their account (and all their notes) from the account menu.
- There is no password reset, because the site doesn't send email. A visitor
  who forgets their password has to create a new account.
- Accounts need `DATABASE_URL`. Without a database, the **My notes** box says
  personal notes aren't available.

## Using the admin editor

1. Open the site, click **Sign in** in the top right, then **Admin sign-in**
   at the bottom of the dialog.
2. Enter your `ADMIN_PASSWORD`.
3. Open any topic (or the overview) and click **Edit notes**.
4. Write in Markdown. The preview updates as you type. Save with the button or
   Ctrl+S / ⌘S.

You stay signed in for 8 hours. Changing `ADMIN_PASSWORD` in Vercel signs out
every session (unless you set `SESSION_SECRET`).

## Run it on your computer

```bash
npm install
ADMIN_PASSWORD=choose-a-password npm run dev
```

Then open <http://localhost:3000>. Without `DATABASE_URL`, edits are kept in
memory until you stop the server (that includes visitor accounts). Add `DATABASE_URL=...` in front of the
command to use your real database.

## Changing the topics

- To edit notes: use the admin editor on the website, or edit the Markdown
  file in `content/` and push (an edit saved on the website takes priority
  over the file until you restore the original).
- To rename topics, change weights or objectives: edit `lib/structure.js`.
  A new topic needs a matching `content/<id>.md` file.
