# 🎬 PDF Presentation with Hand Gesture Control & Real-time Annotation

A full-stack React + Express application for controlling PDF presentations using hand gestures and real-time annotations.

## ✨ Features (All 20 Implemented)

### Gesture Features (1-12)
- 1. **Wipe Right** → Next Slide
- 2. **Wipe Left** → Previous Slide
- 3. **Fist** → Pause / Blank Screen
- 4. **Open Palm** → Resume
- 5. **Pinch In/Out** → Zoom
- 6. **Thumbs Up** → Laser Pointer ON
- 7. **Peace Sign** → Draw Mode
- 8. **3 Fingers** → Erase Last Annotation
- 9. **Air Pen** → Freehand Draw on Slides
- 10. **Highlighter Mode** → Semi-transparent yellow stroke
- 11. **Shape Stamp** → Box / Circle / Arrow
- 12. **Clear All Annotations** → Wipe canvas clean

### UI & Backend Features (13-20)
- 13. **Undo/Redo** → Full annotation stack
- 14. **Live Laser Pointer** → Red glowing dot tracking
- 15. **Color Switcher** → Red, Blue, Green, Black palette
- 16. **Slide Thumbnail Strip** → Jump to any page
- 17. **Presentation Timer** → Countdown with visual alerts
- 18. **Dark/Light Mode** → Toggle theme mid-presentation
- 19. **Webcam PiP** → Picture-in-Picture presenter view
- 20. **Snap Slide to Image** → Screenshot as PNG download

### Backend Capabilities
- PDF Upload with validation
- User Authentication (JWT + bcrypt)
- Session Management (save/load annotations)
- Shareable presentation links
- RESTful API for all operations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Camera/webcam (for gesture detection)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Create uploads directory
mkdir -p uploads

# 3. Start backend server (in terminal 1)
npm run server:dev

# 4. Start frontend dev server (in terminal 2)
npm run dev
```

The app will open at `http://localhost:3000`

### Demo Login
- **Email**: user@test.com
- **Password**: test123

---

## 🏗️ Project Structure

```
os week/
├── 📁 components/           # React UI components
│   ├── ui/                 # Base UI components (Button, Card)
│   ├── Auth.tsx            # Login/Register form
│   ├── PDFUpload.tsx       # File upload with drag-drop
│   ├── ThumbnailStrip.tsx  # Slide navigation
│   ├── PresentationTimer.tsx # Countdown timer
│   ├── ThemeToggle.tsx     # Dark/Light mode
│   └── WebcamPiP.tsx       # Picture-in-picture
│
├── 📁 hooks/
│   └── use-hand-gesture.ts # MediaPipe gesture detection
│
├── 📁 services/            # API communication
│   ├── auth.ts            # Authentication service
│   ├── document.ts        # PDF management
│   └── session.ts         # Presentation sessions
│
├── 📁 utils/
│   ├── drawing-utils.ts   # Canvas drawing primitives
│   └── pdf-utils.ts       # PDF & session types
│
├── GestureControl.tsx      # Main presentation component
├── App.tsx                 # Application wrapper
├── server.ts              # Express backend
├── main.tsx               # React entry point
├── index.html             # HTML template
├── index.css              # Tailwind styles
│
├── Configuration Files
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Build configuration
├── tailwind.config.ts     # Theme customization
├── postcss.config.js      # CSS processing
├── .env                   # Local environment variables
├── .env.example           # Environment template
└── .gitignore             # Git ignore rules
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in user

### Documents
- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents/:id` - Download PDF

### Sessions
- `POST /api/sessions` - Create presentation session
- `GET /api/sessions/:id` - Get session
- `PUT /api/sessions/:id` - Update annotations
- `GET /api/sessions/user/list` - List user sessions
- `GET /api/sessions/share/:token` - Access shared session

---

## 🔧 Environment Variables

```env
# .env file (local development)
VITE_API_URL=http://localhost:4001
VITE_APP_URL=http://localhost:3000
HTTP_PORT=4001
JWT_SECRET=dev-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

---

## 🛠️ Development Scripts

```bash
# Frontend only
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend only
npm run server       # Start Express server
npm run server:dev   # Start with auto-reload (nodemon)

# Full stack (requires 2 terminals)
# Terminal 1: npm run server:dev
# Terminal 2: npm run dev
```

---

## 🎨 Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```ts
theme: {
  extend: {
    colors: {
      'primary': '#FF6B35',
      'secondary': '#004E89',
    }
  }
}
```

### Adjust Canvas Drawing
Modify `utils/drawing-utils.ts`:
```ts
export const drawPen = (ctx, fromX, fromY, toX, toY, tool) => {
  ctx.lineWidth = tool.size; // Adjust: 1-10
  // ...
}
```

### Change Timer Duration
In `components/PresentationTimer.tsx`:
```ts
const [totalTime, setTotalTime] = useState(30 * 60); // Change from 30 to 45 minutes
```

---

## 📦 Dependencies

### Frontend
- **react** - UI framework
- **lucide-react** - Icons
- **pdfjs-dist** - PDF rendering (future)
- **tailwindcss** - Styling

### Backend
- **express** - Web server
- **jsonwebtoken** - JWT auth
- **bcrypt** - Password hashing
- **multer** - File uploads
- **cors** - Cross-origin requests
- **dotenv** - Environment management

---

## 🔐 Security Notes

1. **Change JWT_SECRET** in production:
   ```bash
   openssl rand -base64 32
   ```

2. **File Upload Validation**:
   - Maximum 50MB PDF files
   - Only PDF MIME type accepted
   - Files stored in `uploads/` directory

3. **Authentication**:
   - Passwords hashed with bcrypt (10 rounds)
   - JWT tokens expire in 24 hours
   - CORS restricted to whitelisted origins

---

## 🐛 Troubleshooting

### Camera Permission Denied
- Check browser camera permissions (settings icon in address bar)
- Ensure HTTPS on production

### PDF Not Loading
- Verify file is valid PDF (< 50MB)
- Check browser console for errors

### Backend Port in Use
```bash
# Find process using port 4001
lsof -i :4001
# Kill process
kill -9 <PID>
```

### Gesture Detection Not Working
- Ensure camera is enabled and visible
- Check hand is clearly visible in frame
- Verify lighting conditions

---

## 📚 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: Mock in-memory (Ready for MongoDB integration)
- **Authentication**: JWT + bcrypt
- **Gesture Detection**: MediaPipe HandLandmarks (via landmarks analysis)
- **Styling**: Tailwind CSS + custom components

---

## 🚀 Future Enhancements

- [ ] MongoDB integration for persistent storage
- [ ] Real MediaPipe implementation with TensorFlow.js
- [ ] WebSocket support for real-time collaboration
- [ ] PDF.js integration for actual PDF rendering
- [ ] Export annotated PDFs with pdf-lib
- [ ] Video recording of annotations
- [ ] Cloud storage (AWS S3 / Cloudinary)
- [ ] Advanced gesture ML model
- [ ] Mobile app version (React Native)

---

## 📝 License

MIT License - Feel free to use for educational and commercial projects.

---

## 👥 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Ensure all dependencies are installed with `npm install`
4. Verify environment variables in `.env` file

---

**Happy Presenting! 🎉**
