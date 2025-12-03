# 🥛 Vendor Management System

A comprehensive dairy and grocery vendor management system built with React Native (Expo Web) and Firebase. Track customers, manage daily transactions, generate monthly bills, and send notifications - all in a modern, user-friendly interface.

## 🚀 Live Demo

**Try it now:** [https://vendor-management-system-f6278.web.app](https://vendor-management-system-f6278.web.app)

### Quick Start (Live App)
1. Visit the live URL above
2. Choose one of these options:
   - **Create your own account**: Click "New user? Create Account" → Enter email/password → Create Account
   - **Use demo data**: Click "Seed Database (Demo)" → Login with `vendor@test.com` / `test123`
3. Start managing your vendor business!

> **Note**: The live app uses production Firebase - all data is real and persistent!

---

## 📋 Features

- **Vendor Authentication**: Email/password login with Firebase Auth
- **User Signup**: Create new accounts with automatic vendor profile setup
- **Customer Management**: Add, view, and manage customers with contact details
- **Transaction Tracking**: Record daily sales transactions with date and amount
- **Bill Generation**: Automatically calculate monthly bills from unpaid transactions (client-side)
- **WhatsApp Mock**: Simulate sending bills via WhatsApp (logs message and saves to Firestore)
- **Dashboard**: View total sales summary and quick navigation
- **Database Seeding**: One-click demo data creation for testing

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo) - Web version
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Local Development**: Firebase Emulator Suite

## 📁 Project Structure

```
vendor-management-system/
├── app/                          # Expo React Native app
│   ├── src/
│   │   ├── screens/              # Screen components
│   │   │   ├── LoginScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── CustomersScreen.js
│   │   │   └── TransactionsScreen.js
│   │   ├── services/             # Firebase & API services
│   │   │   ├── firebase.js
│   │   │   └── api.js
│   │   └── utils/
│   │       └── seedData.js       # Database seeding
│   ├── App.js
│   └── package.json
├── functions/                    # Firebase Cloud Functions (legacy)
│   └── src/index.js
├── firebase.json                 # Firebase config
├── firestore.rules              # Security rules
└── README.md
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Firebase CLI** (for local development) - Install with: `npm install -g firebase-tools`
- **Git** (optional but recommended)

## 🚀 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Bhavesh1506/vendor-management-system.git
cd vendor-management-system
```

### Step 2: Install Dependencies

```powershell
# Install App dependencies
cd app
npm install
cd ..

# Install Functions dependencies (optional - for local emulator testing)
cd functions
npm install
cd ..
```

### Step 3: Start Firebase Emulator Suite (Optional)

If you want to test locally with emulators instead of production Firebase:

```powershell
firebase emulators:start --only firestore,auth
```

This will start:
- 🔥 Firestore Emulator on `localhost:8080`
- 🔐 Auth Emulator on `localhost:9099`
- 🎛️ Emulator UI on `localhost:4000`

**Keep this terminal running!**

### Step 4: Start Expo Web

Open a **new terminal** and run:

```powershell
cd app
npm start
```

When prompted, press **`w`** to open in web browser.

## 📱 Using the Application

### Option 1: Use the Live App (Recommended)

Simply visit [https://vendor-management-system-f6278.web.app](https://vendor-management-system-f6278.web.app) - no setup required!

### Option 2: Create Your Own Account

1. Click **"New user? Create Account"**
2. Enter your email and password
3. Click **"Create Account"**
4. Login and start adding customers and transactions

### Option 3: Use Demo Data

1. Click **"🌱 Seed Database (Demo)"**
2. Login with: `vendor@test.com` / `test123`
3. Explore pre-populated data

### Application Features

1. **Dashboard**: View total sales and navigate to features
2. **Customers**: 
   - View list of all customers
   - Click "+" button to add new customers
   - Click on a customer to view their transactions
3. **Transactions** (Customer Detail):
   - View all transactions for a customer
   - Add new transactions with "+" Add button
   - See unpaid amount summary
4. **Generate Bill**:
   - Click "📊 Generate Bill" to create a monthly bill
   - Automatically calculates total unpaid transactions
   - Marks transactions as paid
5. **Send WhatsApp Mock**:
   - Click "📱 Send via WhatsApp"
   - View mock message in browser alert
   - Check Firestore for notification document

## 📊 Data Model

### Vendors Collection
```javascript
{
  email: string,
  businessName: string,
  createdAt: timestamp
}
```

### Customers Subcollection
```javascript
{
  name: string,
  phone: string,
  createdAt: timestamp
}
```

### Transactions Subcollection
```javascript
{
  customerId: string,
  itemName: string,
  amount: number,
  date: timestamp,
  isPaid: boolean,
  billId: string (optional)
}
```

### Bills Subcollection
```javascript
{
  customerId: string,
  customerName: string,
  customerPhone: string,
  totalAmount: number,
  transactionCount: number,
  transactionIds: array,
  billingMonth: string (YYYY-MM),
  createdAt: timestamp,
  isPaid: boolean
}
```

### Notifications Subcollection
```javascript
{
  billId: string,
  customerId: string,
  customerName: string,
  customerPhone: string,
  message: string,
  type: "whatsapp_mock",
  sentAt: timestamp,
  status: "mock_sent"
}
```

## 🎨 UI Design

The app features a **modern, premium dark theme** with:
- 🌑 Dark slate background (`#0f172a`, `#1e293b`)
- 💜 Vibrant indigo accents (`#6366f1`)
- ✨ Smooth gradients and shadows
- 🎯 Clean, card-based layouts
- 📱 Responsive design (works on mobile and desktop)

## 🐛 Known Limitations

### Scrolling on Web
The transactions list may not scroll properly on some web browsers due to React Native Web limitations.

**Workaround**: Run this in browser console if needed:
```javascript
document.querySelector('[data-focusable="true"]').style.height = '100vh';
document.querySelector('[data-focusable="true"]').style.overflow = 'auto';
```

**Note**: This would be resolved by deploying as a native mobile app (Android/iOS).

## 🔐 Security Notes

**Current Setup**: Database is in "test mode" for easy development access.

**For Production**: Update Firestore security rules in Firebase Console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /vendors/{vendorId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == vendorId;
    }
  }
}
```

## 🚢 Deployment

The app is automatically deployed to Firebase Hosting. To deploy updates:

```powershell
# Build the web version
cd app
npx expo export -p web

# Deploy to Firebase
cd ..
firebase deploy --only hosting
```

Your changes will be live at: https://vendor-management-system-f6278.web.app

## 🎓 Learning Objectives

This project demonstrates:
- ✅ Firebase Authentication with signup/login
- ✅ Firestore database design and queries
- ✅ Client-side business logic (bill generation)
- ✅ React Native navigation
- ✅ State management in React
- ✅ Modern UI/UX design
- ✅ Firebase Hosting deployment
- ✅ Full-stack integration

## 📝 Project Links

- **Live App**: https://vendor-management-system-f6278.web.app
- **GitHub Repository**: https://github.com/Bhavesh1506/vendor-management-system
- **Firebase Console**: https://console.firebase.google.com/project/vendor-management-system-f6278

