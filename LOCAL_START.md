# App auf MacBook starten - Schritt für Schritt

## 1. In den richtigen Ordner navigieren

```bash
# Gehe zu Downloads
cd ~/Downloads/skillseed_app

# Oder falls es woanders liegt, finde es:
find ~/Downloads -name "skillseed_app" -type d
```

## 2. Prüfen ob du auf main Branch bist

```bash
# Aktuellen Branch anzeigen
git branch

# Falls nicht auf main, wechsle:
git checkout main
```

## 3. Neueste Änderungen von GitHub holen

```bash
git pull origin main
```

## 4. Dependencies installieren

```bash
npm install
```

## 5. App starten

```bash
# Mit iOS Simulator
npx expo start --ios

# ODER mit Expo Go App (QR-Code)
npx expo start

# ODER im Browser
npx expo start --web
```

## Vollständiger Command-Flow (Copy-Paste):

```bash
cd ~/Downloads/skillseed_app
git checkout main
git pull origin main
npm install
npx expo start --ios
```
