const { ref, set, get, push, child } = require("firebase/database");
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

        return res.status(201).json({ success: true, message: "category added successfully.", id: newRef.key });
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
            return res.status(404).json({ error: "category not found." });
        }

        const customerData = snapshot.val();

        return res.status(200).json({ customerData: customerData });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { addCustomer, getCustomers };
