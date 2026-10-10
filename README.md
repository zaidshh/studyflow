# StudyFlow website

This is a mobile-friendly study planner that can be hosted free on GitHub Pages.

## Files to upload to GitHub

Upload every file in this folder. The website entry point is `index.html`.

## Publish on your GitHub profile

1. Sign in to GitHub and click the **+** icon → **New repository**.
2. Name it `studyflow` and choose **Public**.
3. Choose **Add file → Upload files** and upload the contents of this folder (not the folder itself).
4. Click **Commit changes**.
5. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then choose `main` and `/ (root)`. Click **Save**.
6. After GitHub finishes publishing, your address will be `https://YOUR-GITHUB-USERNAME.github.io/studyflow/`.

## Add Supabase later

1. Create a free project at Supabase.
2. In Supabase, open **SQL Editor**, create a new query, paste `supabase/schema.sql`, and run it.
3. In **Project Settings → API**, copy your Project URL and anon public key into `config.js`.
4. Upload `config.js` again to GitHub and commit it.

Never put an OpenAI, Gemini, or other AI provider key in `config.js` or GitHub. It must be stored in a secure server-side function.
