 # Visual Diary

Visual Diary is a simple, client‑side journaling app where you can write daily entries, attach images, and manage them in a clean, card‑based layout.

## Features

- Create entries with a **title**, **notes**, and **multiple images**
- View, edit, and delete existing entries
- Local storage–based persistence in the browser
- Lightweight demo auth (login/register) stored locally

## Project Structure

- `Visual-dairy-main/index.html` – main HTML file
- `Visual-dairy-main/css/styles.css` – styles
- `Visual-dairy-main/js/app.js` – app logic

## Running the App

No build step is required.

1. Open the folder `Visual-dairy-main/Visual-dairy-main` in File Explorer.
2. Double‑click `index.html`, or from a terminal in that folder run:

   ```powershell
   start index.html

   cd "D:\Users\chorme downloads\Visual-dairy-main\Visual-dairy-main"
npm install
cd "D:\Users\chorme downloads\Visual-dairy-main\Visual-dairy-main"
npm run dev
   ```

The app will open in your default browser.

## Notes

This project is meant as a front‑end demo; all data is stored in the browser only and is not secure for production use.
## Visual Diary

A simple **browser-based visual diary** where each user can create dated entries with a title, notes, and images. All data is stored locally in the browser using `localStorage`, scoped per user account.

### Features

- **User accounts (local only)**: Register, log in, and log out. Credentials are stored only in the browser for demo purposes.
- **Diary entries**: Add entries with a title, free-form notes, and one or more images.
- **Image previews**: Thumbnails are shown in the entry cards and in the detailed view modal.
- **Edit & delete**: Open an entry in a modal to edit the title/notes, append images, or delete the entry.
- **Per-user storage**: Each logged-in user sees only their own entries.

### Project Structure

- `Visual-dairy-main/index.html` – Main HTML page and UI layout.
- `Visual-dairy-main/app.js` – Front-end logic (auth, entries, local storage, modals).
- `Visual-dairy-main/styles.css` – Styling for the app.

### How to Run

This is a **static front-end app** (no backend required). You can run it in two common ways:

1. **Quick test (double-click)**
   - Navigate to the `Visual-dairy-main` folder.
   - Double-click `index.html` to open it in your default browser.
   - Note: Some browsers restrict `localStorage` or file access for `file://` URLs; if things don’t work as expected, use a local web server (see below).

2. **Using a local web server (recommended)**
   - Open this folder in VS Code / Cursor.
   - Install the **Live Server** extension (if you don’t have it).
   - Right-click `index.html` and choose **“Open with Live Server”**.
   - Your browser will open the app at a `http://localhost:...` URL with full `localStorage` support.

### Usage

1. Click **Login** in the header.
2. Enter an email and password, then click **Register** (first time) or **Login** (later).
3. After logging in, the diary form becomes enabled:
   - Enter a **Title**.
   - Add some **Notes**.
   - (Optional) Attach one or more **Images**.
   - Click **Save** to create the entry.
4. Click an entry card to open it in a modal where you can:
   - Edit the title and notes.
   - Append more images.
   - **Save Changes** or **Delete** the entry.

### Notes & Limitations

- This is a **demo / local-only** app. There is **no real backend** and no real security.
- Passwords are hashed in-browser for demonstration only; do **not** use a real password.
- Data is stored in your browser’s `localStorage`, per user and per browser. Clearing site data or using another browser/computer will lose or hide existing entries.

