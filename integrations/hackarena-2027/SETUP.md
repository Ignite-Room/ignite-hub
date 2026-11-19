# HackArena 2027 · Google Sheet back office

The HackArena 2027 site (`/hackarena-2027`) reads campus cards, sponsor logos and finalists from one Google Sheet and writes college applications and partner requests into it. No developer is needed to update the site once this is set up.

## One-time setup (about 5 minutes)

1. **Create the Sheet.** In the Google account that should own the data and send the emails (ideally a shared team account), create a blank Google Sheet named `HackArena 2027`.
2. **Add the script.** In the Sheet: **Extensions → Apps Script**. Delete what's in `Code.gs`, paste the whole of [`Code.gs`](./Code.gs) from this folder, and save.
3. **Check the settings** at the top of the script (`CONFIG`):
   - `ADMIN_EMAIL`: who gets a copy of every application and partner request.
   - Rule book: nothing to do. The Campus Round Rule Book PDF is published on the website (`/ha2027/HackArena-2027-Campus-Round-Rule-Book.pdf`) and the script attaches it to every confirmation email from there. To send a different version, upload it to Drive and paste its file ID into `RULEBOOK_FILE_ID`.
   - `NYMBLE_GUIDE_URL` (optional): a how-to link included in approval emails.
4. **Run `setup` once.** Pick `setup` in the function dropdown and click **Run**. Google asks for permissions: the script needs to edit this Sheet, send email as you, and fetch the rule book PDF from the website. `setup` creates the five tabs with headers, dropdowns and checkboxes, and installs the trigger that sends approval emails.
5. **Deploy.** **Deploy → New deployment → Select type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**

   Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
6. **Connect the site.** Either:
   - add `VITE_HACKARENA_API_URL=<the /exec URL>` in Vercel → Project → Settings → Environment Variables (Production), then redeploy, **or**
   - paste the URL into `HA_API_URL` in `src/hackarena/config.ts` and push.
7. **Test before launch.** Open `https://www.igniteroom.in/hackarena-2027/apply?preview=1`, which unlocks the form before 25 Nov, and submit a test application. You should see a row marked `TEST` in **Applications** and get the confirmation and admin emails. Delete the test row afterwards.

> When you change `Code.gs` later, use **Deploy → Manage deployments → Edit → Version: New version**. This keeps the same `/exec` URL, so the site doesn't need updating.

## Day-to-day use

| Tab | Who writes | What to do |
|---|---|---|
| **Applications** | The website | Change **Status** as you review: Applied → Approved → Nymble live → Round done → Reports in. Setting **Approved** automatically emails the SPOC and Student Coordinator the Nymble setup steps (once per row). |
| **Partner Requests** | The website | Track sponsor leads with the Status column. |
| **Campuses** | The team | One row per college. Tick **Published** to show the card. Update **Status** as the round progresses. |
| **Sponsors** | The team | One row per logo. Tier: Title / Track / Partner / Past partner. Tick **Published** to show it. The Sponsors section stays a "Partner with us" block until the first logo is published. |
| **Finalists** | The team | Tick **Published**. The finalists page and the "See the finalists" button appear once there's at least one. |

The website picks up changes within about a minute.

### Campuses columns

- **Slug**: the page URL, e.g. `dtu` gives `/hackarena-2027/campus/dtu`. Leave it blank to generate one from the college name. Don't change it after you've shared the link.
- **Round Date / Prototype Due**: dates. Prototype Due defaults to 5 days after the round if left blank.
- **Status**: Coming soon · Registrations open · Registrations closed · Round today · Shortlist announced · Prototype round · Completed. On the round date, a card that's still open or closed shows **Round today** automatically.
- **Nymble URL**: the Register button only shows when Status is *Registrations open* and this is filled.
- **Shortlisted Teams**: one team name per line (Ctrl/Cmd + Enter for a new line in a cell).
- **Region**: optional grouping for the city filter and "Stations" grid (e.g. *Delhi NCR*). Falls back to City.

### Logos

Logo URL columns accept:
- a public image URL,
- a site path such as `/partners/github.png` (the HackArena 2.0 partner logos are already on the site in `/partners/`),
- or a Google Drive share link (the file must be shared as "Anyone with the link").

Transparent PNG or SVG logos look best: on the dark site they're shown as clean white marks. JPEGs and Drive images are shown on a white plate.

## Email limits

Emails go out through the Google account that deployed the script. A regular Gmail account can send to about **100 recipients a day**; each application uses 3 (SPOC, Student Coordinator, admin copy). If launch-day volume could beat that, deploy from a Google Workspace account (1,500 a day).
