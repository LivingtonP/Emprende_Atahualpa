// productos.js - Versión SIN MÓDULOS que funciona con scripts normales

// Variables globales de Firebase
let db = null;
let app = null;

// Cache para productos
let productosCache = null;
let ultimaActualizacion = null;
const TIEMPO_CACHE = 5 * 60 * 1000; // 5 minutos

// Función para inicializar Firebase
async function inicializarFirebase() {
    if (app) return app; // Ya está inicializado
    
    try {
        // Esperar a que Firebase esté completamente cargado
        if (typeof firebase === 'undefined') {
            console.log('⏳ Esperando a que Firebase se cargue...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase no está cargado. Verifica los scripts CDN en tu HTML.');
            }
        }

        // Configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyC-PmCzqUDNWhnHITRhToOw4YoDnQJGiMA",
            authDomain: "tiendaonlineatahualpa.firebaseapp.com",
            projectId: "tiendaonlineatahualpa",
            storageBucket: "tiendaonlineatahualpa.firebasestorage.app",
            messagingSenderId: "650522644099",
            appId: "1:650522644099:web:7ec67efca49a69d60d95b6",
            measurementId: "G-JB9KQY6W8C"
        };

        // Verificar si ya existe una app inicializada
        if (firebase.apps.length === 0) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }
        
        db = firebase.firestore();
        
        console.log('✅ Firebase inicializado correctamente');
        return app;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        throw error;
    }
}

// Función principal para obtener productos
async function obtenerProductos(forzarActualizacion = false) {
    try {
        // Inicializar Firebase si no está inicializado
        await inicializarFirebase();
        
        // Verificar cache
        const ahora = new Date().getTime();
        const cacheValido = productosCache && 
                           ultimaActualizacion && 
                           (ahora - ultimaActualizacion) < TIEMPO_CACHE;

        if (!forzarActualizacion && cacheValido) {
            console.log('📦 Usando productos del cache');
            return productosCache;
        }

        console.log('🔄 Obteniendo productos desde Firestore...');

        // Obtener desde Firebase usando la API compat
        const querySnapshot = await db.collection("productos").get();
        const productos = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Validar que el producto tenga los campos necesarios
            if (data.nombre && (data.precio !== undefined) && (data.stock !== undefined)) {
                productos.push({
                    id: doc.id,
                    ...data,
                    // Asegurar que estos campos existan
                    imagen: data.imagen || 'https://via.placeholder.com/300x300?text=Sin+Imagen',
                    marca: data.marca || 'Sin marca',
                    descripcion: data.descripcion || '',
                    tallas: data.tallas || [],
                    precio: parseFloat(data.precio) || 0,
                    stock: parseInt(data.stock) || 0
                });
            } else {
                console.warn(`⚠️ Producto con ID ${doc.id} tiene datos incompletos:`, data);
            }
        });
        
        // Actualizar cache
        productosCache = productos;
        ultimaActualizacion = ahora;
        
        console.log(`✅ ${productos.length} productos obtenidos desde Firestore`);
        console.table(productos.slice(0, 3)); // Mostrar primeros 3 para debug
        return productos;
        
    } catch (error) {
        console.error("❌ Error al obtener productos:", error);
        
        // Si hay error y tenemos cache, devolver cache
        if (productosCache && productosCache.length > 0) {
            console.log('⚠️ Usando productos del cache debido a error');
            return productosCache;
        }
        
        // Si no hay cache, devolver array vacío
        console.log('❌ No hay productos disponibles');
        return [];
    }
}

// Variable global de productos
let productos = null;

// Función para obtener productos por categoría
async function obtenerProductosPorCategoria(categoria) {
    try {
        await inicializarFirebase();
        
        console.log(`🔍 Buscando productos de categoría: ${categoria}`);
        
        const querySnapshot = await db.collection("productos")
            .where("categoria", "==", categoria)
            .get();
        
        const productos = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre && (data.precio !== undefined) && (data.stock !== undefined)) {
                productos.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        console.log(`✅ ${productos.length} productos encontrados en categoría "${categoria}"`);
        return productos;
        
    } catch (error) {
        console.error(`❌ Error al obtener productos de categoría ${categoria}:`, error);
        return [];
    }
}

// Función para buscar productos
async function buscarProductos(termino) {
    try {
        const todosLosProductos = await obtenerProductos();
        const terminoLower = termino.toLowerCase();
        
        const resultados = todosLosProductos.filter(producto => {
            const nombre = producto.nombre ? producto.nombre.toLowerCase() : '';
            const marca = producto.marca ? producto.marca.toLowerCase() : '';
            const descripcion = producto.descripcion ? producto.descripcion.toLowerCase() : '';
            
            return nombre.includes(terminoLower) ||
                   marca.includes(terminoLower) ||
                   descripcion.includes(terminoLower);
        });
        
        console.log(`🔍 ${resultados.length} productos encontrados para: "${termino}"`);
        return resultados;
        
    } catch (error) {
        console.error(`❌ Error al buscar productos:`, error);
        return [];
    }
}

// Función para obtener un producto por ID
async function obtenerProductoPorId(id) {
    try {
        await inicializarFirebase();
        
        const docRef = db.collection("productos").doc(id);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            throw new Error("Producto no encontrado");
        }
        
    } catch (error) {
        console.error(`❌ Error al obtener producto ${id}:`, error);
        return null;
    }
}

// Función de inicialización
async function inicializarProductos() {
    try {
        console.log('🚀 Inicializando productos...');
        productos = await obtenerProductos(true); // Forzar actualización en inicialización
        console.log(`✅ Productos inicializados: ${productos.length}`);
        return productos;
    } catch (error) {
        console.error("❌ Error al inicializar productos:", error);
        productos = [];
        return [];
    }
}

// Para limpiar cache manualmente
function limpiarCache() {
    productosCache = null;
    ultimaActualizacion = null;
    console.log('🧹 Cache de productos limpiado');
}

// Función de debug para verificar Firebase
async function verificarConexionFirebase() {
    try {
        await inicializarFirebase();
        const productos = await obtenerProductos(true);
        console.log(`🔥 Firebase funcional. ${productos.length} productos disponibles`);
        console.table(productos.slice(0, 5)); // Mostrar primeros 5 productos
        return { 
            status: 'ok', 
            productos: productos.length,
            data: productos 
        };
    } catch (error) {
        console.error('🚨 Firebase error:', error);
        return { 
            status: 'error', 
            error: error.message 
        };
    }
}

// Hacer funciones disponibles globalmente (reemplaza exports)
window.inicializarProductos = inicializarProductos;
window.obtenerProductos = obtenerProductos;
window.obtenerProductosPorCategoria = obtenerProductosPorCategoria;
window.buscarProductos = buscarProductos;
window.obtenerProductoPorId = obtenerProductoPorId;
window.limpiarCacheProductos = limpiarCache;
window.verificarFirebase = verificarConexionFirebase;