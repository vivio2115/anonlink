# 🔗 Anonlink

> *"Because sharing files shouldn't require a PhD in computer science"*

A dead simple, self-hosted file sharing app that Just Works™️. Upload files, get shareable links, profit. No BS, no tracking, no subscription fees.

## ✨ What does it do?

- � **Upload files** - drag, drop, done
- 🔗 **Get instant share links** - copy & paste to anyone  
- � **Track downloads** - see who's actually downloading your stuff
- ⏰ **Auto-expiry** - files disappear when you want them to
- � **User accounts** - keep your files organized
- � **Mobile friendly** - works on your phone too

## 🚀 Quick Start

**Got Docker? Easy mode:**
```bash
docker-compose up -d
```

**Want to build from source? Also easy:**
```bash
# Backend
go mod tidy
chmod +x run-dev.sh
./run-dev.sh

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

Open `http://localhost:3000` and start sharing!

## 🛠️ Tech Stack

**Backend:**
- Go + Gin (fast & simple)
- SQLite (zero config database)
- JWT tokens (secure auth)

**Frontend:**  
- React + TypeScript (modern & type-safe)
- Material-UI (pretty components)
- Axios (HTTP made easy)

## 🔧 Configuration

Set these environment variables if you want:

```bash
PORT=8080                    # Server port
DATABASE_PATH=./data.db      # Where to store the database
UPLOADS_PATH=./uploads       # Where to store uploaded files
JWT_SECRET=change-me-pls     # Secret for JWT tokens (CHANGE THIS!)
```

## 📁 Project Structure

```
├── cmd/                 # Main application
├── internal/           # Private application code
│   ├── auth/          # User authentication
│   ├── files/         # File operations
│   ├── handlers/      # HTTP handlers
│   └── database/      # Database stuff
├── frontend/          # React app
└── uploads/           # Uploaded files go here
```

## 🤝 Contributing

Found a bug? Want a feature? PRs welcome! This is a hobby project so be patient if I don't respond immediately.

## 📄 License

MIT - do whatever you want with it

## 🤔 FAQ

**Q: Is this secure?**  
A: It's not meant for top-secret files, but it's reasonably secure for everyday use.

**Q: Can I use this in production?**  
A: Sure! Just change the JWT secret and maybe put it behind a reverse proxy.

**Q: Why another file sharing app?**  
A: Because the existing ones either suck, cost money, or both.

**Q: How big files can I upload?**  
A: 10MB by default. Change it in the code if you need bigger files.

---

*Made with ☕ and mild frustration at existing file sharing solutions*
