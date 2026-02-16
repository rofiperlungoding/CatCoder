# CatCoder

> **Master Coding. Build Your Future.**

An enterprise-grade gamified learning platform that transforms Python education through interactive challenges, real-time code execution, and skill-based progression tracking.

---

## 🌟 Inspiration

When I first enrolled in university, I assumed basic programming would be universal among students. I was wrong.

Many of my peers—even in technology-adjacent fields—had never written a single line of code. Senior students from other disciplines were desperately trying to break into tech, but the traditional learning pathways—expensive bootcamps, dense textbooks, lengthy courses—created significant barriers.

There had to be a better way.

**CatCoder** was born from this observation: a platform where learning feels like play, progress is visible, and programming becomes accessible to everyone.

---

## 💡 What It Does

CatCoder is an interactive, web-based platform designed to make programming education **accessible**, **engaging**, and **effective**.

### 📚 **Learn**
Structured, bite-sized lessons with an **Integrated AI Assistant** that provides real-time hints and explanations directly in the editor.

### 🧩 **Practice**
Hands-on coding challenges with immediate validation using **Pyodide WebAssembly**, and a **Gemini-style AI Insights Panel** that suggests the perfect next challenge based on your performance.

### ⚡ **Compete**
Race against peers, track personal bests, and climb the global ranks in an experience designed for speed and elite performance.

### 🗺️ **Career Roadmaps**
Visual learning paths for real careers.
- Frontend, Backend, Mobile, AI/ML tracks
- Clear progression with prerequisites
- Connect learning to job outcomes

---

## 🛠️ How We Built It

CatCoder leverages a modern, performant technology stack:

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, TailwindCSS 4 |
| **State** | Zustand |
| **Code Editor** | Monaco Editor (VS Code engine) |
| **Code Execution** | Pyodide (Python), Native JS |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Build Tool** | Vite 7 |
| **Deployment** | Netlify |

### Architecture Highlights:
- **Lazy Loading** — All pages and Monaco Editor are dynamically imported
- **Vendor Chunking** — Optimized bundle splitting for faster loads
- **Row Level Security** — XP validation happens server-side, preventing cheating
- **Magic Link Auth** — Passwordless authentication for frictionless onboarding

---

## 🚧 Challenges We Faced

1. **In-Browser Code Execution**
   Without a dedicated backend runner, we implemented client-side Python execution using Pyodide WebAssembly. This required careful handling of memory and async execution.

2. **Gamification Balance**
   Balancing educational depth with engagement demanded numerous UI/UX iterations to avoid overwhelming beginners while keeping advanced users challenged.

3. **Performance at Scale**
   Our initial 697KB bundle was too large. We implemented lazy loading and vendor chunking, reducing initial load to ~350KB—a 50% improvement.

4. **Authentication Flow**
   Initial magic link flows exhibited latency. We refactored to provide instant UI feedback while handling profile synchronization asynchronously.

---

## 🏆 Accomplishments We're Proud Of

- **Enterprise-Grade UI** — A premium, minimalist design inspired by Apple and modern SaaS products
- **Three Language Support** — Python, JavaScript, and C++ lesson modules ready for use
- **Real-Time Leaderboards** — Live speed run tracking fostering community and competition
- **Zero-Friction Onboarding** — Users start learning within seconds of visiting
- **Fully Responsive** — Seamless experience from mobile to desktop
- **Dark Mode** — Complete theme support with WCAG-compliant contrast

---

## 📖 What We Learned

- **User-Centered Design** — Features mean nothing if they frustrate users
- **Scalable React Architecture** — Proper state management and component composition are essential
- **Authentication Nuances** — Session management in modern web apps is complex
- **Performance Matters** — Every KB affects user experience

---

## 🚀 What's Next

| Feature | Status |
|---------|--------|
| AI-Powered Hints | Planned |
| C++ WASM Execution | Planned |
| Contest Mode | Planned |
| Team Competitions | Planned |
| Mobile App (React Native) | Planned |
| Course Creation Tools | Planned |

---

## 🐱 Why "CatCoder"?

Because learning to code should feel as curious, playful, and rewarding as a cat discovering a new box.

The best learning happens when you're relaxed, curious, and having fun.

---

## 🔗 Links

- **Live Demo**: [catcoder.netlify.app](https://catcoder.netlify.app)
- **Repository**: [github.com/rofiperlungoding/CatCoder](https://github.com/rofiperlungoding/CatCoder)

---

## 🛡️ Built With

`React` `TypeScript` `TailwindCSS` `Zustand` `Vite` `Supabase` `PostgreSQL` `Pyodide` `Monaco Editor` `Netlify`

---

<div align="center">

**🐱 CatCoder — Master Coding. Build Your Future.**

*Built with 💚 for learners everywhere.*

</div>
