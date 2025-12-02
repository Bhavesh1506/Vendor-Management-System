import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView, // Changed back to ScrollView for reliable web scrolling
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "../services/firebase";
import {
  getTransactions,
  addTransaction,
  generateBillClientSide,
  sendWhatsAppMock,
} from "../services/api";
import { Timestamp } from "firebase/firestore";

export default function TransactionsScreen({ route, navigation }) {
  const { customerId, customerName, customerPhone } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    itemName: "",
    amount: "",
    date: new Date(),
  });
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [latestBillId, setLatestBillId] = useState(null);
  const vendorId = auth.currentUser?.uid;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!vendorId) return;

    setLoading(true);
    try {
      const txnData = await getTransactions(vendorId, customerId);
      setTransactions(
        txnData.sort((a, b) => b.date?.toDate() - a.date?.toDate())
      );
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.itemName || !newTransaction.amount) {
      Alert.alert("Error", "Please enter item name and amount");
      return;
    }

    try {
      const txnData = {
        customerId,
        itemName: newTransaction.itemName,
        amount: parseFloat(newTransaction.amount),
        date: Timestamp.fromDate(newTransaction.date),
      };

      await addTransaction(vendorId, txnData);
      setModalVisible(false);
      setNewTransaction({ itemName: "", amount: "", date: new Date() });
      loadData();
      Alert.alert("Success", "Transaction added successfully!");
    } catch (error) {
      console.error("Error adding transaction:", error);
      Alert.alert("Error", "Failed to add transaction");
    }
  };

  const handleGenerateBill = async () => {
    setGenerating(true);
    try {
      const result = await generateBillClientSide(vendorId, customerId);
      setLatestBillId(result.billId);
      loadData();

      const message =
        `Bill Generated! 🎉\n\n` +
        `Bill ID: ${result.billId}\n` +
        `Customer: ${result.customerName}\n` +
        `Total Amount: ₹${result.totalAmount}\n` +
        `Transactions: ${result.transactionCount}\n\n` +
        `You can now send this bill via WhatsApp.`;

      window.alert(message);
    } catch (error) {
      console.error("Error generating bill:", error);
      window.alert("Error: " + (error.message || "Failed."));
    } finally {
      setGenerating(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!latestBillId) {
      window.alert("Error: Please generate a bill first");
      return;
    }
    setSending(true);
    try {
      const result = await sendWhatsAppMock(vendorId, latestBillId);
      const message =
        `WhatsApp Mock Sent! 📱\n\n` +
        `Phone: ${result.phoneNumber}\n\n` +
        `Message:\n${result.fullMessage}`;
      window.alert(message);
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      window.alert("Error: Failed to send WhatsApp mock");
    } finally {
      setSending(false);
    }
  };

  const unpaidTotal = transactions
    .filter((t) => !t.isPaid)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. ScrollView wraps EVERYTHING except the Modal */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }} // Ensures bottom items aren't cut off
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>
              {customerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerPhone}>📱 {customerPhone}</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Unpaid Amount</Text>
          <Text style={styles.summaryValue}>₹{unpaidTotal.toFixed(2)}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.generateButton,
              generating && styles.buttonDisabled,
            ]}
            onPress={handleGenerateBill}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>📊</Text>
                <Text style={styles.actionButtonText}>Generate Bill</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.whatsappButton,
              sending && styles.buttonDisabled,
            ]}
            onPress={handleSendWhatsApp}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.actionButtonIcon}>📱</Text>
                <Text style={styles.actionButtonText}>Send via WhatsApp</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Transactions List Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions Loop (using .map for simplicity inside ScrollView) */}
        <View style={styles.list}>
          {transactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((item) => (
              <View key={item.id} style={styles.transactionCard}>
                <View style={styles.transactionContent}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.transactionDate}>
                    {item.date?.toDate().toLocaleDateString("en-IN")}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={styles.amount}>₹{item.amount}</Text>
                  {item.isPaid && (
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidText}>PAID</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal is OUTSIDE the ScrollView */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Transaction</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Milk (2L)"
                value={newTransaction.itemName}
                onChangeText={(text) =>
                  setNewTransaction({ ...newTransaction, itemName: text })
                }
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                value={newTransaction.amount}
                onChangeText={(text) =>
                  setNewTransaction({ ...newTransaction, amount: text })
                }
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.dateDisplay}>
                <Text style={styles.dateText}>
                  {newTransaction.date.toLocaleDateString("en-IN")}
                </Text>
              </View>
              <Text style={styles.dateNote}>Using today's date</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewTransaction({
                    itemName: "",
                    amount: "",
                    date: new Date(),
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddTransaction}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the whole page is full height
    backgroundColor: "#0f172a",
  },
  scrollView: {
    flex: 1, // Allows the scrollview to fill the container
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    fontSize: 18,
    color: "#6366f1",
    fontWeight: "600",
  },
  customerHeader: {
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  customerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  customerAvatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  customerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 16,
    color: "#94a3b8",
  },
  summaryCard: {
    backgroundColor: "#10b981",
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#d1fae5",
    fontWeight: "600",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: "#6366f1",
  },
  whatsappButton: {
    backgroundColor: "#059669",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  addText: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 20,
    // No padding bottom here, handled by ScrollView contentContainerStyle
  },
  transactionCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  transactionContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: "#94a3b8",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#10b981",
    marginBottom: 4,
  },
  paidBadge: {
    backgroundColor: "#334155",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paidText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#94a3b8",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#475569",
  },
  dateDisplay: {
    backgroundColor: "#334155",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#475569",
  },
  dateText: {
    fontSize: 16,
    color: "#fff",
  },
  dateNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#334155",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: "#6366f1",
    marginLeft: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
