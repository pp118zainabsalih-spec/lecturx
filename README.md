# ليكچر — Lecture

Study app for pharmacy students. Live at https://lecturx.com

- `public/` — the app (single `index.html`, service worker, manifest, icons). Everything here is served as-is.
- `firebase.json` — Firebase Hosting settings.
- `firestore.rules` — Firestore security rules (published from the Firebase console; keep this copy in sync).
- `.github/workflows/deploy.yml` — every push to `main` publishes `public/` to Firebase Hosting, keyless (Workload Identity Federation).
