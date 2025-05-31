const { ref, set, get, push, update, remove } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

const today = (() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
})();

const deleteInvoice = async (req, res) => {
  try {
    const { invoiceDate, invoiceId, customerId, invoiceValue } = req.body;

    if (!invoiceDate || !invoiceId || !customerId || !invoiceValue) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const customerRef = ref(database, `customer/${customerId}`);
    const customerSnapshot = await get(customerRef);

    if (!customerSnapshot.exists()) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const customerData = customerSnapshot.val();
    const currentBalance = Number(customerData.balance) || 0;
    const updatedBalance = currentBalance + Number(invoiceValue);

    await set(ref(database, `customer/${customerId}/balance`), updatedBalance);

    await remove(ref(database, `customer/${customerId}/invoices/${invoiceId}`));

    const invoiceRef = ref(database, `invoices/${invoiceDate}/${invoiceId}/items`);
    const snapshot = await get(invoiceRef);
    const itemsData = snapshot.val();

    if (itemsData) {
      await Promise.all(
        itemsData.map(async (item) => {
          const itemRef = ref(database, `products/${item.id}/quantity`);
          const itemSnapshot = await get(itemRef);
          const currentQuantity = Number(itemSnapshot.val());
          const updatedQuantity = currentQuantity + Number(item.quantity);
          await set(itemRef, updatedQuantity);
        })
      );
    }

    await remove(invoiceRef);

    return res.status(200).json({ success: true, message: "Invoice deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { deleteInvoice };
