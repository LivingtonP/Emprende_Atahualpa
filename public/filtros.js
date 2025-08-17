// productos.js - Versión con Firebase CDN (sin módulos ES6)

// Firebase se carga desde CDN, así que usamos la versión global
let db = null;
let app = null;

// Función para inicializar Firebase
async function inicializarFirebase() {
    if (app) return app; // Ya está inicializado
    
    try {
        // Verificar que Firebase esté disponible
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase no está cargado. Asegúrate de incluir los scripts de Firebase en tu HTML.');
        }

        // Tu configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyC-PmCzqUDNWhnHITRhToOw4YoDnQJGiMA",
            authDomain: "tiendaonlineatahualpa.firebaseapp.com",
            projectId: "tiendaonlineatahualpa",
            storageBucket: "tiendaonlineatahualpa.firebasestorage.app",
            messagingSenderId: "650522644099",
            appId: "1:650522644099:web:7ec67efca49a69d60d95b6",
            measurementId: "G-JB9KQY6W8C"
        };

        // Inicializar Firebase
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        
        console.log('✅ Firebase inicializado correctamente');
        return app;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        throw error;
    }
}

// Cache para productos (mejora el rendimiento)
let productosCache = null;
let ultimaActualizacion = null;
const TIEMPO_CACHE = 5 * 60 * 1000; // 5 minutos

// Función principal para obtener productos
export async function obtenerProductos(forzarActualizacion = false) {
    try {
        // Inicializar Firebase si no está inicializado
        await inicializarFirebase();
        
        // Verificar cache
        const ahora = new Date().getTime();
        const cacheValido = productosCache && 
                           ultimaActualizacion && 
                           (ahora - ultimaActualizacion) < TIEMPO_CACHE;

        if (!forzarActualizacion && cacheValido) {
            return productosCache;
        }

        console.log('🔄 Obteniendo productos desde Firestore...');

        // Obtener desde Firebase usando la API compat
        const querySnapshot = await db.collection("productos").get();
        const productos = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filtrar productos con datos válidos
            if (data.nombre && data.precio !== undefined && data.stock !== undefined) {
                productos.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        // Actualizar cache
        productosCache = productos;
        ultimaActualizacion = ahora;
        
        console.log(`✅ ${productos.length} productos obtenidos desde Firestore`);
        return productos;
        
    } catch (error) {
        console.error("Error al obtener productos:", error);
        
        // Si hay error y tenemos cache, devolver cache
        if (productosCache) {
            console.log('⚠️ Usando productos del cache debido a error');
            return productosCache;
        }
        
        // Si no hay cache, devolver array vacío
        console.log('❌ No hay productos disponibles');
        return [];
    }
}

// Para compatibilidad con tu código existente
export let productos = null;

// Función para obtener productos por categoría
export async function obtenerProductosPorCategoria(categoria) {
    try {
        await inicializarFirebase();
        
        console.log(`🔍 Buscando productos de categoría: ${categoria}`);
        
        const querySnapshot = await db.collection("productos")
            .where("categoria", "==", categoria)
            .get();
        
        const productos = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.nombre && data.precio !== undefined && data.stock !== undefined) {
                productos.push({
                    id: doc.id,
                    ...data
                });
            }
        });
        
        console.log(`✅ ${productos.length} productos encontrados en categoría "${categoria}"`);
        return productos;
        
    } catch (error) {
        console.error(`Error al obtener productos de categoría ${categoria}:`, error);
        return [];
    }
}

// Función para buscar productos
export async function buscarProductos(termino) {
    try {
        const todosLosProductos = await obtenerProductos();
        const terminoLower = termino.toLowerCase();
        
        const resultados = todosLosProductos.filter(producto => 
            producto.nombre.toLowerCase().includes(terminoLower) ||
            producto.marca.toLowerCase().includes(terminoLower) ||
            producto.descripcion.toLowerCase().includes(terminoLower)
        );
        
        console.log(`🔍 ${resultados.length} productos encontrados para: "${termino}"`);
        return resultados;
        
    } catch (error) {
        console.error(`Error al buscar productos:`, error);
        return [];
    }
}

// Función para obtener un producto por ID
export async function obtenerProductoPorId(id) {
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
        console.error(`Error al obtener producto ${id}:`, error);
        return null;
    }
}

// Función para actualizar stock
export async function actualizarStock(id, nuevoStock) {
    try {
        await inicializarFirebase();
        
        const docRef = db.collection("productos").doc(id);
        await docRef.update({
            stock: nuevoStock,
            fechaActualizacion: new Date()
        });
        
        // Limpiar cache
        productosCache = null;
        
        console.log(`✅ Stock actualizado para producto ${id}: ${nuevoStock}`);
        return await obtenerProductoPorId(id);
        
    } catch (error) {
        console.error(`Error al actualizar stock:`, error);
        throw error;
    }
}

// Función para reducir stock después de una compra
export async function reducirStock(id, cantidad = 1) {
    try {
        const producto = await obtenerProductoPorId(id);
        
        if (!producto) {
            throw new Error("Producto no encontrado");
        }
        
        if (producto.stock < cantidad) {
            throw new Error("Stock insuficiente");
        }
        
        const nuevoStock = producto.stock - cantidad;
        return await actualizarStock(id, nuevoStock);
        
    } catch (error) {
        console.error("Error al reducir stock:", error);
        throw error;
    }
}

// Función de inicialización
export async function inicializarProductos() {
    try {
        productos = await obtenerProductos();
        console.log(`✅ Productos inicializados: ${productos.length}`);
        return productos;
    } catch (error) {
        console.error("Error al inicializar productos:", error);
        return [];
    }
}

// Para limpiar cache manualmente
export function limpiarCache() {
    productosCache = null;
    ultimaActualizacion = null;
    console.log('🧹 Cache de productos limpiado');
}

// Verificar estado de Firebase (útil para debugging)
window.verificarFirebase = async function() {
    try {
        await inicializarFirebase();
        const productos = await obtenerProductos(true);
        console.log(`🔥 Firebase funcional. ${productos.length} productos:`, productos);
        return { status: 'ok', productos };
    } catch (error) {
        console.error('🚨 Firebase error:', error);
        return { status: 'error', error: error.message };
    }
};