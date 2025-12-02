const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Generate Bill Cloud Function
 * Calculates the total amount of unpaid transactions for a customer
 * for the current month and creates a bill document.
 */
exports.generateBill = functions.https.onCall(async (data, context) => {
  const { vendorId, customerId } = data;

  console.log('📝 [GenerateBill] Request Received:', data);

  if (!vendorId || !customerId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing vendorId or customerId'
    );
  }

  try {
    const db = admin.firestore();

    // Get current month start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`🔎 Searching for transactions between ${monthStart.toISOString()} and ${monthEnd.toISOString()}`);

    // Query unpaid transactions for this customer in current month
    const transactionsRef = db
      .collection(`vendors/${vendorId}/transactions`)
      .where('customerId', '==', customerId)
      .where('isPaid', '==', false)
      .where('date', '>=', admin.firestore.Timestamp.fromMillis(monthStart.getTime()))
      .where('date', '<=', admin.firestore.Timestamp.fromMillis(monthEnd.getTime()));

    const snapshot = await transactionsRef.get();

    console.log(`🔎 Found ${snapshot.size} unpaid transactions.`);

    if (snapshot.empty) {
      throw new functions.https.HttpsError(
        'not-found',
        'No unpaid transactions found for this customer this month'
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    const transactionIds = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalAmount += data.amount;
      transactionIds.push(doc.id);
    });

    // Get customer details
    const customerDoc = await db
      .doc(`vendors/${vendorId}/customers/${customerId}`)
      .get();

    if (!customerDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Customer not found');
    }

    const customerData = customerDoc.data();

    // Create bill document
    const billRef = db.collection(`vendors/${vendorId}/bills`).doc();
    const billData = {
      customerId: customerId,
      customerName: customerData.name,
      customerPhone: customerData.phone,
      totalAmount: totalAmount,
      transactionCount: transactionIds.length,
      transactionIds: transactionIds,
      billingMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isPaid: false,
    };

    await billRef.set(billData);

    // Mark all transactions as paid
    const batch = db.batch();
    transactionIds.forEach((txnId) => {
      const txnRef = db.doc(`vendors/${vendorId}/transactions/${txnId}`);
      batch.update(txnRef, { isPaid: true, billId: billRef.id });
    });
    await batch.commit();

    console.log(
      `✅ Bill generated: ${billRef.id} for customer ${customerData.name} - ₹${totalAmount}`
    );

    return {
      success: true,
      billId: billRef.id,
      totalAmount: totalAmount,
      transactionCount: transactionIds.length,
      customerName: customerData.name,
    };
  } catch (error) {
    console.error('❌ Error generating bill:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Send WhatsApp Mock Function
 * Mocks sending a WhatsApp message by logging to console
 * and creating a notification document in Firestore.
 */
exports.sendWhatsApp = functions.https.onCall(async (data, context) => {
  const { vendorId, billId } = data;

  console.log('📱 [SendWhatsApp] Request Received:', data);

  if (!vendorId || !billId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing vendorId or billId'
    );
  }

  try {
    const db = admin.firestore();

    // Get bill details
    const billDoc = await db.doc(`vendors/${vendorId}/bills/${billId}`).get();

    if (!billDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Bill not found');
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
    const notificationRef = db
      .collection(`vendors/${vendorId}/notifications`)
      .doc();

    await notificationRef.set({
      billId: billId,
      customerId: billData.customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      message: message,
      type: 'whatsapp_mock',
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'mock_sent',
    });

    console.log(`✅ Notification saved: ${notificationRef.id}`);

    return {
      success: true,
      message: 'Mock WhatsApp sent successfully',
      notificationId: notificationRef.id,
      phoneNumber: customerPhone,
    };
  } catch (error) {
    console.error('❌ Error sending WhatsApp mock:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
