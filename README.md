# wine-club

Mobile-first React app scaffolded with Vite.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

## Google auth (frontend)

This app uses Google Identity Services on the client.

1) Create a `.env.local` file (ignored by git) with:

- `VITE_GOOGLE_CLIENT_ID=...`

Optional (local dev API):

- `VITE_API_PROXY_TARGET=http://localhost:3000`

2) Start the app: `npm run dev`

Notes:

- Do not put your Google **client secret** in the frontend. If a secret was shared publicly, rotate/revoke it in Google Cloud Console.
- After sign-in, the app sends the returned Google credential (an ID token JWT) to `POST /api/v1/auth/google` and stores the returned API `accessToken` in `sessionStorage` as `wineClubAccessToken`.
- API requests send `Authorization: Bearer <accessToken>` and the app calls `GET /api/v1/me` to load the signed-in user.

### Common errors

- **`The given origin is not allowed for the given client ID` / `gsi/button ... 403`**
	- In Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID, add your dev site origin under **Authorized JavaScript origins**.
	- Typical dev origins to add (must match exactly what’s in your address bar):
		- `http://localhost:5173`
		- `http://127.0.0.1:5173`

- **`POST http://localhost:5173/api/v1/auth/google 404`**
	- This means you’re talking to the Vite dev server, but you don’t have a backend serving `/api/v1/*`.
	- Run your backend and set `VITE_API_PROXY_TARGET` (recommended in dev to avoid CORS), for example `VITE_API_PROXY_TARGET=http://localhost:3000`.

## Current MVP

- Mobile-first home screen for Wine Club.
- Monthly picks list section.
- Next tasting event section.
