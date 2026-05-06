# SkillSeed App starten auf MacBook

## Voraussetzungen

1. **Node.js & npm installiert** (sollte bereits vorhanden sein)
2. **Expo CLI** (wird automatisch installiert via `npx`)
3. **iOS Simulator** (optional, für iPhone-Testing) oder
4. **Expo Go App** auf deinem iPhone (für physisches Gerät)

## Schritt-für-Schritt Anleitung

### Option 1: Mit iOS Simulator (empfohlen für Entwicklung)

```bash
# 1. In das Projekt-Verzeichnis wechseln
cd /path/to/skillseed_app

# 2. Dependencies installieren (falls noch nicht geschehen)
npm install

# 3. Expo starten und iOS Simulator öffnen
npx expo start --ios
```

Dies öffnet automatisch den iOS Simulator auf deinem Mac.

### Option 2: Mit Expo Go App auf iPhone/iPad

```bash
# 1. In das Projekt-Verzeichnis wechseln
cd /path/to/skillseed_app

# 2. Dependencies installieren
npm install

# 3. Expo Development Server starten
npx expo start
```

Dann:
1. **Expo Go App** auf deinem iPhone installieren (aus dem App Store)
2. QR-Code scannen, der im Terminal/Browser erscheint
3. App öffnet sich automatisch

### Option 3: Im Browser (Web-Version)

```bash
npx expo start --web
```

## Nützliche Commands

```bash
# Cache löschen (bei Problemen)
npx expo start --clear

# Nur Metro Bundler starten (ohne automatisches Öffnen)
npx expo start --no-dev

# Production Build für iOS
npx expo run:ios
```

## Troubleshooting

### Port bereits belegt?
```bash
# Alle Expo/Metro Prozesse beenden
pkill -f "expo\|metro"

# Dann neu starten
npx expo start
```

### Dependencies fehlen?
```bash
npm install
```

### TypeScript Fehler?
```bash
# TypeScript checken
npx tsc --noEmit

# Oder einfach ignorieren und starten - Expo kompiliert es
```

### Xcode nicht installiert? (für iOS Simulator)
- iOS Simulator funktioniert OHNE Xcode vollständiger Installation
- Falls Xcode benötigt wird: `xcode-select --install` im Terminal

## Tastenkürzel im Expo Dev Menu

Wenn die App läuft:
- **`r`** = Reload App
- **`m`** = Toggle Dev Menu
- **`j`** = Open Debugger
- **`Ctrl+C`** = Stop Server

## Features die du testen kannst

✅ **Tab Navigation**: Zwischen Explore, Dashboard, Timer, Profile wechseln
✅ **Haptics**: Bei Button-Presses und Tab-Wechseln (nur auf physischem Gerät!)
✅ **Animations**: Smooth Screen-Transitions und Button-Interactions
✅ **Pull-to-Refresh**: Im Dashboard Screen nach unten ziehen
✅ **Cross-Navigation**: Von Explore zu anderen Tabs navigieren

## Wichtig: Haptics

**Haptics funktionieren nur auf physischen Geräten!**
- iOS Simulator zeigt keine Haptics
- Android Emulator zeigt keine Haptics
- Verwende Expo Go auf einem echten iPhone/iPad für volles Erlebnis
