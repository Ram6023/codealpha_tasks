<div align="center">

# 🚀 Code Alpha Internship Projects

### Web Development Internship Program

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com)
[![Code Alpha](https://img.shields.io/badge/Code%20Alpha-Internship-blueviolet.svg)](https://codealpha.tech)
[![Status](https://img.shields.io/badge/Status-Completed-brightgreen.svg)]()
[![Projects](https://img.shields.io/badge/Projects-2-blue.svg)]()

</div>

---

## 📋 Overview

This repository contains projects developed during my **Web Development Internship** at **Code Alpha**. Each project demonstrates proficiency in modern web development technologies and best practices.

---

## 📁 Project Structure

```
CodeAlpha/
│
├── 📂 TaskForge/            → Project 1: Project Management App
│   └── Next.js + Supabase + TypeScript + Tailwind CSS
│
├── 📂 socialmedia/          → Project 2: Trendio - Social Media Platform
│   ├── backend/             → Node.js + Express + SQLite
│   └── public/              → Vanilla HTML/CSS/JavaScript
│
└── 📄 README.md             → This file
```

---

## 🎯 Projects

### Project 1: TaskForge — Premium Project Management

<div align="center">
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
</div>

#### 📝 Description
**TaskForge** is a premium project management application with beautiful Kanban boards. It features a stunning, modern UI with glassmorphism effects, smooth animations, and a premium dark theme.

#### ✨ Features
- 🎨 **Premium UI/UX** — Glassmorphism, gradient accents, smooth animations
- 📋 **Kanban Boards** — Drag-and-drop task management
- 🏢 **Workspaces** — Organize projects by team or purpose
- 👥 **Team Collaboration** — Invite members, assign tasks
- 🔐 **Authentication** — Secure login/signup with Supabase Auth
- 📱 **Responsive Design** — Works on all devices
- 🌙 **Dark Mode** — Beautiful dark theme by default

#### 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 15 | React Framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| Supabase | Backend, Auth & Database |
| shadcn/ui | Premium UI components |

#### 🚀 Getting Started

```bash
# Navigate to project folder
cd TaskForge

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Project 2: Trendio — Social Media Platform

<div align="center">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
<img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
</div>

#### 📝 Description
**Trendio** is a modern, feature-rich social media platform built with vanilla JavaScript and Node.js. Share moments, connect with friends, and engage with a vibrant community. Features a beautiful gradient-based UI with smooth animations.

#### ✨ Features
- 🔐 **Authentication** — JWT-based secure login/signup with bcrypt encryption
- 📝 **Posts & Feed** — Create posts with images, location tagging
- ❤️ **Likes & Comments** — Engage with posts
- 👥 **Follow System** — Build your network, get user suggestions
- 📖 **Stories** — Share ephemeral moments with progress animations
- 💬 **Direct Messages** — Private messaging with conversation threads
- 🔔 **Notifications** — Real-time activity alerts (likes, comments, follows)
- 👤 **Profile Management** — Bio, stats, post grid, profile tabs
- 🎨 **Premium UI** — Gradient themes, glassmorphism, Font Awesome icons

#### 🛠️ Tech Stack
| Technology | Purpose |
|------------|---------|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| SQLite3 | Lightweight database |
| JWT | Authentication tokens |
| bcryptjs | Password encryption |
| Vanilla JS | Frontend interactivity |
| CSS3 | Modern styling with gradients & animations |
| Font Awesome | Icon library |

#### 🚀 Getting Started

```bash
# Navigate to project folder
cd socialmedia/backend

# Install dependencies
npm install

# Set up environment variables
# Create .env with:
# JWT_SECRET=your_secret_key

# Start the server
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/posts` | Get feed posts |
| `POST` | `/api/posts` | Create a post |
| `POST` | `/api/posts/:id/like` | Like/unlike post |
| `POST` | `/api/posts/:id/comments` | Add comment |
| `GET` | `/api/users/suggestions` | Get suggestions |
| `POST` | `/api/users/:id/follow` | Follow user |
| `GET` | `/api/notifications` | Get notifications |

---

## 👨‍💻 About the Intern

| | |
|---|---|
| **Name** | *Your Name* |
| **Internship** | Code Alpha - Web Development |
| **Duration** | February 2026 |
| **Email** | *your.email@example.com* |

---

## 🛠️ Technologies Used (Overall)

<div align="center">

| Frontend | Backend | Database | Tools |
|----------|---------|----------|-------|
| React/Next.js | Node.js | PostgreSQL | Git |
| TypeScript | Express.js | SQLite | VS Code |
| Tailwind CSS | Supabase | Supabase | Vercel |
| Vanilla JS/CSS | JWT Auth | | npm |
| shadcn/ui | REST API | | |

</div>

---

## 📜 License

This project is developed as part of the **Code Alpha Internship Program**.

---

## 🙏 Acknowledgements

- **Code Alpha** — For providing this internship opportunity
- **Supabase** — For the amazing backend platform
- **Vercel** — For Next.js and deployment platform
- **shadcn** — For the beautiful UI components
- **Font Awesome** — For the icon library

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

Made with ❤️ during Code Alpha Internship

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=flat-square&logo=github)](https://github.com)

© 2026 Code Alpha Internship Projects

</div>
