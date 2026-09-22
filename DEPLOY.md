# Putting Health Journal online

This guide uses **Vercel** (hosting), **Neon** (PostgreSQL database) and **Cloudflare R2** (photo storage). Any
PostgreSQL database and any S3-compatible storage works the same way: only the addresses and keys change.
The screens of these services change from time to time, so treat the steps as a guide.

## Why these three things

| Part | On your computer | Online |
| --- | --- | --- |
| Database | a local PostgreSQL that `npm run dev` starts for you | a hosted PostgreSQL (Neon, Supabase, Vercel Postgres...) |
| Photos | the `./uploads` folder | an S3-compatible bucket (R2, AWS S3, Supabase Storage...) |
| Web address | `http://localhost:3000` | your `https://` address, set in `NEXTAUTH_URL` |

Online hosts don't keep files written to disk, so **photos only work online once storage is set up**. If it isn't, the
app says so instead of quietly losing photos.

## Before you start

- The code must be in a Git repository on GitHub (or GitLab/Bitbucket) so Vercel can read it.
- Never commit `.env`. It is already ignored.

## 1. Database (Neon)

1. Create a Neon project. Pick a region close to your users (for Nigeria, a European region is usually the closest).
2. Copy **two** connection strings from the Neon dashboard:
   - the **pooled** one (the host name contains `-pooler`) becomes `DATABASE_URL`. Add `&pgbouncer=true` to the end;
   - the **direct** one becomes `DIRECT_URL`. Migrations use it.

## 2. Photo storage (Cloudflare R2)

1. Create a bucket and keep it **private**. Photos are only ever handed out by the app after it checks who is asking.
2. Create an API token that can read and write objects in that bucket.
3. Note four things: bucket name, the storage address (`https://<account>.r2.cloudflarestorage.com`), the access key id and the secret.
   - `S3_REGION` is `auto` for R2.
   - For AWS S3 instead: leave `S3_ENDPOINT` empty, set `S3_REGION` (for example `eu-west-1`), and use an IAM user that may
     get, put and delete objects under `photos/*`.

## 3. Vercel

1. Import the repository into Vercel. The framework is detected automatically.
2. Under **Settings > Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | the pooled Neon address from step 1 |
   | `DIRECT_URL` | the direct Neon address from step 1 |
   | `NEXTAUTH_SECRET` | a long random secret: `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | your final address, for example `https://healthjournal.example.com` |
   | `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | from step 2 |

3. Deploy. Vercel runs `npm run vercel-build`, which **creates or updates the database tables** (`prisma migrate deploy`)
   and then builds the app.

## 4. Set your real address first, then print anything

`NEXTAUTH_URL` must be the address people really use. **Passport QR codes and share links are built from it**, so:

- set it to the final `https://` address before printing a single passport card, and
- if you change the address later, cards printed earlier still point to the old one.

## 5. Check it works (do this once after the first deploy)

- [ ] Sign up and log in.
- [ ] Add an entry **with a photo**, reload, and see the photo.
- [ ] Create a share link, open it in a private window (you should see only the chosen entries), then turn it off and confirm it stops working.
- [ ] Create a passport, open the QR address on a phone, and print or save the PDF.
- [ ] Download the ZIP export and open it.
- [ ] Delete a test entry with a photo, and check the photo is gone from the bucket.

## Good to know

- **Photo size:** hosts limit one request to about 4.5 MB, so the app allows 4 MB of photos in total each time you save. The
  browser shrinks photos first, so this is normally 5 photos or more.
- **Backups:** turn on Neon's point-in-time restore, and enable versioning on the bucket if your provider offers it.
- **Changing `NEXTAUTH_SECRET`** signs everyone out.
- **Running the app on your computer** is unchanged: `npm run dev` starts the local database and the app.
  To use the online database from your computer instead, put its addresses in `.env`.

## Moving your local data online (optional)

The local database is a separate copy. If you want your current local entries online, export them from
**Profile > Download everything (ZIP)** and re-add what you need, or ask for a one-time import script.
