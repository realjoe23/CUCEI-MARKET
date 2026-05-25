const express = require('express');

const router = express.Router();

const multer = require('multer');

// MemoryStorage para que req.file.buffer esté disponible en el controller
const upload = multer({ storage: multer.memoryStorage() });



const authController = require('../controllers/authController');

const adminController = require('../controllers/adminController');

const storeController = require('../controllers/storeController');



// Rutas...

router.post('/register', upload.single('kardex'), authController.registrarUsuario);

router.post('/login', authController.loginUsuario);

router.get('/admin/users', adminController.obtenerUsuarios);

router.put('/admin/users/:id/status', adminController.actualizarEstadoUsuario);

router.post('/stores', storeController.registrarPuesto);

router.get('/stores', storeController.obtenerPuestosActivos);
router.get('/admin/stores', storeController.obtenerTodosPuestos);
router.put('/admin/stores/:id/status', storeController.actualizarEstadoPuesto);

// Rutas de puestos
router.get('/stores/vendedor/:vendedor_id', storeController.obtenerPuestoVendedor);
router.get('/stores/:id', storeController.obtenerPuesto);
router.get('/stores/:id/products', storeController.obtenerProductos);
router.get('/stores/:id/reviews', storeController.obtenerResenas);
router.post('/stores/:id/reviews', storeController.agregarResena);

// Rutas de productos
router.post('/products', upload.single('imagen'), storeController.agregarProducto);
router.put('/products/:id', upload.single('imagen'), storeController.editarProducto);
router.delete('/products/:id', storeController.eliminarProducto);



module.exports = router; 

