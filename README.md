# 🏖️ Vacation Countdown Timer

A modern, shareable web-based countdown timer to track the exact time until your vacation!

Customize your destination, departure date/time, visual themes, packing checklist, and generate a instant shareable link to send to friends, family, or travel companions.

---

## ✨ Features

- **Live Real-Time Countdown**: Crisp animated display showing Days, Hours, Minutes, and Seconds.
- **Glanceable Browser Tab**: Document title automatically updates (e.g., `🏖️ 14d 06h:22m — Hawaii Trip`) so you can keep it open while working.
- **Zero-Backend Sharing**: All vacation settings (destination, target date, theme, custom note, packing items) are encoded directly in the URL (`URLSearchParams`). Anyone opening the link sees your exact customized timer!
- **Instant Sharing Tools**:
  - One-click **Copy Share Link** with clipboard toast confirmation.
  - Native **Mobile Share Sheet** (`navigator.share`) for WhatsApp, iMessage, Slack, etc.
  - Integrated **QR Code** for instant phone scanning from computer screens.
- **6 Handcrafted Vacation Themes**:
  - 🌴 **Tropical Paradise** (Azure & Turquoise)
  - 🌅 **Golden Sunset** (Warm Coral & Sunburst)
  - 🏔️ **Alpine Escape** (Glacier Blue & Ice)
  - 🌌 **Midnight Stargaze** (Deep Indigo & Violet)
  - 🌿 **Emerald Jungle** (Lush Green & Mint)
  - 🌸 **Sakura Spring** (Rose & Pastel Peach)
- **Journey Progress Bar**: Visual percentage progress bar tracking time elapsed since trip planning.
- **Interactive Packing / Prep Checklist**: Keep track of passports, sunscreen, and out-of-office notes.
- **Celebration & Arrival Mode**: When the countdown strikes zero, celebrate with a confetti shower, chime, and an automatic count-up badge showing how long you've been on vacation!
- **Fullscreen Display Mode**: Perfect for mounting on an office monitor or ambient display.

---

## 🚀 How to Run & Preview Locally

Since this is built with standard web technologies (HTML5, CSS3, Vanilla JavaScript), no installation or node build step is needed.

### Option 1: Double-click to Open
Simply double-click [`index.html`](file:///c:/Users/mariu/Documents/antigravity/epic-chandrasekhar/index.html) in your file explorer to open it in your web browser.

### Option 2: Run with Python's Built-in Server
Open PowerShell or your terminal in this folder:
```powershell
python -m http.server 8080
```
Then visit:
```
http://localhost:8080
```

---

## 🌐 How to Publish on the Web for Free

You can put this online on a public URL in less than 2 minutes using any free static host:

### 1. GitHub Pages (Free & Permanent)
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial vacation countdown release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/vacation-timer.git
   git push -u origin main
   ```
2. In your GitHub repository, go to **Settings > Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. Your site will be live at `https://<your-username>.github.io/vacation-timer/`!

### 2. Netlify Drop (Instant Drag-and-Drop, No Account Needed)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this folder (`epic-chandrasekhar`) onto the web page.
3. You immediately get a public `.netlify.app` URL to share!

### 3. Vercel or Cloudflare Pages
1. Connect your repository to [Vercel](https://vercel.com) or [Cloudflare Pages](https://pages.cloudflare.com).
2. Leave build settings as static (`Build command: none`, `Output directory: .`).
3. Deploy instantly!

---

## 🔗 URL Parameters Reference

You can customize the countdown directly via URL query parameters:

| Parameter | Description | Example |
|---|---|---|
| `title` | Vacation destination or name | `Trip+to+Maui` |
| `d` | Target departure date in ISO format | `2026-11-20T09:00` |
| `theme` | Color theme (`tropical`, `sunset`, `alpine`, `midnight`, `emerald`, `sakura`) | `sunset` |
| `icon` | Single emoji representation | `🌴` |
| `note` | Subtitle or flight note | `Delta+Flight+402` |
| `pack` | Pre-filled checklist items (format: `done:item;done:item`) | `1:Passport;0:Sunscreen` |

Example share URL:
```
https://your-site.com/?title=Hawaii+Getaway&d=2026-11-20T09:00:00.000Z&theme=tropical&icon=🏖️
```
