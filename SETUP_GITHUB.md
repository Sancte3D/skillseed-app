# GitHub Setup Anleitung

## 1. GitHub Repository erstellen

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke auf das "+" Symbol oben rechts → "New repository"
3. Name: `skillseed_app` (oder wie du willst)
4. **Wichtig:** Wähle **"Private"** aus (nicht Public!)
5. Klicke auf "Create repository"

## 2. Lokales Git Repository initialisieren

Öffne Terminal/PowerShell im Projektordner:

```bash
# Git initialisieren (falls noch nicht geschehen)
git init

# Aktuellen Status prüfen
git status

# Alle Dateien hinzufügen
git add .

# Ersten Commit erstellen
git commit -m "Initial commit: SkillSeed App MVP"

# Remote Repository hinzufügen (ersetze USERNAME mit deinem GitHub-Username)
git remote add origin https://github.com/USERNAME/skillseed_app.git

# Main Branch benennen
git branch -M main

# Code zu GitHub hochladen
git push -u origin main
```

## 3. GitHub Credentials

Beim ersten Push wirst du nach Credentials gefragt:

**Option A: Personal Access Token (empfohlen)**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → Name: "skillseed_app"
3. Scopes: `repo` (für private repos)
4. Token kopieren und als Passwort verwenden

**Option B: GitHub CLI**
```bash
# GitHub CLI installieren und einloggen
gh auth login
```

## 4. Weitere Commits

Nach Änderungen:

```bash
# Status prüfen
git status

# Änderungen hinzufügen
git add .

# Oder spezifische Dateien
git add src/components/Button.tsx

# Commit erstellen
git commit -m "Fix: UI Debug System hinzugefügt"

# Zu GitHub pushen
git push
```

## 5. .gitignore prüfen

Die `.gitignore` Datei stellt sicher, dass sensible Daten (API Keys, node_modules, etc.) nicht hochgeladen werden.

## 6. Branching (optional)

Für Features:

```bash
# Neuen Branch erstellen
git checkout -b feature/ui-improvements

# Änderungen committen
git add .
git commit -m "Feature: UI improvements"

# Branch zu GitHub pushen
git push -u origin feature/ui-improvements

# Auf GitHub kannst du dann einen Pull Request erstellen
```

## Troubleshooting

**"Repository not found"**
- Prüfe ob das Repository auf GitHub existiert
- Prüfe ob der Repository-Name stimmt
- Prüfe ob du Zugriff hast (bei privaten Repos)

**"Permission denied"**
- Personal Access Token erstellen (siehe oben)
- Oder SSH Key verwenden

**"Already exists"**
```bash
# Remote entfernen und neu hinzufügen
git remote remove origin
git remote add origin https://github.com/USERNAME/skillseed_app.git
```

