const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const http = require('http');
require('dotenv').config(); // تحميل متغيرات البيئة
const { Server } = require("socket.io");
const cron = require("node-cron");
const { Login, SignUp } = require('./controllers/auth.controller')
const { addProduct, getAllProducts } = require('./controllers/product.controller');
const { addCategory, getCategory } = require('./controllers/category.contoller');
const { addCustomer, getCustomers, addCustomerInvoicePayment } = require('./controllers/customer.controller');


const app = express();

const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
});


// السماح بالوصول من الشبكة المحلية
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json()); // لمعالجة بيانات JSON في الطلبات POST





app.get("/", (req, res) => {
    res.send("Server is alive!");
});


//اضافة منتج
app.post('/addProduct', addProduct)

//اعادة كل المنتجات
app.get('/getAllProducts', getAllProducts)

//اضافة تصنيف
app.post('/addCategory', addCategory)

//اعادة كل التصنيفات
app.get('/getCategory', getCategory)

//اضافة تصنيف
app.post('/addCustomer', addCustomer)

//اعادة كل التصنيفات
app.get('/getCustomers', getCustomers)

//بيع بضاعة
app.post('/addCustomerInvoicePayment', addCustomerInvoicePayment)





const PORT = process.env.PORT || 1337;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
