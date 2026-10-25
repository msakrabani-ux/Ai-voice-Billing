# MS SAKRA AI Voice Billing System - Walkthrough

The MS SAKRA AI Voice Billing System has been successfully initialized and implemented! It features a futuristic, glassmorphism POS interface with AI-driven voice item recognition, complete product management, and full local persistence.

## Architecture & Tech Stack

- **Frontend**: React 19 (via Vite), Tailwind CSS v4, Framer Motion, Zustand, and React Router.
- **Backend**: Node.js, Express, and SQLite3.
- **Capabilities**: Bilingual Web Speech API (English `en-IN` & Tamil `ta-IN`), jsPDF generation, and custom NLP parsing.

## Key Features Implemented

### 1. The Futuristic Glassmorphism UI
The app uses a dark theme with deep translucent backgrounds (`backdrop-filter: blur(12px)`). It utilizes a curated neon palette (`#00f3ff` Blue and `#bd00ff` Purple) across buttons, text, and interactions. We utilized the Google font `Outfit`. 

### 2. Full Product Management
A complete CRUD interface at `/products` allows you to manage inventory. 
- You can add, edit, and delete products. 
- Products are stored locally in the SQLite database and served via REST API.

### 3. Smart Voice POS Billing Screen
The crown jewel of the application lives at `/pos`.
- **Animated Microphone Button**: Glows and pulses using Framer Motion when listening.
- **Dual Language Support**: You can seamlessly toggle between Tamil and English.
- **Live NLP Parser**: As you speak (e.g. *"இரண்டு சோப்பு"* or *"one rice"*), our custom NLP logic intercepts the transcript, detects matching quantities and products from the database, and adds them directly to the billing table.
- **Manual Overrides**: You can manually add products via a dropdown and increment/decrement quantities using the standard controls.

### 4. Billing, Print & PDF Export
- Auto-calculates total amount, subtotal, and GST (5%).
- **PDF Export**: Generates an A4 summary invoice using `jsPDF`.
- **Print**: Styled with basic `@media print` to optimize for thermal printing from the browser's native print dialog.

## How to Run Locally

You need two separate terminal windows to run both services.

**1. Start the Backend**
```bash
cd backend
npm run dev
# OR: node index.js
```
The server will start on `http://localhost:5000` and automatically create the SQLite database `ms_sakra.db`.

**2. Start the Frontend**
```bash
cd frontend
npm run dev
```
Vite will serve the app on `http://localhost:5173`. 

> [!NOTE]
> The Web Speech API requires microphone permissions. Make sure to allow microphone access in your browser when clicking the Voice button on the POS screen. Chrome is highly recommended for the best bilingual support.
