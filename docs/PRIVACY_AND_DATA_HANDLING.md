# Privacy and Data Handling

This project involves data for high-level athletes. We must ensure absolute control over what is uploaded and shared.

## Rules
- **No real footage in Git:** Videos must stay on the local hard drive.
- **No real athlete names in tests/fixtures:** Use placeholder names like "Player A" and "Test Session".
- **No private coaching notes in fixtures:** Keep test data generic.
- **Private Repository:** The GitHub repository must remain private in case sample exports or data are accidentally committed.
- **Explicit Upload Consent:** Any future AI or cloud upload features require deliberate user action, and the destination must be visible beforehand.
- **Data Deletion:** Future club-scale use must plan for deletion and export controls.

## Gitignore enforcement
Ensure `.gitignore` always excludes:
- Common video formats (`.mp4`, `.mov`, `.avi`)
- Local exports (`/exports`)
- Temporary frames, caches, and AI artifacts
- Environment files (`.env`, `.env.local`)

Sample generic fixtures for testing are permitted, provided they use fake names.
