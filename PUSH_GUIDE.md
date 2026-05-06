# Git Push - Schritt für Schritt

## 📍 Aktueller Stand
Du bist hier: `C:\Users\Anwender\Downloads\skillseed_app`

## ✅ Schritt 1: GitHub Repository erstellen (Falls noch nicht gemacht)

1. Gehe zu: https://github.com/new
2. Repository Name: `skillseed_app` (oder wie du willst)
3. **WICHTIG:** ✅ "Private" auswählen
4. **NICHT** "Add README" oder andere Optionen ankreuzen
5. Klick "Create repository"

## ✅ Schritt 2: Lokale Dateien committen

**Im Terminal/PowerShell (in diesem Ordner):**

```powershell
# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit: SkillSeed App MVP"

# Branch zu "main" umbenennen (GitHub Standard)
git branch -M main
```

## ✅ Schritt 3: GitHub Remote hinzufügen

**WICHTIG:** Ersetze `PersancteStudio` mit deinem echten GitHub-Username!

```powershell
# Remote hinzufügen (Username anpassen!)
git remote add origin https://github.com/PersancteStudio/skillseed_app.git

# Prüfen ob es funktioniert hat
git remote -v
```

Du solltest sehen:
```
origin  https://github.com/PersancteStudio/skillseed_app.git (fetch)
origin  https://github.com/PersancteStudio/skillseed_app.git (push)
```

## ✅ Schritt 4: Token holen (Falls noch nicht vorhanden)

1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)"
3. Scope: ✅ `repo` ankreuzen
4. Token kopieren (wird nur einmal angezeigt!)

## ✅ Schritt 5: PUSHEN!

```powershell
git push -u origin main
```

**Beim ersten Mal wird Windows fragen:**
- **Username:** Dein GitHub-Username (z.B. `PersancteStudio`)
- **Password:** Dein Token (NICHT dein GitHub-Passwort!)

✅ **Fertig!** Code ist jetzt auf GitHub!

---

## 🚨 Falls Fehler

### "remote origin already exists"
```powershell
# Alte Remote entfernen
git remote remove origin
# Dann Schritt 3 wiederholen
```

### "Authentication failed"
→ Token ist falsch → Neuen Token erstellen

### "Repository not found"
→ Prüfe ob Repository auf GitHub existiert
→ Prüfe ob der Username richtig ist

