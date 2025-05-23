const { ref, set, get, push, child } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

// اضافة صنف
const addCategory = async (req, res) => {
    try {
        const newCategory = req.body;

        if (!newCategory || !newCategory.name) {
            return res.status(400).json({ error: "Missing product fields." });
        }
        
        const categoryRef = ref(database, "category");
        const newRef = await push(categoryRef);
        
        const preparedcategory = {
          ...newCategory,
          id: newRef.key,
        };

        await set(newRef, preparedcategory);

        return res.status(201).json({ success: true, message: "category added successfully.", id: newRef.key });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

// جلب كل المنتجات
const getCategory = async (req, res) => {
    try {

        const categoryRef = ref(database, `category`);
        const snapshot = await get(categoryRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "category not found." });
        }

        const categoryData = snapshot.val();

        return res.status(200).json({ categoryData: categoryData });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { addCategory, getCategory };
