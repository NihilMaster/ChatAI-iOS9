# Chat AI for iOS 9.3.6+ 🚀

A web application specifically designed as a workaround to Apple’s planned obsolescence, enabling legacy devices (iPad, iPhone) running **iOS 9.3.6 or later** to interact with modern AI through APIs like Google Gemini.

## ✨ Features

- **Full compatibility** with iOS 9.3.6 and later versions
- **Web interface optimized** for legacy Safari
- **Google Gemini integration** using API key
- **Compatible web technologies**: HTML5, CSS3, ES5
- **Enhanced text formatting** with basic markdown support
- **Free hosting** on GitHub Pages + Render.com

## 🎯 Compatible Devices

| Device | iOS Version | Browser | Status |
|--------|-------------|---------|---------|
| iPad 2, 3, 4 | 9.3.5 - 9.3.6 | Safari iOS 9 | ✅ Tested |
| iPad Mini 1 | 9.3.5 - 9.3.6 | Safari iOS 9 | ✅ Compatible |
| iPhone 4S | 9.3.5 - 9.3.6 | Safari iOS 9 | ✅ Compatible |
| iPod Touch 5G | 9.3.5 - 9.3.6 | Safari iOS 9 | ✅ Compatible |

**Testing needed for all supported versions (iOS 9.x, Android legacy, etc.)** – Please report your device functionality in Issues!
Use the `tested-on` label in the Issues tab to indicate the specific OS, device, or browser version where the project has been tested and confirmed working. This helps track community feedback on compatibility (e.g., `tested-on: iOS 9.3.6`, `tested-on: Android 4.4`).

## 🛠️ Technologies Used

### Frontend (iOS 9 Compatible)
- **HTML5** - Basic semantic structure
- **CSS3** - Compatible styles (flexbox with `-webkit-` prefixes)
- **JavaScript ES5** - No arrow functions, promises, or modern syntax
- **XMLHttpRequest** - Instead of Fetch API (not supported)

### Backend
- **Node.js** - Server runtime
- **Express.js** - Minimalist web framework
- **CORS configured** for legacy browsers

### APIs
- **Google Gemini API** - Exclusively supported
- **Basic markdown response formatting**

## 📋 Prerequisites

1. **iOS 9.3.6 or later device** (iPad, iPhone, iPod Touch)
2. **Internet connection** with TLS 1.2 support
3. **Google Gemini API Key** (free from Google AI Studio)
4. **Safari browser** (included in iOS 9)

## 🚀 Quick Setup

### 1. Get Gemini API Key
```bash
1. Visit https://aistudio.google.com/
2. Create free Google account
3. Generate new API Key
4. Copy your key
```

### 2. Deploy Backend (Render.com - 2 minutes)
```bash
1. Go to render.com and sign up
2. Click "New Web Service"
3. Connect your GitHub repository (or use: https://github.com/NihilMaster/chatAI-iOs9)
4. Deploy with default settings
5. Copy your backend URL (e.g., https://your-app.onrender.com)
```

### 3. Access Frontend
```bash
1. On your iOS 9 device, open Safari
2. Visit: https://nihilmaster.github.io/chatAI-iOs9/
3. Configure the settings:
   - Backend URL: [your-render-url from step 2]
   - API Key: [your-gemini-key from step 1]
4. Click "Save Configuration"
```

### 4. Start Chatting!
The chat interface will activate immediately after successful configuration.

## 💡 Technical Features

### Basic Markdown Support
The application includes a lightweight parser that maintains:
- `# Headers` → Prominent text sections
- `## Subheaders` → Secondary sections  
- `- List items` → Simple bullet points
- `**bold text**` → Visual emphasis

### Legacy Browser Support
- ✅ XMLHttpRequest (no Fetch API)
- ✅ ES5 JavaScript only
- ✅ Basic CSS3 with vendor prefixes
- ✅ TLS 1.2 compatibility

## 📁 Project Structure

```
chat-ios9/
├── index.html              # Main frontend (GitHub Pages)
├── server.js              # Backend application (Render.com)
├── package.json           # Backend dependencies
└── README.md             # This file
```

## 🤝 Contributing

Contributions are welcome! Please consider:
- Maintaining ES5 compatibility
- Using only iOS 9 supported APIs
- Testing on iOS 9 simulators or real devices

## 🐛 Issue Reporting

**Found a problem?** Help us improve compatibility by reporting issues:

1. Go to [GitHub Issues](https://github.com/NihilMaster/chatAI-iOs9/issues)
2. Include your device model and iOS version
3. Describe the specific problem encountered
4. Add any error messages received

---

**Tested on iPad3 | iOS 9.3.6 - Your device version may vary**  
Please report your experience in the Issues section to help expand compatibility! 🎉

*Last updated: 2025 - Optimized for iOS 9.3.6 and later versions*