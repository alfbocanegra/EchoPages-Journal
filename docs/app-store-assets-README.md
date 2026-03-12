# App Store Asset Preparation Guide

This guide provides everything you need to prepare, caption, and export app store assets for EchoPages Journal across iOS, Android, and desktop platforms.

---

## 📸 App Store Asset Preparation Checklist

### 1. App Icons
- iOS: 1024x1024 PNG (no transparency)
- Android: 512x512 PNG (no transparency), plus adaptive icons
- Desktop: 512x512 PNG, ICO, or ICNS as required

### 2. Screenshots
- Use real device screenshots
- Show key features: login, journal entry, handwriting input, sync, media, theming, etc.
- Avoid personal data in screenshots

#### iOS
- iPhone 6.7" (1290x2796 px)
- iPhone 6.1" (1179x2556 px)
- iPad Pro 12.9" (2048x2732 px, optional)
- 3–10 screenshots per device size

#### Android
- Phone: 1080x1920 px or higher
- Tablet: 1200x1920 px or higher
- Feature Graphic: 1024x500 px
- Promo Video: YouTube link (optional)

#### Desktop
- 1366x768 px, 1920x1080 px, or as required

### 3. Feature Graphics & Banners
- Google Play Feature Graphic: 1024x500 px
- App Store Promotional Artwork: 4320x1080 px (optional)
- Microsoft Store Banner: 3000x2000 px (if applicable)

### 4. App Preview/Promo Video
- iOS: 15–30s, 1080x1920 px, MP4/MOV
- Android: YouTube link, 30s–2min

### 5. Other Assets
- Privacy Policy & Terms of Service: Link to hosted docs
- Support/Contact Email: support@echopages.app
- App Description, Keywords, and Metadata

---

## 🏷️ Screenshot Caption Template
- Keep captions short, clear, and benefit-focused (2–6 words)
- Use title case, no punctuation unless needed

**Examples:**
- Secure Multi-Provider Login
- Handwriting Input & Drawing
- Sync Across All Devices
- Attach Photos, Audio, and More
- Custom Themes & Accessibility
- Encrypted Journal Entries
- Export or Delete Your Data Anytime
- Fast, Private, and Reliable

---

## 📝 Sample App Description

> **EchoPages Journal: Secure, Cross-Platform Journaling**
>
> EchoPages Journal is your private, encrypted journal for iOS, Android, web, and desktop. Capture your thoughts, sketches, and memories with powerful handwriting input, media attachments, and seamless sync across all your devices.
>
> **Key Features:**
> - Secure login with Google, Apple, or Dropbox
> - Field-level encryption for all your data
> - Handwriting input: draw, write, and export as images
> - Attach photos, audio, and videos to entries
> - Customizable themes and font sizes for accessibility
> - Fast, reliable sync across devices
> - Export or delete your data anytime
>
> **Your Privacy, Our Priority**
> EchoPages Journal never sells your data. All sensitive information is encrypted at rest and in transit. See our Privacy Policy for details.
>
> **Support & Feedback**
> Questions or feedback? Contact us at support@echopages.app or join our beta community.
>
> Start journaling securely—download EchoPages Journal today!

---

## ⚙️ Asset Export Automation Script (Example)

```sh
#!/bin/bash
# Export and organize app store assets

SRC_DIR="./screenshots"
DEST_DIR="./exported-assets"

mkdir -p "$DEST_DIR/ios" "$DEST_DIR/android" "$DEST_DIR/desktop"

# iOS sizes
cp "$SRC_DIR/iphone-6.7.png" "$DEST_DIR/ios/1290x2796.png"
cp "$SRC_DIR/iphone-6.1.png" "$DEST_DIR/ios/1179x2556.png"
cp "$SRC_DIR/ipad-pro.png" "$DEST_DIR/ios/2048x2732.png"

# Android sizes
cp "$SRC_DIR/android-phone.png" "$DEST_DIR/android/1080x1920.png"
cp "$SRC_DIR/android-tablet.png" "$DEST_DIR/android/1200x1920.png"
cp "$SRC_DIR/feature-graphic.png" "$DEST_DIR/android/feature-graphic-1024x500.png"

# Desktop sizes
cp "$SRC_DIR/desktop-1366x768.png" "$DEST_DIR/desktop/1366x768.png"
cp "$SRC_DIR/desktop-1920x1080.png" "$DEST_DIR/desktop/1920x1080.png"

echo "Assets exported and organized!"
```

- Adjust file names and paths as needed.
- For icons, use Xcode's Asset Catalog or Android Studio's Asset Studio for automatic resizing.
- For Figma/Sketch, use their export features to generate all required sizes.

---

## 🚦 Best Practices
- Use consistent branding, colors, and fonts
- Highlight unique features (handwriting input, encryption, sync, etc.)
- Ensure all text is legible and UI is up to date
- Double-check for typos and outdated screenshots
- Follow each store's guidelines strictly to avoid rejection

---

For questions or help, contact: support@echopages.app 