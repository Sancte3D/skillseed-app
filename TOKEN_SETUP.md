# GitHub Token Setup - Classic (Empfohlen)

## 🎯 Classic Personal Access Token verwenden

### 1. Token erstellen
1. GitHub.com → **Settings** (oben rechts, dein Profilbild)
2. Links: **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. Klick: **"Generate new token"** → **"Generate new token (classic)"**

### 2. Token konfigurieren
- **Note:** `skillseed_app` (oder was du willst, zur Erinnerung)
- **Expiration:** 
  - `90 days` (sicherer)
  - Oder `No expiration` (bequemer, aber weniger sicher)
- **Scopes:** Nur diese ankreuzen:
  - ✅ **`repo`** (ganz unten, gibt Zugriff auf private repos)
    - Das aktiviert automatisch: repo:status, repo_deployment, public_repo, repo:invite, security_events

### 3. Token kopieren
- **WICHTIG:** Token wird nur **einmal** angezeigt!
- Sofort kopieren und sicher speichern
- Sieht aus wie: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. Token verwenden
Beim ersten `git push`:
- **Username:** Dein GitHub-Username (z.B. `PersancteStudio`)
- **Password:** Der Token (NICHT dein GitHub-Passwort!)

Windows speichert das automatisch im Credential Manager.

## ✅ Fertig!

Das war's - Classic Token reicht völlig aus für dein Projekt!

---

## ❓ Fine-grained Token (nur wenn du Classic nicht willst)

Fine-grained ist **komplizierter** und nur nötig wenn:
- Du sehr spezifische Permissions pro Repo brauchst
- Du eine Organisation mit strikten Regeln hast
- Du experimentieren willst

Für normale private Repos: **Classic ist besser!**

