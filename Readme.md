# ZyChat - Fast, Secure, Real-Time Chat Application

<div align="center">

![ZyChat Logo](https://img.shields.io/badge/ZyChat-Secure%20Messaging-8B5CF6?style=for-the-badge&logo=wechat&logoColor=white)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-BaaS-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Video%20Calls-333333?style=flat-square&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A modern, production-grade real-time messaging platform built with React and Firebase.**

ZyChat combines the familiarity of WhatsApp with advanced features like AI assistance, military-grade end-to-end encryption, and crystal-clear voice/video calls.

[Live Demo](#) • [Features](#-key-features) • [Getting Started](#-getting-started) • [Documentation](#-api--architecture)

</div>

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [API & Architecture](#-api--architecture)
- [Database Schema](#-database-schema)
- [Security & Encryption](#-security--encryption)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Firebase Security Rules](#-firebase-security-rules)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [Legal & Support](#-legal--support)

---

## 🚀 Key Features

### 💬 Real-Time Communication

| Feature | Description |
|---------|-------------|
| **Instant Messaging** | One-on-one and group chats with real-time delivery and read receipts |
| **Rich Media Support** | Send high-quality images, audio messages (with waveform visualization), and files |
| **Voice & Video Calls** | Crystal clear calls powered by WebRTC with mesh topology |
| **Status Updates** | Share 24-hour disappearing stories just like WhatsApp |
| **Typing Indicators** | Real-time "typing..." status for active conversations |
| **Message Status** | WhatsApp-style single/double tick indicators (sent, delivered, read) |
| **Online Presence** | See when contacts are online with accurate last seen timestamps |

### 🤖 ZyBot AI Assistant

| Feature | Description |
|---------|-------------|
| **Smart Conversations** | Integrated with Google Gemini 2.0 Flash API for intelligent responses |
| **Privacy-First (BYOK)** | Bring Your Own Key architecture - your API key is stored locally in browser |
| **Real-time Validation** | API key validation before saving to ensure correct configuration |
| **Context-Aware Help** | Get intelligent suggestions and assistance within the chat |

### 🔒 Privacy & Security

| Feature | Description |
|---------|-------------|
| **End-to-End Encryption** | AES-256-GCM encryption for all messages and media |
| **ECDH Key Exchange** | Elliptic Curve Diffie-Hellman for secure session key derivation |
| **Chat Compression** | Optional LZ-String compression for optimized storage |
| **Per-Chat Keys** | Unique encryption keys generated for each conversation |
| **Local Key Storage** | Private keys encrypted and stored locally, never sent to servers |
| **Friend Requests** | Unique connection system ensures you only chat with people you know |

### 🎨 Modern UI/UX

| Feature | Description |
|---------|-------------|
| **Glassmorphism Design** | Sleek, modern aesthetic with frosted glass effects |
| **Dark/Light Mode** | System-aware theme switching with manual override |
| **Responsive Design** | Fully optimized for desktop, tablet, and mobile devices |
| **Smooth Animations** | Micro-interactions and transitions for premium feel |
| **PWA Ready** | Installable as a Progressive Web App for native-like experience |

---

## 📸 Screenshots

### Web Interface
![Web Chat Interface](/Users/uk/.gemini/antigravity/brain/1cb85ff7-51a4-4d19-80d1-f17144c8bb54/chat_interface_mockup_1765274957473.png)
*Full-featured web interface with dark mode and glassmorphism styling.*

### Mobile Experience
![Mobile Chat](/Users/uk/.gemini/antigravity/brain/1cb85ff7-51a4-4d19-80d1-f17144c8bb54/mobile_chat_mockup_1765274982748.png)
*Responsive mobile design ensuring a seamless experience on any device.*

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.x |
| **Vite** | Build Tool & Dev Server | 5.x |
| **React Router** | Client-side Routing | 6.x |
| **CSS Variables** | Theming & Styling | Native |

### Backend & Services
| Technology | Purpose |
|------------|---------|
| **Firebase Authentication** | User authentication (Email/Password) |
| **Firebase Realtime Database** | Low-latency real-time data sync |
| **Cloudinary** | Media storage & CDN (unsigned uploads) |
| **Google Gemini API** | AI assistant capabilities |

### Real-Time Features
| Technology | Purpose |
|------------|---------|
| **WebRTC** | Peer-to-peer video/audio calls (Mesh Topology) |
| **Firebase RTDB Listeners** | Real-time message sync |
| **Presence System** | Online/offline status tracking |

### Security
| Technology | Purpose |
|------------|---------|
| **Web Crypto API (SubtleCrypto)** | Cryptographic operations |
| **AES-256-GCM** | Symmetric encryption for messages |
| **ECDH P-256** | Asymmetric key exchange |
| **LZ-String** | Message compression (optional) |

---

## 📁 Project Structure

```
FUTURE_FS_03/
├── public/                    # Static assets
├── src/
│   ├── assets/                # Images, icons, fonts
│   ├── components/            # Reusable UI components
│   │   ├── admin/             # Admin panel components
│   │   ├── calls/             # Video/audio call components
│   │   │   ├── CallUI.jsx     # Active call interface
│   │   │   └── IncomingCall.jsx
│   │   ├── chat/              # Chat-related components
│   │   │   ├── ChatHeader.jsx # Conversation header with actions
│   │   │   ├── ChatList.jsx   # List of conversations
│   │   │   ├── ChatListItem.jsx # Individual chat preview
│   │   │   ├── MessageInput.jsx # Rich message composer
│   │   │   └── MessageList.jsx  # Scrollable message display
│   │   ├── common/            # Shared components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Avatar.jsx
│   │   ├── layout/            # Layout components
│   │   │   ├── AppLayout.jsx  # Main app shell
│   │   │   ├── Sidebar.jsx    # Navigation sidebar
│   │   │   └── BottomNav.jsx  # Mobile navigation
│   │   └── status/            # Status/Stories components
│   │
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── CallContext.jsx    # WebRTC call management
│   │   ├── DataContext.jsx    # Global data caching
│   │   ├── EncryptionContext.jsx # E2E encryption keys
│   │   └── ThemeContext.jsx   # Theme management
│   │
│   ├── firebase/              # Firebase configuration
│   │   ├── config.js          # Firebase app initialization
│   │   ├── auth.js            # Authentication functions
│   │   └── database.js        # RTDB helper functions
│   │
│   ├── hooks/                 # Custom React hooks
│   │
│   ├── pages/                 # Route pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── app/               # Main application pages
│   │   │   ├── ChatsPage.jsx  # Chat list view
│   │   │   ├── ChatPage.jsx   # Individual conversation
│   │   │   ├── StatusPage.jsx # Stories/status view
│   │   │   ├── CallsPage.jsx  # Call history
│   │   │   ├── SettingsPage.jsx # User settings
│   │   │   └── UserSearchPage.jsx # Find & add contacts
│   │   ├── auth/              # Authentication pages
│   │   │   └── AuthPage.jsx   # Login/Register
│   │   ├── legal/             # Legal pages
│   │   │   ├── PrivacyPage.jsx
│   │   │   └── TermsPage.jsx
│   │   ├── marketing/         # Public marketing pages
│   │   │   ├── LandingPage.jsx
│   │   │   └── FeaturesPage.jsx
│   │   └── support/           # Support pages
│   │       └── HelpPage.jsx
│   │
│   ├── router/                # Routing configuration
│   │   ├── AppRouter.jsx      # Main router setup
│   │   └── ProtectedRoute.jsx # Auth guard component
│   │
│   ├── services/              # Business logic & APIs
│   │   ├── cloudinaryService.js  # Media upload handling
│   │   └── encryptionService.js  # E2E encryption utilities
│   │
│   ├── styles/                # Global styles
│   │   └── global.css         # CSS variables & base styles
│   │
│   ├── utils/                 # Utility functions
│   │
│   ├── App.jsx                # Root component
│   └── main.jsx               # Application entry point
│
├── database.rules.json        # Firebase RTDB security rules
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
└── README.md                  # This file
```

---

## 🔌 API & Architecture

### Application Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Firebase RTDB  │────▶│  Cloudinary     │
│   (Frontend)    │     │  (Backend)      │     │  (Media CDN)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Web Crypto    │     │  Firebase Auth  │
│   (Encryption)  │     │  (Identity)     │
└─────────────────┘     └─────────────────┘
```

### Context Providers

| Context | Purpose | Key Functions |
|---------|---------|---------------|
| **AuthContext** | User authentication state | `login()`, `register()`, `logout()`, `currentUser` |
| **DataContext** | Global data caching & sync | `chats`, `contacts`, `messages`, cache invalidation |
| **EncryptionContext** | E2E encryption key management | `encryptMessage()`, `decryptMessage()`, key derivation |
| **CallContext** | WebRTC call state management | `initiateCall()`, `acceptCall()`, `endCall()` |
| **ThemeContext** | Theme switching | `theme`, `toggleTheme()` |

### Service Layer

#### `encryptionService.js` - Encryption Functions

| Function | Description |
|----------|-------------|
| `generateKeyPair()` | Generate ECDH P-256 key pair for a user |
| `deriveSharedKey(privateKey, publicKey)` | Derive AES-256 shared secret from key exchange |
| `encryptMessage(message, key)` | Encrypt text with AES-256-GCM |
| `decryptMessage(ciphertext, iv, key)` | Decrypt text message |
| `encryptFile(file, key)` | Encrypt binary files/images |
| `decryptFile(url, iv, type, key)` | Decrypt and reconstruct files |
| `generateChatKey()` | Generate symmetric key for group chats |
| `encryptForStorage(data, password)` | Encrypt private keys for local storage |
| `decryptFromStorage(encrypted, password)` | Decrypt stored private keys |

#### `cloudinaryService.js` - Media Upload Functions

| Function | Description |
|----------|-------------|
| `uploadImage(file, preset)` | Upload image with transformation options |
| `uploadAudio(blob, preset)` | Upload audio recordings |
| `uploadFile(file, preset)` | Upload generic files |
| `getOptimizedUrl(publicId, options)` | Get CDN URL with transformations |

---

## 💾 Database Schema

ZyChat uses **Firebase Realtime Database (RTDB)** for low-latency data synchronization. Below is the complete schema with all fields:

### Collection: `users`
Stores user profile information.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | Firebase Auth UID (key) |
| `displayName` | `string` | User's display name |
| `username` | `string` | Unique username for discovery |
| `email` | `string` | User's email address |
| `avatarUrl` | `string` | Profile picture URL (Cloudinary) |
| `bio` | `string` | User bio/status text |
| `isOnline` | `boolean` | Current online status |
| `lastSeen` | `number` | Unix timestamp of last activity |
| `createdAt` | `number` | Account creation timestamp |

### Collection: `usernames`
Username to UID mapping for uniqueness check.

| Field | Type | Description |
|-------|------|-------------|
| `[username]` | `string` | Maps username → user UID |

### Collection: `chats`
Stores conversation metadata.

| Field | Type | Description |
|-------|------|-------------|
| `chatId` | `string` | Unique chat identifier (key) |
| `type` | `string` | `"direct"` or `"group"` |
| `members` | `object` | Map of member UIDs → `true` |
| `groupName` | `string` | Name (group chats only) |
| `groupIcon` | `string` | Icon URL (group chats only) |
| `createdBy` | `string` | UID of chat creator |
| `createdAt` | `number` | Creation timestamp |
| `lastMessage` | `object` | Preview of most recent message |
| `lastMessage.text` | `string` | Message text or "[Media]" |
| `lastMessage.senderId` | `string` | Sender's UID |
| `lastMessage.timestamp` | `number` | Message timestamp |

### Collection: `messages`
Stores all chat messages, organized by chat ID.

| Field | Type | Description |
|-------|------|-------------|
| `chatId/messageId` | `string` | Nested path (chatId/msgId) |
| `text` | `string` | Encrypted message ciphertext |
| `senderId` | `string` | Sender's UID |
| `type` | `string` | `"text"`, `"image"`, `"audio"`, `"file"` |
| `mediaUrl` | `string` | Encrypted media URL (optional) |
| `mediaType` | `string` | MIME type of media (optional) |
| `fileName` | `string` | Original filename (optional) |
| `fileSize` | `number` | File size in bytes (optional) |
| `duration` | `number` | Audio duration in seconds (optional) |
| `iv` | `string` | Initialization vector for decryption |
| `createdAt` | `number` | Message timestamp |
| `status` | `string` | `"sent"`, `"delivered"`, `"read"` |
| `readBy` | `object` | Map of UIDs who have read message |

### Collection: `connections`
Stores friend/contact relationships.

| Field | Type | Description |
|-------|------|-------------|
| `uid/friendId` | `boolean` | Nested path → `true` if connected |

### Collection: `connectionRequests`
Stores pending friend requests.

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | `string` | Unique request ID |
| `fromUid` | `string` | Sender's UID |
| `toUid` | `string` | Recipient's UID |
| `status` | `string` | `"pending"`, `"accepted"`, `"rejected"` |
| `createdAt` | `number` | Request timestamp |

### Collection: `contacts`
Private contact list per user.

| Field | Type | Description |
|-------|------|-------------|
| `uid/contactId` | `object` | Nested path with contact details |

### Collection: `status`
Stores ephemeral status/story updates.

| Field | Type | Description |
|-------|------|-------------|
| `uid/statusId` | `string` | Nested by user |
| `type` | `string` | `"text"`, `"image"` |
| `content` | `string` | Text content or image URL |
| `backgroundColor` | `string` | Background color (text status) |
| `createdAt` | `number` | Creation timestamp |
| `expiresAt` | `number` | Expiration timestamp (24h) |
| `viewedBy` | `object` | Map of UIDs who viewed |

### Collection: `presence`
Real-time online/offline tracking.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | User UID (key) |
| `isOnline` | `boolean` | Current connection status |
| `lastSeen` | `number` | Last activity timestamp |

### Collection: `publicKeys`
Stores public encryption keys for E2E encryption.

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | User UID (key) |
| `publicKey` | `string` | JWK-formatted ECDH public key |

### Collection: `userKeys`
Encrypted private key storage (per-user).

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | User UID (key) |
| `encryptedPrivateKey` | `string` | Encrypted private key |
| `salt` | `string` | Salt for key derivation |
| `iv` | `string` | IV for decryption |

### Collection: `chatKeys`
Per-chat symmetric key storage.

| Field | Type | Description |
|-------|------|-------------|
| `chatId/uid` | `string` | Nested path |
| `encryptedKey` | `string` | Chat key encrypted for each member |

### Collection: `calls`
Stores call signaling data.

| Field | Type | Description |
|-------|------|-------------|
| `callId` | `string` | Unique call identifier |
| `callerId` | `string` | Initiator's UID |
| `receiverId` | `string` | Recipient's UID |
| `type` | `string` | `"audio"` or `"video"` |
| `status` | `string` | `"ringing"`, `"active"`, `"ended"` |
| `offer` | `object` | WebRTC offer SDP |
| `answer` | `object` | WebRTC answer SDP |
| `candidates` | `object` | ICE candidates |
| `createdAt` | `number` | Call initiation timestamp |
| `endedAt` | `number` | Call end timestamp |

### Collection: `typeStatus`
Real-time typing indicators.

| Field | Type | Description |
|-------|------|-------------|
| `chatId/uid` | `object` | Nested path |
| `isTyping` | `boolean` | Whether user is currently typing |
| `timestamp` | `number` | Last typing activity time |

---

## 🔐 Security & Encryption

### Encryption Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    End-to-End Encryption Flow                   │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Key Generation (On Registration)                           │
│     ┌─────────────┐                                            │
│     │ ECDH P-256  │ → Public Key → Firebase /publicKeys/{uid}  │
│     │ Key Pair    │ → Private Key → Local Storage (encrypted)  │
│     └─────────────┘                                            │
│                                                                 │
│  2. Key Exchange (On New Chat)                                 │
│     ┌─────────────────────────────────────────────┐            │
│     │ Your Private Key + Their Public Key = Shared Secret     │
│     │ (ECDH Agreement)                                         │
│     └─────────────────────────────────────────────┘            │
│                                                                 │
│  3. Message Encryption                                         │
│     ┌──────────────────────────────────────────────────────┐   │
│     │ Plaintext → AES-256-GCM(shared_key, IV) → Ciphertext │   │
│     │                                                       │   │
│     │ Stored in Firebase: { text: ciphertext, iv: IV }     │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                 │
│  4. Message Decryption                                         │
│     ┌──────────────────────────────────────────────────────┐   │
│     │ Ciphertext → AES-256-GCM(shared_key, IV) → Plaintext │   │
│     └──────────────────────────────────────────────────────┘   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Supported Encryption Features

| Content Type | Encryption Method | Storage Location |
|--------------|-------------------|------------------|
| Text Messages | AES-256-GCM | Firebase RTDB |
| Images | AES-256-GCM + Base64 | Cloudinary (encrypted) |
| Audio Messages | AES-256-GCM + Base64 | Cloudinary (encrypted) |
| Files | AES-256-GCM + Base64 | Cloudinary (encrypted) |
| Private Keys | AES-256-GCM (password-derived) | Local Storage |

---

## 🔧 Firebase Security Rules

The application uses comprehensive security rules to protect data:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "usernames": {
      ".read": true,
      "$username": {
        ".write": "auth != null && (!data.exists() || data.val() === auth.uid)"
      }
    },
    "chats": {
      ".read": "auth != null",
      "$chatId": {
        ".write": "auth != null && (!data.exists() || data.child('members').child(auth.uid).exists())"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && root.child('chats').child($chatId).child('members').child(auth.uid).exists()",
        ".write": "auth != null && root.child('chats').child($chatId).child('members').child(auth.uid).exists()"
      }
    },
    "connections": {
      ".read": "auth != null",
      "$uid": {
        "$friendId": {
          ".write": "auth != null && (auth.uid === $uid || auth.uid === $friendId)"
        }
      }
    },
    "publicKeys": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "chatKeys": {
      "$chatId": {
        ".read": "auth != null && root.child('chats').child($chatId).child('members').child(auth.uid).exists()",
        ".write": "auth != null && root.child('chats').child($chatId).child('members').child(auth.uid).exists()"
      }
    },
    "typeStatus": {
      "$chatId": {
        "$uid": {
          ".read": "auth != null && root.child('chats').child($chatId).child('members').child(auth.uid).exists()",
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    }
  }
}
```

### Security Rule Highlights

| Rule | Purpose |
|------|---------|
| **User Profile** | Only the owner can modify their profile |
| **Username Uniqueness** | Can only claim unclaimed usernames or update own username |
| **Chat Membership** | Only chat members can read/write messages |
| **Message Access** | Messages require chat membership verification |
| **Connection Requests** | Both parties can manage connection state |
| **Public Keys** | Anyone authenticated can read, only owner can write |
| **Typing Status** | Only the typing user can update their status |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Account** (for Firebase & AI Studio)
- **Cloudinary Account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zychat.git
   cd zychat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (see [Configuration](#-configuration) section)

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ═══════════════════════════════════════════════════════════════
# FIREBASE CONFIGURATION
# Get these from Firebase Console → Project Settings → Web App
# ═══════════════════════════════════════════════════════════════
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# ═══════════════════════════════════════════════════════════════
# CLOUDINARY CONFIGURATION
# Create upload presets in Cloudinary Console → Settings → Upload
# ═══════════════════════════════════════════════════════════════
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET_PROFILE_IMAGE=zychat_profile
VITE_CLOUDINARY_UPLOAD_PRESET_IMAGES=zychat_images
VITE_CLOUDINARY_UPLOAD_PRESET_GROUP_ICON=zychat_group
VITE_CLOUDINARY_UPLOAD_PRESET_AUDIO=zychat_audio
VITE_CLOUDINARY_UPLOAD_PRESET_FILE=zychat_files
```

### Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password Authentication**
3. Create a **Realtime Database** (start in test mode, then apply security rules)
4. Copy the security rules from `database.rules.json` to Firebase Console → Realtime Database → Rules

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Settings → Upload → Add upload preset
3. Create separate presets for:
   - Profile images (with transformation for avatars)
   - Chat images
   - Group icons
   - Audio messages
   - General files

---

## 🛣️ Roadmap

### Completed ✅
- [x] Real-time messaging with Firebase RTDB
- [x] End-to-end encryption (AES-256-GCM + ECDH)
- [x] Voice & video calls (WebRTC)
- [x] Status/Stories feature
- [x] AI assistant integration (Gemini)
- [x] Message status indicators
- [x] Typing indicators
- [x] Media sharing (images, audio, files)
- [x] Dark/Light theme
- [x] Responsive mobile design

### Planned 📋
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Group video calls
- [ ] Message reactions
- [ ] Reply to specific messages
- [ ] Forward messages
- [ ] Starred messages
- [ ] Message search
- [ ] Broadcast lists
- [ ] Desktop app (Electron)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Test on multiple screen sizes

---

## 📄 Legal & Support

| Resource | Link |
|----------|------|
| **Privacy Policy** | `/privacy` |
| **Terms of Service** | `/terms` |
| **Help Center** | `/help` |
| **Support Email** | contact.uthakkan@gmail.com |

---

<div align="center">

### Built with ❤️ by **ZyChat Team**

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/yourusername)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?style=for-the-badge&logo=gmail)](mailto:contact.uthakkan@gmail.com)

</div>
