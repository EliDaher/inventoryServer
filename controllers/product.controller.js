const { ref, set, get, push, child } = require("firebase/database");
const { database } = require('../firebaseConfig.js');

// اضافة منتج
const addProduct = async (req, res) => {
    try {
        const newProduct = req.body;

        if (!newProduct || !newProduct.name || !newProduct.buyPrice || !newProduct.sellPrice || !newProduct.category) {
            return res.status(400).json({ error: "Missing product fields." });
        }
        
        const productsRef = ref(database, "products");
        const newRef = await push(productsRef);
        const preparedProduct = {
          ...newProduct,
          id: newRef.key,
          buyPrice: Number(newProduct.buyPrice),
          sellPrice: Number(newProduct.sellPrice),
          quantity: Number(newProduct.quantity),
          discount: Number(newProduct.discount),
          category: newProduct.category.trim(),
          name: newProduct.name.trim(),
        };
        console.log(preparedProduct)
        await set(newRef, preparedProduct);

        return res.status(201).json({ success: true, message: "Product added successfully.", id: newRef.key });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message });
    }
};

// Login
const Login = async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log(username + " // " + password)
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        const UserRef = ref(database, `users/${username}`);
        const snapshot = await get(UserRef);

        if (!snapshot.exists()) {
            return res.status(404).json({ error: "User not found." });
        }

        const userData = snapshot.val();

        if (userData.password !== password) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        return res.status(200).json({ success: true, message: "Logged in successfully.", userData: JSON.parse(JSON.stringify(userData)) });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { addProduct, Login };
