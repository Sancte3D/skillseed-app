# Git Credentials Status prüfen

## 1. Prüfen ob Git bereits konfiguriert ist

```bash
# Aktuellen Git User prüfen
git config user.name
git config user.email

# Prüfen ob Remote schon gesetzt ist
git remote -v

# Prüfen ob Credentials gespeichert sind (Windows)
# Credentials Manager öffnen:
# Windows → Credentials Manager → Windows Credentials
# Suche nach "git:https://github.com"
```

## 2. Testen ob Token funktioniert

```bash
# Test ob du dich zu GitHub verbinden kannst
git ls-remote https://github.com/USERNAME/skillseed_app.git

# Falls das funktioniert, ist dein Token noch aktiv!
# Falls nicht, siehst du eine Fehlermeldung
```

## 3. Credentials zurücksetzen (falls nötig)

### Windows Credential Manager:
1. Windows-Taste → "Credential Manager" suchen
2. "Windows Credentials" öffnen
3. Suche nach `git:https://github.com`
4. Entfernen oder bearbeiten

### Per Kommandozeile:
```bash
# Credentials entfernen
git credential-manager-core erase
# Oder für ältere Versionen:
git credential-manager erase

# Dann bei nächstem Push neu eingeben
```

## 4. Neuen Token verwenden (falls alter nicht funktioniert)

**Wichtig:** Ein Token kann mehrere Repos verwenden!
- Du kannst den **gleichen Token** für mehrere Repositories nutzen
- Oder einen **neuen Token** erstellen (der alte bleibt dann auch aktiv)

### Token prüfen/bearbeiten:
1. GitHub.com → Settings → Developer settings → Personal access tokens
2. Siehst du alle deine Tokens (auch abgelaufene)
3. Du kannst mehrere haben - kein Problem!

## 5. Wenn mehrere Tokens: Welcher wird verwendet?

Git verwendet automatisch:
1. **Gespeicherte Credentials** im Credential Manager (hat Priorität)
2. Falls nichts gespeichert: fragt beim Push nach

**Lösung:** Einfach pushen und schauen was passiert:
```bash
git push -u origin main
```

- **Falls es funktioniert** → Dein alter Token funktioniert noch! ✅
- **Falls Fehler** → Neuen Token erstellen oder Credentials zurücksetzen

## 6. Mehrere Tokens - kein Problem!

- GitHub erlaubt **unbegrenzt viele Tokens**
- Jeder Token kann mehrere Repos verwenden
- Alte Tokens funktionieren weiter, bis du sie löschst

**Best Practice:** 
- Einen Token pro Projekt/App (einfacher zu verwalten)
- Oder einen Token für alles (einfacher, aber weniger sicher)

