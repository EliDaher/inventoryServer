const { ref, set, get, push, update } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

// اضافة بائع
const addDealer = async (req, res) => {
    try {
        const newDealer = req.body;

        if (!newDealer || !newDealer.name) {
            return res.status(400).json({ error: "Missing product fields." });
        }
        
        const dealerRef = ref(database, "dealer");
        const newRef = await push(dealerRef);
        
        const preparedDealer = {
          ...newDealer,
          id: newRef.key,
        };

        await set(newRef, preparedDealer);

        return res.status(201).json({ success: true, message: "dealer added successfully.", id: newRef.key });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

// جلب كل البائعين
const getDealers = async (req, res) => {
    try {

        const dealerRef = ref(database, `dealer`);
        const snapshot = await get(dealerRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "dealer not found." });
        }

        const dealerData = snapshot.val();

        return res.status(200).json({ dealerData: dealerData });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const addDealerInvoicePayment = async (req, res) => {
    /*try {
        const newInvoice = req.body;
    
        if (!newInvoice || !newInvoice.dealerName) {
          return res.status(400).json({ error: "Missing Invoice fields." });
        }
    
        const dealerRef = ref(database, `dealer/${newInvoice.dealerName}`);
        const dealerSnapshot = await get(dealerRef);
    
        if (!dealerSnapshot.exists()) {
          return res.status(404).json({ error: "Dealer not found." });
        }
    
        const dealerData = dealerSnapshot.val();
    
        // 1. إنشاء مفتاح جديد للفاتورة ضمن invoices للزبون
        const dealerInvoicesRef = ref(database, `dealer/${newInvoice.dealerName}/invoices`);
        const newInvoiceRef = push(dealerInvoicesRef); // push تعطيك مفتاح جديد تلقائي
    
        const preparedInvoice = {
          finalAmount: -Number(newInvoice.finalAmount), // خصم المبلغ
          createdAt: newInvoice.createdAt || new Date().toISOString(),
          id: newInvoiceRef.key,
          items: newInvoice.items,
        };
    
        // 2. تحديث الرصيد بعد الخصم
        const updatedBalance = dealerData.balance ? dealerData.balance - Number(newInvoice.finalAmount) : -Number(newInvoice.finalAmount);
    
        // 3. حفظ الفاتورة ضمن مسار الزبون
        await set(newInvoiceRef, preparedInvoice);
    
        // 4. حفظ الفاتورة ضمن مسار عام للفواتير (اختياري حسب نظامك)
        const generalInvoiceRef = ref(database, `invoices/${newInvoiceRef.key}`);
        await set(generalInvoiceRef, newInvoice);
    
        // 5. تحديث رصيد الزبون
        await set(ref(database, `dealer/${newInvoice.dealerName}/balance`), updatedBalance);
    
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
    }*/
};

module.exports = { addDealer, getDealers, addDealerInvoicePayment };
