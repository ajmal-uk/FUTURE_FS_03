# ZyChat - Fast, Secure, Real-Time Chat Application

![ZyChat Banner](/Users/uk/.gemini/antigravity/brain/1cb85ff7-51a4-4d19-80d1-f17144c8bb54/landing_page_mockup_1765274935505.png)

A modern, production-grade real-time messaging platform built with React and Firebase. ZyChat combines the familiarity of WhatsApp with advanced features like AI assistance, end-to-end encryption, and high-quality voice/video calls.

---

## 🚀 Key Features

### 💬 Real-Time Communication
- **Instant Messaging**: One-on-one and group chats with real-time delivery.
- **Rich Media**: Send high-quality images, audio messages (with waveform), and files.
- **Voice & Video Calls**: Crystal clear calls powered by WebRTC.
- **Status Updates**: Share 24-hour disappearing stories just like WhatsApp.

### 🤖 ZyBot AI Assistant
- **Smart Conversations**: Integrated with Google Gemini Pro API.
- **Privacy-First**: Bring Your Own Key (BYOK) architecture - your API key is stored locally.
- **Agent Capabilities**: Set reminders, schedule messages, and get context-aware help.

### 🔒 Privacy & Security
- **End-to-End Encryption**: AES-256-GCM encryption for messages and all media types.
- **Secure Key Exchange**: ECDH (Elliptic Curve Diffie-Hellman) for secure key derivation.
- **Friend Requests**: Unique connection system ensures you only chat with people you know.

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Sleek, modern aesthetic with dark/light mode support.
- **Responsive**: Fully optimized for desktop, tablet, and mobile devices.
- **Animations**: Smooth transitions and micro-interactions.

---

## 📸 Screenshots

### Web Interface
![Web Chat Interface](/Users/uk/.gemini/antigravity/brain/1cb85ff7-51a4-4d19-80d1-f17144c8bb54/chat_interface_mockup_1765274957473.png)
*Full-featured web interface with dark mode and glassmorphism styling.*

### Mobile Experience
![Mobile Chat](/Users/uk/.gemini/antigravity/brain/1cb85ff7-51a4-4d19-80d1-f17144c8bb54/mobile_chat_mockup_1765274982748.png)
*Responsive mobile design ensuring a seamless experience on any device.*

---

## 🛠️ Architecture & Database Schema

ZyChat uses **Firebase Realtime Database (RTDB)** for low-latency data synchronization and **Cloudinary** for scalable media storage.

### 📂 Collections Structure

```json
{
  "users": {
    "uid": {
      "displayName": "User Name",
      "username": "unique_username",
      "avatarUrl": "https://...",
      "publicKey": "ECDH_Public_Key",
      "isOnline": true,
      "lastSeen": 1715432100000
    }
  },
  
  "chats": {
    "chatId": {
      "type": "direct | group",
      "members": { "uid1": true, "uid2": true },
      "lastMessage": { "text": "Hello", "timestamp": ... },
      "encryptionKey": "Encrypted_Chat_Key"
    }
  },
  
  "messages": {
    "chatId": {
      "messageId": {
        "text": "Encrypted_Ciphertext",
        "senderId": "uid",
        "type": "text | image | audio | file",
        "mediaUrl": "Encrypted_URL",
        "iv": "Initialization_Vector",
        "createdAt": 1715432100000
      }
    }
  },
  
  "connections": {
    "uid": {
      "friendId": true
    }
  },
  
  "connectionRequests": {
    "incoming": { "uid": { "senderId": "pending" } },
    "outgoing": { "uid": { "recipientId": "pending" } }
  }
}
```

### 🔐 Security Rules
Robust Firebase Security Rules (`database.rules.json`) ensure:
- **Read Access**: Only members of a chat can read its messages.
- **Write Access**: Strict validation prevents unauthorized modifications.
- **Friendship**: Users can only chat if they are connected.

---

## 💻 Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Native CSS Variables, Responsive Flexbox/Grid
- **Routing**: React Router v6
- **State Management**: React Context API
- **Backend (BaaS)**: Firebase (Auth, RTDB)
- **Media**: Cloudinary (Unsigned Uploads)
- **Video/Audio**: WebRTC (Mesh Topology)
- **Encryption**: Web Crypto API (SubtleCrypto)
- **AI**: Google Gemini API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Google Account (for Firebase & AI Studio)
- Cloudinary Account

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
   Create a `.env` file in the root directory:
   ```env
   # Firebase Config
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Cloudinary Config
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET_PROFILE_IMAGE=profile_preset
   VITE_CLOUDINARY_UPLOAD_PRESET_IMAGES=images_preset
   VITE_CLOUDINARY_UPLOAD_PRESET_GROUP_ICON=group_preset
   VITE_CLOUDINARY_UPLOAD_PRESET_AUDIO=audio_preset
   VITE_CLOUDINARY_UPLOAD_PRESET_FILE=file_preset
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📄 Legal & Support

- **Privacy Policy**: `/privacy`
- **Terms of Service**: `/terms`
- **Help Center**: `/help`
- **Support Email**: `contact.uthakkan@gmail.com`

---

Built with ❤️ by **ZyChat Team**
