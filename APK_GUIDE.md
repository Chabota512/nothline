# Building a Free APK for Northline

A complete, no-cost guide to turning your Northline source code into an installable Android `.apk` file. **No credit card. No paid services. No Replit deployment.**

There are two paths. Pick **Path A** if you don't have (or don't want to install) Android Studio. Pick **Path B** if you want full local control.

---

## Path A — EAS Build (cloud, easiest)

Expo's EAS Build cloud service has a **free tier**: 30 Android builds per month, no credit card required. Builds run on Expo's servers; you wait in a free queue (usually 5–25 minutes).

### One-time setup (~10 minutes)

1. **Create a free Expo account.**
   - Go to <https://expo.dev/signup>.
   - Sign up with email or GitHub. **No credit card asked.**
   - Verify your email.

2. **Install Node.js on your computer** (skip if already installed).
   - Download the LTS installer from <https://nodejs.org>.

3. **Install the EAS CLI.** Open a terminal and run:
   ```bash
   npm install -g eas-cli
   ```

4. **Clone your GitHub repo locally:**
   ```bash
   git clone https://github.com/Chabota512/nothline.git
   cd nothline
   ```

5. **Install dependencies:**
   ```bash
   npm install -g pnpm
   pnpm install
   ```

6. **Log into EAS from the terminal:**
   ```bash
   eas login
   ```
   Use the same email/password you signed up with.

### Configure the project for APK output (one-time, ~3 minutes)

EAS Build creates `.aab` (Play Store bundles) by default. We want a real `.apk` you can install directly.

1. From inside the `nothline/artifacts/northline` folder, create a file named `eas.json` with the following content:

   ```json
   {
     "cli": {
       "version": ">= 5.0.0"
     },
     "build": {
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```

2. Initialize the EAS project link (run inside `artifacts/northline`):
   ```bash
   eas init
   ```
   Accept the defaults. This writes a project ID into your `app.json`.

### Trigger a build

From inside `artifacts/northline`:

```bash
eas build --platform android --profile preview
```

- It will ask if you want to generate a new Android keystore — say **yes**. EAS stores it for you for free; you'll need it for every future build of this app, so don't lose your Expo account.
- Wait in the queue. When it's done, the terminal prints a URL ending in `.apk`. Open the URL on your Android phone in Chrome and tap to install.

### Things to know
- **Free tier**: 30 builds/month, queue can be 5–25 minutes during peak. You will not be charged. EAS will not prompt you for a card.
- **Want unlimited free builds?** Use `eas build --platform android --profile preview --local` instead. That builds on your computer and bypasses the cloud queue entirely (requires the Android SDK — see Path B step 1).
- **Updating the app later?** Bump `expo.version` in `app.json`, commit, and run `eas build` again.

---

## Path B — Fully local build (no Expo Cloud at all)

This builds the APK 100% on your computer with the open-source Android tooling. Slightly more setup, but every build after that is instant and unlimited.

### One-time setup (~30–60 minutes)

1. **Install Android Studio** (free) from <https://developer.android.com/studio>.
   - Run the installer and accept the default options. It will download the Android SDK (~3 GB).
   - Open Android Studio once → **More Actions → SDK Manager**.
   - Under **SDK Platforms**, check **Android 14 (API 34)** and click Apply.
   - Under **SDK Tools**, make sure these are installed: Android SDK Build-Tools, Android SDK Command-line Tools, Android SDK Platform-Tools.

2. **Install Java 17** (Temurin recommended): <https://adoptium.net/temurin/releases/?version=17>

3. **Set environment variables.** Add these to your shell profile (`~/.zshrc`, `~/.bashrc`, or Windows System Environment Variables):

   **macOS / Linux:**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk          # macOS
   # export ANDROID_HOME=$HOME/Android/Sdk                # Linux
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

   **Windows (PowerShell, run as admin):**
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   ```

4. **Install Node.js + pnpm** if you haven't already:
   ```bash
   # Install Node from https://nodejs.org
   npm install -g pnpm
   ```

5. **Clone and install:**
   ```bash
   git clone https://github.com/Chabota512/nothline.git
   cd nothline
   pnpm install
   ```

### Generate the native Android project (one-time)

From inside `artifacts/northline`:

```bash
pnpm exec expo prebuild --platform android --clean
```

This creates an `android/` folder with a real Gradle project.

### Build the APK

```bash
cd android
./gradlew assembleRelease       # macOS / Linux
gradlew.bat assembleRelease     # Windows
```

First build takes 5–15 minutes (Gradle downloads dependencies). Subsequent builds are 1–3 minutes.

When it finishes, your APK is at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Copy that file to your phone (USB, Google Drive, email to yourself, etc.) and tap it to install.

### Signing (important for installing)

The default `assembleRelease` produces an unsigned APK. Android refuses to install unsigned APKs. To sign it, generate a keystore once:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore northline.keystore \
  -alias northline -keyalg RSA -keysize 2048 -validity 10000
```

Set a password and remember it. Move `northline.keystore` into `artifacts/northline/android/app/`.

Edit `artifacts/northline/android/app/build.gradle` and find the `signingConfigs` block. Add a `release` config:

```gradle
signingConfigs {
    debug { /* leave existing */ }
    release {
        storeFile file('northline.keystore')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'northline'
        keyPassword 'YOUR_PASSWORD'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release   // change from signingConfig signingConfigs.debug
        // ... rest unchanged
    }
}
```

Rebuild with `./gradlew assembleRelease`. The signed APK will install cleanly.

> Keep `northline.keystore` and the password somewhere safe. You need the **same** keystore to publish updates that overwrite the same installed app.

---

## Installing the APK on your phone

1. On your Android phone, open **Settings → Security → Install unknown apps** (wording varies by manufacturer).
2. Allow the browser or file manager you'll use to install APKs.
3. Open the `.apk` file → tap **Install**.

Lock-screen reminders need notification permission — Android will ask you the first time the app schedules one.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `eas build` says "credit card required" | You're trying a paid feature (e.g. priority queue). Stick to `--profile preview` and the standard queue — it's always free. |
| Gradle: "SDK location not found" | `ANDROID_HOME` env var isn't set or your shell didn't reload. Close and reopen the terminal. |
| Gradle: "Java home is not set" | Install Java 17 (Temurin) and set `JAVA_HOME`. |
| APK won't install on phone | The APK is unsigned. Follow the signing steps in Path B. |
| App opens to white screen | Make sure you ran `expo prebuild` after the most recent code change. |
| "Package conflicts with existing package" on install | You already have a debug version installed from Expo Go. Uninstall it first. |

---

## Which path should you pick?

- **Just want an APK in 20 minutes, don't care about cloud?** → Path A (EAS Build).
- **Want unlimited free builds and don't mind a one-time setup?** → Path B (local).
- **Both is fine too.** They don't conflict.

Either way, your costs are **$0.00** and **no credit card** is needed at any step.
