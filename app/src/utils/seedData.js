import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

/**
 * Seed the database with dummy data
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create vendor user (vendor@test.com / test123)
    let vendorId;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'vendor@test.com',
        'test123'
      );
      vendorId = userCredential.user.uid;
      console.log('✅ Vendor user created:', vendorId);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️ Vendor already exists, using existing user');
        // You'll need to sign in to get the UID
        return { 
          success: false, 
          message: 'Vendor already exists. Please login instead.' 
        };
      }
      throw error;
    }

    // Create vendor document
    await setDoc(doc(db, 'vendors', vendorId), {
      email: 'vendor@test.com',
      name: 'Demo Dairy Shop',
      createdAt: Timestamp.now()
    });
    console.log('✅ Vendor document created');

    // Create 2 customers
    const customer1Ref = await addDoc(collection(db, `vendors/${vendorId}/customers`), {
      name: 'Rajesh Kumar',
      phone: '9876543210',
      createdAt: Timestamp.now()
    });
    console.log('✅ Customer 1 created:', customer1Ref.id);

    const customer2Ref = await addDoc(collection(db, `vendors/${vendorId}/customers`), {
      name: 'Priya Sharma',
      phone: '9876543211',
      createdAt: Timestamp.now()
    });
    console.log('✅ Customer 2 created:', customer2Ref.id);

    // Create 5 transactions (3 for Rajesh, 2 for Priya)
    const now = new Date();
    
    // Transactions for Rajesh Kumar (current month)
    await addDoc(collection(db, `vendors/${vendorId}/transactions`), {
      customerId: customer1Ref.id,
      itemName: 'Milk (2L)',
      amount: 100,
      date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 5)),
      isPaid: false,
      createdAt: Timestamp.now()
    });

    await addDoc(collection(db, `vendors/${vendorId}/transactions`), {
      customerId: customer1Ref.id,
      itemName: 'Eggs (12)',
      amount: 80,
      date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 12)),
      isPaid: false,
      createdAt: Timestamp.now()
    });

    await addDoc(collection(db, `vendors/${vendorId}/transactions`), {
      customerId: customer1Ref.id,
      itemName: 'Bread',
      amount: 40,
      date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 18)),
      isPaid: false,
      createdAt: Timestamp.now()
    });
    console.log('✅ 3 transactions created for Rajesh Kumar');

    // Transactions for Priya Sharma (current month)
    await addDoc(collection(db, `vendors/${vendorId}/transactions`), {
      customerId: customer2Ref.id,
      itemName: 'Milk (1L)',
      amount: 50,
      date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 8)),
      isPaid: false,
      createdAt: Timestamp.now()
    });

    await addDoc(collection(db, `vendors/${vendorId}/transactions`), {
      customerId: customer2Ref.id,
      itemName: 'Butter',
      amount: 120,
      date: Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 15)),
      isPaid: false,
      createdAt: Timestamp.now()
    });
    console.log('✅ 2 transactions created for Priya Sharma');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Login with: vendor@test.com');
    console.log('🔑 Password: test123');

    return {
      success: true,
      vendorId,
      message: 'Database seeded successfully! You can now login.'
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
