import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

/**
 * Add a new customer
 */
export const addCustomer = async (vendorId, customerData) => {
  try {
    const customersRef = collection(db, `vendors/${vendorId}/customers`);
    const docRef = await addDoc(customersRef, {
      ...customerData,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...customerData };
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

/**
 * Get all customers for a vendor
 */
export const getCustomers = async (vendorId) => {
  try {
    const customersRef = collection(db, `vendors/${vendorId}/customers`);
    const snapshot = await getDocs(customersRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting customers:', error);
    throw error;
  }
};

/**
 * Add a new transaction
 */
export const addTransaction = async (vendorId, transactionData) => {
  try {
    const transactionsRef = collection(db, `vendors/${vendorId}/transactions`);
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      isPaid: false,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...transactionData };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

/**
 * Get all transactions for a customer
 */
export const getTransactions = async (vendorId, customerId) => {
  try {
    const transactionsRef = collection(db, `vendors/${vendorId}/transactions`);
    const q = query(transactionsRef, where('customerId', '==', customerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

/**
 * Get all transactions for a vendor (for total sales calculation)
 */
export const getAllTransactions = async (vendorId) => {
  try {
    const transactionsRef = collection(db, `vendors/${vendorId}/transactions`);
    const snapshot = await getDocs(transactionsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

/**
 * Generate bill client-side (no Cloud Functions needed!)
 */
export const generateBillClientSide = async (vendorId, customerId) => {
  try {
    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`🔎 Searching for unpaid transactions in ${now.getMonth() + 1}/${now.getFullYear()}`);

    // Get all transactions for this customer
    const transactionsRef = collection(db, `vendors/${vendorId}/transactions`);
    const q = query(
      transactionsRef, 
      where('customerId', '==', customerId),
      where('isPaid', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    // Filter by current month (client-side filtering)
    const unpaidTransactions = [];
    let totalAmount = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const txnDate = data.date?.toDate();
      
      // Check if transaction is in current month
      if (txnDate && txnDate >= monthStart && txnDate <= monthEnd) {
        unpaidTransactions.push({
          id: doc.id,
          ...data
        });
        totalAmount += data.amount || 0;
      }
    });

    if (unpaidTransactions.length === 0) {
      throw new Error('No unpaid transactions found for this month');
    }

    // Get customer details
    const customerDoc = await getDoc(doc(db, `vendors/${vendorId}/customers/${customerId}`));
    if (!customerDoc.exists()) {
      throw new Error('Customer not found');
    }
    const customerData = customerDoc.data();

    // Create bill document
    const billsRef = collection(db, `vendors/${vendorId}/bills`);
    const billData = {
      customerId: customerId,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      totalAmount: totalAmount,
      transactionCount: unpaidTransactions.length,
      transactionIds: unpaidTransactions.map(t => t.id),
      billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      createdAt: Timestamp.now(),
      isPaid: false,
    };

    const billDocRef = await addDoc(billsRef, billData);

    // Mark transactions as paid
    for (const txn of unpaidTransactions) {
      const txnDocRef = doc(db, `vendors/${vendorId}/transactions/${txn.id}`);
      await updateDoc(txnDocRef, { 
        isPaid: true, 
        billId: billDocRef.id 
      });
    }

    console.log(`✅ Bill generated: ${billDocRef.id} - ₹${totalAmount}`);

    return {
      success: true,
      billId: billDocRef.id,
      totalAmount: totalAmount,
      transactionCount: unpaidTransactions.length,
      customerName: customerData.name,
    };
  } catch (error) {
    console.error('Error generating bill:', error);
    throw error;
  }
};

/**
 * Send WhatsApp Mock (client-side)
 */
export const sendWhatsAppMock = async (vendorId, billId) => {
  try {
    // Get bill details
    const billDoc = await getDoc(doc(db, `vendors/${vendorId}/bills/${billId}`));
    
    if (!billDoc.exists()) {
      throw new Error('Bill not found');
    }

    const billData = billDoc.data();
    const { customerName, customerPhone, totalAmount, billingMonth } = billData;

    // Create mock WhatsApp message
    const message = 
      `Hello ${customerName},\n\n` +
      `Your monthly bill for ${billingMonth} is ready.\n` +
      `Total Amount: ₹${totalAmount}\n\n` +
      `Please pay at your earliest convenience.\n\n` +
      `Thank you for your business!`;

    // Log to console (Mock WhatsApp send)
    console.log('📱 ============ MOCK WHATSAPP MESSAGE ============');
    console.log(`Sending bill ${billId} to ${customerPhone}...`);
    console.log('Message Content:');
    console.log(message);
    console.log('================================================');

    // Save notification to Firestore
    const notificationsRef = collection(db, `vendors/${vendorId}/notifications`);
    const notificationData = {
      billId: billId,
      customerId: billData.customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      message: message,
      type: 'whatsapp_mock',
      sentAt: Timestamp.now(),
      status: 'mock_sent',
    };

    const notificationDocRef = await addDoc(notificationsRef, notificationData);

    console.log(`✅ Notification saved: ${notificationDocRef.id}`);

    return {
      success: true,
      message: 'Mock WhatsApp sent successfully',
      notificationId: notificationDocRef.id,
      phoneNumber: customerPhone,
      fullMessage: message,
    };
  } catch (error) {
    console.error('Error sending WhatsApp mock:', error);
    throw error;
  }
};
