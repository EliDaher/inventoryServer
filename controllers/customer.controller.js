const { ref, set, get, push, update } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

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

        // المرجع الخاص بالزبون (عميل)
        const customerRef = ref(database, `customers/${newInvoice.customerName}`);

        // إضافة فاتورة جديدة داخل الزبون
        const newRef = push(customerRef);

        const preparedInvoice = {
          finalAmount: -newInvoice.finalAmount, // لو تريد تخزين السالب لأسباب محاسبية
          createdAt: newInvoice.createdAt || new Date().toISOString(),
          id: newRef.key,
          items: newInvoice.items,
        };

        // إضافة الفاتورة داخل بيانات الزبون
        await set(newRef, preparedInvoice);

        // إضافة الفاتورة داخل قسم الفواتير الرئيسي
        const invoiceRef = ref(database, `invoices/${newRef.key}`);
        await set(invoiceRef, newInvoice);

        // تحديث كمية المنتجات بعد البيع
        for (const item of newInvoice.items) {
            const productQuantityRef = ref(database, `products/${item.id}/quantity`);

            // قراءة الكمية الحالية
            const snapshot = await get(productQuantityRef);
            if (snapshot.exists()) {
              const currentQuantity = snapshot.val();
              const newQuantity = currentQuantity - item.quantity;

              // التحقق من الكمية لتجنب القيم السلبية
              if (newQuantity < 0) {
                return res.status(400).json({ error: `Not enough quantity for product ID ${item.id}` });
              }

              // تحديث الكمية الجديدة
              await set(productQuantityRef, newQuantity);
            } else {
              return res.status(404).json({ error: `Product ID ${item.id} not found.` });
            }
        }

        return res.status(201).json({ success: true, message: "Invoice added successfully.", id: newRef.key });
    } catch (error) {
        console.error(error);
    return res.status(500).json({ error: error.message });
}
}
module.exports = { addCustomer, getCustomers, addCustomerInvoicePayment };
