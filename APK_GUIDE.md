# Northline — Free Cloud APK Build Guide

Build your APK entirely in the cloud. **No computer setup. No credit card. No installs on your phone other than the final APK.** Your laptop is only used to click buttons in a browser.

There are two free cloud paths. **Path A is the easiest** — it's already wired up in this repo and just needs you to click "Run workflow" on GitHub.

---

## Path A — GitHub Actions (recommended, fully automated)

This repo includes a workflow at `.github/workflows/build-apk.yml` that builds your APK on GitHub's free Linux runners. Public repos get unlimited free build minutes; private repos get 2,000 minutes/month free. A single Northline build uses ~10 minutes.

### How to trigger a build

1. Open your repo: <https://github.com/Chabota512/nothline>
2. Click the **Actions** tab at the top.
3. If GitHub asks "Workflows aren't being run on this forked repository" or similar, click **I understand my workflows, go ahead and enable them**.
4. In the left sidebar, click **Build Android APK**.
5. On the right, click **Run workflow** → leave branch as `main` → click the green **Run workflow** button.
6. A new run appears. Click into it. Wait ~8–15 minutes (first build is slowest; subsequent builds are faster thanks to caching).
7. When the run finishes with a green checkmark, scroll to the bottom of the run page to the **Artifacts** section.
8. Click **northline-apk** to download a `.zip` containing `northline.apk`.

### Auto-builds on every push

The workflow also runs automatically every time you push changes that touch `artifacts/northline/**`. So once you commit and push, you can just check the Actions tab a few minutes later for a fresh APK — no clicking required.

### What you get
- A **release-mode** APK, JS bundled in, runs **fully offline**.
- Signed with the default Expo debug keystore — installs on any Android phone with no Play Store needed.
- File size ~30–50 MB.

### Free quota
- **Public repo**: unlimited free build minutes. No card.
- **Private repo**: 2,000 minutes/month free. ~200 builds/month. No card needed unless you exceed this.

---

## Path B — EAS Build (Expo's cloud)

Alternative if you'd rather not use GitHub Actions. Free, no card, builds run on Expo's servers, and you download the APK from a URL.

### Setup (one-time, all in your browser)

1. Sign up for a free Expo account at <https://expo.dev/signup>. **No credit card.**
2. Verify your email.
3. Open <https://github.com/codespaces> and create a free Codespace from your `nothline` repo. (GitHub Codespaces gives you a Linux terminal in your browser — 60 hours/month free, no card.)
4. In the Codespace terminal:
   ```bash
   npm install -g eas-cli pnpm
   pnpm install
   eas login                         # sign in with your Expo account
   cd artifacts/northline
   ```
5. Create `artifacts/northline/eas.json` with this content:
   ```json
   {
     "cli": { "version": ">= 5.0.0" },
     "build": {
       "preview": {
         "distribution": "internal",
         "android": { "buildType": "apk" }
       }
     }
   }
   ```
6. Initialize the EAS project link:
   ```bash
   eas init
   ```
   Accept defaults.

### Trigger a build

```bash
eas build --platform android --profile preview
```

- It will offer to generate an Android keystore on Expo's servers — say **yes** (free, stored for you).
- Wait in the queue (5–25 min on free tier).
- When done, the terminal prints a URL. Open it in your phone's browser to download the APK directly.

### Free quota
- 30 Android builds per month, no card needed.
- For more, switch to Path A or run `eas build --local` (which needs a computer with Android SDK — outside the scope of this guide).

---

## Installing the APK on your phone

Same for both paths.

1. Transfer the `.apk` to your phone. Easy options:
   - **GitHub Actions path**: open the workflow run page on your phone and download the `.zip` directly, then unzip with any file manager.
   - **EAS path**: open the build URL in your phone's browser; it downloads the `.apk` directly.
   - Or email/Google Drive/Telegram it to yourself.
2. Tap the `.apk` file in your phone's downloads.
3. Android will warn you about installing from an unknown source. Tap **Settings** in the warning, allow your browser/file manager to install unknown apps, go back, and tap **Install**.
4. Open Northline. The first time it schedules a reminder, Android will ask for notification permission — tap **Allow** so the lockscreen reminders work.

That's it. The app stores everything locally on your device. No accounts, no servers, fully offline.

---

## Updating the app later

1. Edit code (here on Replit, or anywhere).
2. Push to `main` on GitHub.
3. The Actions workflow runs automatically. ~10 minutes later, download the new APK from the Actions tab.
4. Install over the existing app — your data is preserved as long as the package signature matches (it will, since the build always uses the same auto-included keystore).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| GitHub Actions shows "Workflow run failed" with `gradle` errors | Click into the failed step. Most common cause: Java version. The workflow pins Java 17 — should be fine. If something else, paste the error to me here. |
| Workflow says "permission denied: ./gradlew" | Already handled — the workflow runs `chmod +x ./gradlew` before building. |
| EAS asks for a credit card | You're trying a paid feature. Stick with `--profile preview` and the standard queue — that's always free. |
| APK installed but won't open | Make sure it's the **release** APK (path A and B both produce release builds). The previous Expo Go preview won't work as a standalone install. |
| Want a Play Store-ready signed APK | You'll need to generate your own keystore and store it as a GitHub Secret. Ping me and I'll add the signing step to the workflow. |
| First build takes very long | Normal. First build downloads the entire Android Gradle dependency tree (~15 min). The cache makes subsequent builds 3–5 min. |

---

## Summary

**Easiest path**: push your code → open Actions tab on GitHub → click Run workflow → wait → download APK. No computer setup, no card, takes one cup of coffee.
