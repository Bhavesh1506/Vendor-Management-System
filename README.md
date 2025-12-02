# 🥛 Dairy & Grocery Vendor Management System

A complete MVP for managing dairy and grocery vendor operations including customer management, transaction tracking, bill generation, and WhatsApp notifications (mocked for local development).

## 📋 Features

- **Vendor Authentication**: Email/password login with Firebase Auth
- **Customer Management**: Add, view, and manage customers with contact details
- **Transaction Tracking**: Record daily sales transactions with date and amount
- **Bill Generation**: Automatically calculate monthly bills from unpaid transactions via Cloud Function
- **WhatsApp Mock**: Simulate sending bills via WhatsApp (logs to console and Firestore)
- **Dashboard**: View total sales summary and quick navigation
- **Database Seeding**: One-click demo data creation for testing

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo) - Web version
- **Backend**: Firebase Cloud Functions
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
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
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   └── index.js             # generateBill & sendWhatsApp functions
│   └── package.json
├── firebase.json                 # Firebase config
├── firestore.rules              # Security rules
└── README.md
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Firebase CLI** - Install with: `npm install -g firebase-tools`
- **Git** (optional but recommended)

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```powershell
# Navigate to project root
cd vendor-management-system

# Install Cloud Functions dependencies
cd functions
npm install
cd ..

# Install App dependencies
cd app
npm install
cd ..
```

### Step 2: Start Firebase Emulator Suite

Open a terminal in the project root and run:

```powershell
firebase emulators:start
```

This will start:
- 🔥 Firestore Emulator on `localhost:8080`
- 🔐 Auth Emulator on `localhost:9099`
- ⚡ Functions Emulator on `localhost:5001`
- 🎛️ Emulator UI on `localhost:4000`

**Keep this terminal running!**

### Step 3: Start Expo Web (in a new terminal)

Open a **new terminal window/tab** and run:

```powershell
cd app
npm start
```

When prompted, press **`w`** to open in web browser.

The app will open at `http://localhost:8081` (or similar).

## 📱 Using the Application

### First Time Setup: Seed the Database

1. On the login screen, click **"🌱 Seed Database (Demo)"**
2. Wait for the success message
3. The form will auto-fill with credentials:
   - **Email**: `vendor@test.com`
   - **Password**: `test123`

### Login

Click **"Login"** to access the vendor dashboard.

### Demo Data Created

The seeding creates:
- ✅ 1 Vendor account
- ✅ 2 Customers (Rajesh Kumar, Priya Sharma)
- ✅ 5 Transactions across both customers (current month)

### Using the App

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
   - Cloud Function calculates total unpaid transactions
   - Marks transactions as paid
5. **Send WhatsApp Mock**:
   - Click "📱 Send via WhatsApp"
   - Check browser console for mock message
   - Check Firestore UI at `localhost:4000` to see notification document

## 🔍 Viewing Data in Firebase Emulator

1. Open your browser to `http://localhost:4000`
2. Navigate to **Firestore** tab
3. Explore the data structure:
   ```
   vendors/{vendorId}
   vendors/{vendorId}/customers/{customerId}
   vendors/{vendorId}/transactions/{transactionId}
   vendors/{vendorId}/bills/{billId}
   vendors/{vendorId}/notifications/{notificationId}
   ```

## 📊 Data Model

### Vendors Collection
```javascript
{
  email: string,
  name: string,
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

## ⚙️ Cloud Functions

### `generateBill`
**Callable Function**
- **Input**: `{ vendorId, customerId }`
- **Logic**: Queries unpaid transactions for current month, creates bill, marks transactions as paid
- **Returns**: `{ billId, totalAmount, transactionCount, customerName }`

### `sendWhatsApp`
**Callable Function** (Mock Implementation)
- **Input**: `{ vendorId, billId }`
- **Logic**: Fetches bill data, logs to console, creates notification document
- **Returns**: `{ success: true, message, notificationId, phoneNumber }`

## 🧪 Testing the Complete Flow

1. **Login** with `vendor@test.com` / `test123`
2. Navigate to **Customers**
3. Click on **"Rajesh Kumar"**
4. Verify you see 3 transactions (all unpaid)
5. Click **"📊 Generate Bill"**
6. Verify:
   - Success alert shows bill details
   - Transactions now show "PAID" badge
   - Bill document created in Firestore (check emulator UI)
7. Click **"📱 Send via WhatsApp"**
8. Verify:
   - Success alert appears
   - Console shows mock message
   - Notification document in Firestore

## 🎨 UI Design

The app features a **modern, premium dark theme** with:
- 🌑 Dark slate background (`#0f172a`, `#1e293b`)
- 💜 Vibrant indigo accents (`#6366f1`)
- ✨ Smooth gradients and shadows
- 🎯 Clean, card-based layouts
- 📱 Responsive design (works on mobile and desktop)

## 🐛 Troubleshooting

### Firebase Emulator won't start
- Make sure no other process is using ports 4000, 5001, 8080, or 9099
- Try: `firebase emulators:start --only firestore,auth,functions`

### Expo won't connect to emulators
- Ensure emulators are running **before** starting Expo
- Check that `localhost` URLs are correct in `src/services/firebase.js`
- For web, `localhost` works fine
- For mobile, you may need to use your computer's IP address

### "Seeding already done" error
- The vendor email already exists in Auth emulator
- Restart emulators to clear data: `Ctrl+C` then `firebase emulators:start` again

### Transactions not showing in bill
- Bills only include **unpaid** transactions from the **current month**
- Check transaction dates are within current month
- Verify `isPaid: false` in Firestore

## 📝 Notes

- **This is a student project** - Not production-ready
- **WhatsApp is mocked** - No actual messages are sent
- **No real API keys required** - Everything runs locally
- **Data persists** only while emulators are running
- For production, you'd need:
  - Real Firebase project
  - WhatsApp Business API integration
  - Proper security rules
  - Error handling improvements

## 🎓 Learning Objectives

This project demonstrates:
- ✅ Firebase Authentication with emulators
- ✅ Firestore database design and queries
- ✅ Cloud Functions (callable functions)
- ✅ React Native navigation
- ✅ State management in React
- ✅ Modern UI/UX design
- ✅ Full-stack integration

## 📄 License

This is a student project for educational purposes.

---

**Built with ❤️ for learning Firebase + React Native**

Need help? Check the Firebase Emulator UI at `http://localhost:4000` to inspect your data!
