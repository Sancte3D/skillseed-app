# Cache löschen - Expo/Metro Bundler

## Schnellste Methode:

```bash
# Cache löschen und neu starten
npx expo start --clear
```

## Alternative Methoden:

### 1. Nur Cache löschen (ohne Neustart):
```bash
npx expo start --clear
# Dann drücke Ctrl+C wenn der Server läuft
# Starte dann neu: npx expo start --ios
```

### 2. Metro Bundler Cache löschen:
```bash
npx react-native start --reset-cache
```

### 3. Alle Caches löschen:
```bash
# Expo Cache
rm -rf node_modules/.cache

# Metro Cache
rm -rf $TMPDIR/metro-*

# Watchman Cache (falls installiert)
watchman watch-del-all

# Dann neu starten
npx expo start --clear
```

### 4. Kompletter Reset (nur wenn nichts anderes funktioniert):
```bash
# Cache löschen
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*

# Node Modules neu installieren
rm -rf node_modules
npm install

# Dann starten
npx expo start --clear
```

## In der App (wenn sie läuft):

Im Expo Dev Menu:
- **`r`** = Reload App (soft reload)
- **`Shift+r`** = Reload mit Cache-Clear
- **`Ctrl+M`** (Android) oder **`Cmd+D`** (iOS) = Dev Menu öffnen

## Wichtig:

Nach `git pull` immer Cache löschen:
```bash
git pull origin main
npx expo start --clear
```
