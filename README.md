# PatientLog

A simple, patient-owned health journal. Hospital records in Nigeria don't follow a patient from one hospital to another, so this app lets patients keep their own journal, which they control and can share with a clinician later.

This first build is patient-facing only: sign up, write entries (with photos of lab results and prescriptions), browse a timeline, edit a profile, and generate an emergency health passport.

> This is a personal journal, not a substitute for official medical records or emergency care.

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Prisma + PostgreSQL · NextAuth (credentials provider, bcrypt-hashed passwords)

## Run it

```bash
npm install
cp .env.example .env        # then set NEXTAUTH_SECRET (openssl rand -base64 32)
npm run db:start            # starts the local PostgreSQL database
npx prisma migrate deploy   # creates the tables (first time only)
npm run dev                 # http://localhost:3000 (also starts the database if it isn't running)
```

Useful scripts: `npm run db:studio` (browse the data), `npm run db:reset` (wipe the local database), `npm run db:stop` (stop the local database).

The local database keeps its data in `~/Library/Application Support/prisma-dev-nodejs/patientlog` (on a Mac).
To put the app online, follow **[DEPLOY.md](DEPLOY.md)**.

## Layout

| Path | What's there |
| --- | --- |
| `prisma/schema.prisma` | `User` and `Entry` models |
| `lib/auth.ts` | NextAuth config and `requireUserId()` |
| `proxy.ts` | Redirects signed-out visitors to `/login` |
| `app/login`, `app/signup` | Auth pages (sign-up is a server action in `app/signup/actions.ts`) |
| `app/dashboard` | Timeline: grouped by date, tag filter, keyword search (`?tag=` and `?q=`) |
| `app/entries` | Entry detail page and server actions (`actions.ts`) |
| `components/EntryDrawer.tsx` | The entry form in a drawer, for both new and edit (one "new entry" drawer lives in `app/layout.tsx`) |
| `components/Header.tsx`, `components/BottomNav.tsx` | Header with avatar and Sign out; on phones the Timeline / New entry / Passport bar sits at the bottom |
| `app/passport` | The flippable card, PDF download, and the passport details form (in a drawer) |
| `app/scan/[id]` | Public page that a scan of the passport QR code opens (no login) |
| `lib/passport.ts` | The passport QR format and helpers |
| `app/api/attachments/[id]` | Serves an uploaded image, only to the person who owns the entry |
| `lib/storage.ts` | Where uploaded photos are saved: `./uploads` on your computer, an S3-compatible bucket online |
| `app/share`, `app/share/[token]` | Create and manage share links (drawer), and the public read-only page a link opens |
| `app/journal/print`, `app/api/export` | Print or save the journal as PDF, and the ZIP download (journal.json + photos) |
| `app/profile` | Your details (name, date of birth, blood group, genotype, emergency contact), plus rows for Edit profile (drawer), Sign out and Delete account (drawer, asks for your password) |
| `components/Drawer.tsx`, `DrawerButton.tsx`, `DrawerFormLayout.tsx` | The reusable slide-in drawer: forms scroll, the Cancel and Save buttons stay fixed |
| `app/api/session-expired` | Clears a login cookie whose account no longer exists, then goes to /login |
| `lib/tags.ts` | The fixed tag list |

## Design notes

- **Tags** are stored as one comma-separated string, which keeps the code simple. The allowed values are in `lib/tags.ts`.
- **Dates** are calendar dates, stored as UTC midnight and shown in UTC so they never shift a day. "Today" defaults to Lagos time.
- **Images**: up to 5 per entry (JPG, PNG or WebP, 5 MB each). The browser shrinks photos before upload, the server checks the real file type from its bytes, and files are stored in `./uploads`, outside `public`, so they can only be opened through `/api/attachments/[id]`. Online, photos live in an S3-compatible bucket (set the `S3_` settings; see DEPLOY.md). One save can add at most 4 MB of photos, because hosts cap a request at about 4.5 MB.
- **Emergency health passport**: the QR code holds a web address (`/scan/<id>?d=<details>`) with all the details inside it, in the same format (`"v": 1`) as the Emergency Health Passport app, so that app's scanner reads these cards too. The scan page never touches the database. Details are stored in the `Passport` table, and name, date of birth, blood group, genotype and emergency contact come from the profile. Set `NEXTAUTH_URL` to your real domain before printing cards, because that domain is what the QR code points to. Anyone who scans a card can read it, and a printed card keeps showing the details it was printed with until a new one is printed.
- **Passport doesn't depend on the journal**: everything on the card is filled in one form, "Edit passport details" (date of birth, blood group, genotype and emergency contact are the same details as on the profile, so they update there too). Allergies, ongoing conditions and regular medicines are typed, autocompleted from `lib/medical-suggestions.ts` and your own journal titles, and added with Enter as pills (`components/TagInput.tsx`). Journal entries only offer one-tap suggestions. Typing "None known" or "None" counts as an answer (the card then says "No known allergies"), while an empty box means "not provided" and is never read as "none". The page shows an "incomplete" notice, with a button to finish it, until everything is filled in.
- **Sharing with a clinician**: you choose entries and an expiry (24 hours, 7 days or 30 days) and get a private link that needs no account. The link's secret is shown once; only its SHA-256 fingerprint is stored (`Share.tokenHash`). The public page shows the patient's name, date of birth, blood group, genotype and only the chosen entries with their photos. It counts openings, and links can be turned off at any time. Share pages and their photos are sent with `no-store`, `noindex` and `no-referrer` headers. (`Entry.shared` from the first data model is not used: sharing is per link, in the `Share` tables.)
- **Exporting**: "Print or save as PDF" is a print-styled page (the browser's print box makes the PDF). "Download everything" streams a ZIP with `journal.json` and every photo, without holding the whole journal in memory.
- **Deleting an account** needs the password typed again (there is no email service yet, so no email confirmation). It removes the profile, every entry, the photo files and the passport. A passport card that was already printed keeps showing what it was printed with, because the details live inside its QR code.
- **Forms and slow connections**: the login and sign-up buttons stay disabled until the page's scripts have loaded, and those forms use POST, so a password can never end up in the web address.
- **Ownership**: every query and action filters by the signed-in user's id, so one user can never read or change another's entries.
- **Emergency contact** (name and phone) is two extra optional columns on `User`, added beyond the original data model.

## Adding clinician sharing later

`Entry.shared` (default `false`) is reserved for this and isn't used by any screen yet. A later `EntryShare` table (entry, clinician, expiry) and a `Clinician` role can be added without changing `User` or `Entry`.

## Not built yet

Password reset, email verification, rate limiting for login and for the delete-account password check, a photo on the passport card, and a screen to scan someone else's passport card.
