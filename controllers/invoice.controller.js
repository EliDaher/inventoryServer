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
    const { paymentDate, paymentId } = req.body;

    if (!paymentDate || !paymentId) {
      return res.status(400).json({ error: "Missing paymentDate or paymentId fields." });
    }

    const paymentRef = ref(database, `payments/${paymentDate}/${paymentId}`);
    await remove(paymentRef);

    return res.status(200).json({ success: true, message: "Payment deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports = { deletePayment };
