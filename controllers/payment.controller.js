const { ref, set, get, push, update, remove } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

const today = (() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
})();


const deletePayment = async (req, res) => {
  try {
    const { paymentDate, paymentId, customerId, paymentValue } = req.body;

    if (!paymentDate || !paymentId || !customerId || !paymentValue) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const customerRef = ref(database, `customer/${customerId}`);
    const customerSnapshot = await get(customerRef);

    if (!customerSnapshot.exists()) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const customerData = customerSnapshot.val();
    const currentBalance = Number(customerData.balance) || 0;
    const updatedBalance = currentBalance - Number(paymentValue);

    // تحديث الرصيد
    await set(ref(database, `customer/${customerId}/balance`), updatedBalance);
    
    await remove(ref(database, `customer/${customerId}/invoices/${paymentId}`));

    // حذف الدفعة
    const paymentRef = ref(database, `payments/${paymentDate}/${paymentId}`);
    await remove(paymentRef);

    return res.status(200).json({ success: true, message: "Payment deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { deletePayment };
