const { ref, set, get, push, update } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

const today = (() => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
})();


// اضافة زبون
const addCustomer = async (req, res) => {
    try {
        const newCustomer = req.body;

        if (!newCustomer || !newCustomer.name) {
            return res.status(400).json({ error: "Missing product fields." });
        }
        
        const categoryRef = ref(database, "customer");
        const newRef = await push(categoryRef);
        
        const preparedCustomer = {
          ...newCustomer,
          id: newRef.key,
        };

        await set(newRef, preparedCustomer);

        return res.status(201).json({ success: true, message: "customer added successfully.", id: newRef.key });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

// جلب كل المنتجات
const getCustomers = async (req, res) => {
    try {

        const customerRef = ref(database, `customer`);
        const snapshot = await get(customerRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "customer not found." });
        }

        const customerData = snapshot.val();

        return res.status(200).json({ customerData: customerData });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const addCustomerInvoicePayment = async (req, res) => {
    try {
        const newInvoice = req.body;

        if (!newInvoice || !newInvoice.customerName) {
          return res.status(400).json({ error: "Missing Invoice fields." });
        }

        const customerRef = ref(database, `customer/${newInvoice.customerName}`);
        const customerSnapshot = await get(customerRef);

        if (!customerSnapshot.exists()) {
          return res.status(404).json({ error: "Customer not found." });
        }

        const customerData = customerSnapshot.val();

        // 1. إنشاء مفتاح جديد للفاتورة ضمن invoices للزبون
        const customerInvoicesRef = ref(database, `customer/${newInvoice.customerName}/invoices`);
        const newInvoiceRef = push(customerInvoicesRef); // push تعطيك مفتاح جديد تلقائي

        const preparedInvoice = {
          finalAmount: -Number(newInvoice.finalAmount), // خصم المبلغ
          createdAt: newInvoice.createdAt || new Date().toISOString(),
          id: newInvoiceRef.key,
          items: newInvoice.items,
        };

        // 2. تحديث الرصيد بعد الخصم
        const updatedBalance = customerData.balance ? customerData.balance - Number(newInvoice.finalAmount) : -Number(newInvoice.finalAmount);

        // 3. حفظ الفاتورة ضمن مسار الزبون
        await set(newInvoiceRef, preparedInvoice);

        // 4. حفظ الفاتورة ضمن مسار عام للفواتير (اختياري حسب نظامك)
        const generalInvoiceRef = ref(database, `invoices/${today}/${newInvoiceRef.key}`);
        await set(generalInvoiceRef, newInvoice);

        // 5. تحديث رصيد الزبون
        await set(ref(database, `customer/${newInvoice.customerName}/balance`), updatedBalance);

        // 6. تحديث كمية المنتجات
        for (const item of newInvoice.items) {
          const productQuantityRef = ref(database, `products/${item.id}/quantity`);
          const snapshot = await get(productQuantityRef);

          if (snapshot.exists()) {
            const currentQuantity = snapshot.val();
            const newQuantity = currentQuantity - item.quantity;

            if (newQuantity < 0) {
              return res.status(400).json({ error: `Not enough quantity for product ID ${item.id}` });
            }

            await set(productQuantityRef, newQuantity);
          } else {
            return res.status(404).json({ error: `Product ID ${item.id} not found.` });
          }
        }

        return res.status(201).json({ success: true, message: "Invoice added successfully.", id: newInvoiceRef.key });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};

const addPayment = async (req, res) => {

    try {
        const paymentDetails = req.body;

        if (!paymentDetails || !paymentDetails.paymentValue || !paymentDetails.customerId || !paymentDetails.customerName) {
            return res.status(400).json({ error: "Missing payment Value or customer Id fields." });
        }
        
        const paymentRef = ref(database, `payments/${today}`);
        const newRef = await push(paymentRef);
        
        const preparedPayment = {
            ...paymentDetails,
            id: newRef.key,
            createdAt: paymentDetails.createdAt || new Date().toISOString(),
        };

        await set(newRef, preparedPayment);

        const balanceRef = ref(database, `customer/${paymentDetails.customerId}/balance`)
        const snapshot = await get(balanceRef)

        const oldBalance = Number(snapshot.val())
        await set(balanceRef, Number(oldBalance + Number(paymentDetails.paymentValue)))

        
        const customerInvoicesRef = ref(database, `customer/${paymentDetails.customerId}/invoices/${newRef.key}`);
        const preparedInvoice = {
            finalAmount: Number(paymentDetails.paymentValue),
            createdAt: paymentDetails.createdAt || new Date().toISOString(),
            id: newRef.key,
            items: [],
        };
        await set(customerInvoicesRef, preparedInvoice)

        

        return res.status(201).json({ success: true, message: "payment added successfully.", id: newRef.key });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }

}

module.exports = { addCustomer, getCustomers, addCustomerInvoicePayment, addPayment };
