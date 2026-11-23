# RedotPay Mail Dashboard

A private Next.js dashboard that displays matching RedotPay email metadata and non-authentication message content through a Google Apps Script Gmail read-only endpoint.

## Files
- `app/page.js`: password screen, email list, search, message viewer
- `app/api/emails/route.js`: server-side password check and Apps Script request
- `app/globals.css`: dark responsive styling
- `app/layout.js`: page metadata and CSS
- `apps-script/Code.gs`: Google Apps Script endpoint (deploy separately)

## Local setup
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Set the environment variables below in your local `.env.local` file.
4. Run `npm run dev`.

## Environment variables
Set these in Vercel Project Settings → Environment Variables:
- `DASHBOARD_PASSWORD`: a unique, strong dashboard password
- `GAS_URL`: your deployed Apps Script `/exec` URL
- `GAS_SECRET`: exactly the same secret as Apps Script Script Property `API_SECRET`

Do not commit `.env.local`, API secrets, Gmail credentials, or OAuth tokens.

## Apps Script setup
1. Create a Google Apps Script project and paste `apps-script/Code.gs` into `Code.gs`.
2. Enable the Advanced Gmail service (Services → + → Gmail API).
3. In Project Settings, show the `appsscript.json` manifest and include the Gmail read-only scope:
   `https://www.googleapis.com/auth/gmail.readonly`
4. Add Script Property `API_SECRET` with a unique secret.
5. Deploy as a Web app, execute as yourself, with access set to Anyone. The endpoint checks `API_SECRET`.
6. Put the deployment `/exec` URL into Vercel as `GAS_URL`.

## Deploy
Push this repository to GitHub, import it into Vercel, add the environment variables, then deploy.

## Security notes
- Use a unique dashboard password and a separate long random API secret.
- Keep the GitHub repository private.
- Never put secrets in source files or commit `.env.local`.
- The app hides message bodies when authentication/verification language is detected. Detection is not perfect; do not use this dashboard to retrieve, share, or store one-time codes.
- Email HTML is rendered in a sandboxed iframe. Remote images and tracking content may still be present in email HTML.
- This is a personal read-only dashboard, not a production-grade mail client.
