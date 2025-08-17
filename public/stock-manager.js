// ===================== FUNCIONES DE STOCK =====================

/**
 * Verificar stock disponible en Firebase
 */
async function verificarStockDisponible(productoId, talla, cantidadSolicitada = 1) {
    try {
        await inicializarFirebase();
        
        console.log(`🔍 Verificando stock para: ${productoId}, talla: ${talla}, cantidad: ${cantidadSolicitada}`);
        
        const docRef = db.collection("productos").doc(productoId);
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            console.error(`❌ Producto ${productoId} no encontrado en Firebase`);
            return { disponible: false, stockActual: 0, mensaje: "Producto no encontrado" };
        }
        
        const producto = docSnap.data();
        let stockActual = 0;
        
        // Verificar si el producto maneja tallas específicas o stock general
        if (producto.stockPorTalla && typeof producto.stockPorTalla === 'object') {
            // Stock específico por talla
            stockActual = parseInt(producto.stockPorTalla[talla] || 0);
        } else {
            // Stock general del producto
            stockActual = parseInt(producto.stock || 0);
        }
        
        const disponible = stockActual >= cantidadSolicitada;
        
        console.log(`📊 Stock verificado - Disponible: ${stockActual}, Solicitado: ${cantidadSolicitada}, Válido: ${disponible}`);
        
        return {
            disponible,
            stockActual,
            mensaje: disponible ? 
                `${stockActual} unidades disponibles` : 
                `Solo quedan ${stockActual} unidades disponibles`
        };
        
    } catch (error) {
        console.error("❌ Error verificando stock:", error);
        return { 
            disponible: false, 
            stockActual: 0, 
            mensaje: "Error verificando disponibilidad" 
        };
    }
}

/**
 * Reducir stock en Firebase después de una compra
 */
async function reducirStockEnFirebase(itemsCarrito) {
    try {
        await inicializarFirebase();
        
        console.log('🔄 Iniciando reducción de stock para:', itemsCarrito);
        
        const batch = db.batch();
        const errores = [];
        const actualizaciones = [];
        
        for (const item of itemsCarrito) {
            try {
                const docRef = db.collection("productos").doc(item.id || item.nombre);
                const docSnap = await docRef.get();
                
                if (!docSnap.exists) {
                    errores.push(`Producto ${item.nombre} no encontrado`);
                    continue;
                }
                
                const producto = docSnap.data();
                const cantidadAReducir = parseInt(item.cantidad || 1);
                
                let actualizacion = {};
                
                if (producto.stockPorTalla && typeof producto.stockPorTalla === 'object') {
                    // Manejar stock por talla
                    const stockActualTalla = parseInt(producto.stockPorTalla[item.talla] || 0);
                    
                    if (stockActualTalla < cantidadAReducir) {
                        errores.push(`Stock insuficiente para ${item.nombre} talla ${item.talla}`);
                        continue;
                    }
                    
                    const nuevoStockTalla = stockActualTalla - cantidadAReducir;
                    actualizacion[`stockPorTalla.${item.talla}`] = nuevoStockTalla;
                    
                    // También actualizar stock total
                    const stockTotal = Object.values(producto.stockPorTalla).reduce((sum, s) => sum + parseInt(s || 0), 0);
                    actualizacion.stock = stockTotal - cantidadAReducir;
                    
                } else {
                    // Manejar stock general
                    const stockActual = parseInt(producto.stock || 0);
                    
                    if (stockActual < cantidadAReducir) {
                        errores.push(`Stock insuficiente para ${item.nombre}`);
                        continue;
                    }
                    
                    actualizacion.stock = stockActual - cantidadAReducir;
                }
                
                // Agregar timestamp de última venta
                actualizacion.ultimaVenta = firebase.firestore.FieldValue.serverTimestamp();
                
                batch.update(docRef, actualizacion);
                actualizaciones.push({
                    producto: item.nombre,
                    cantidadReducida: cantidadAReducir,
                    talla: item.talla
                });
                
            } catch (error) {
                console.error(`❌ Error procesando ${item.nombre}:`, error);
                errores.push(`Error procesando ${item.nombre}: ${error.message}`);
            }
        }
        
        if (errores.length > 0) {
            console.error('❌ Errores encontrados:', errores);
            return {
                exito: false,
                errores,
                mensaje: `Errores: ${errores.join(', ')}`
            };
        }
        
        if (actualizaciones.length === 0) {
            return {
                exito: false,
                mensaje: "No hay productos válidos para actualizar"
            };
        }
        
        // Ejecutar todas las actualizaciones en batch
        await batch.commit();
        
        console.log('✅ Stock actualizado exitosamente:', actualizaciones);
        
        // Limpiar cache para forzar actualización
        limpiarCache();
        
        return {
            exito: true,
            actualizaciones,
            mensaje: `Stock actualizado para ${actualizaciones.length} productos`
        };
        
    } catch (error) {
        console.error("❌ Error reduciendo stock:", error);
        return {
            exito: false,
            mensaje: `Error actualizando stock: ${error.message}`
        };
    }
}

/**
 * Restaurar stock (en caso de cancelación)
 */
async function restaurarStockEnFirebase(itemsCarrito) {
    try {
        await inicializarFirebase();
        
        console.log('🔄 Restaurando stock para:', itemsCarrito);
        
        const batch = db.batch();
        
        for (const item of itemsCarrito) {
            const docRef = db.collection("productos").doc(item.id || item.nombre);
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                const producto = docSnap.data();
                const cantidadARestaurar = parseInt(item.cantidad || 1);
                
                let actualizacion = {};
                
                if (producto.stockPorTalla && typeof producto.stockPorTalla === 'object') {
                    const stockActualTalla = parseInt(producto.stockPorTalla[item.talla] || 0);
                    actualizacion[`stockPorTalla.${item.talla}`] = stockActualTalla + cantidadARestaurar;
                    
                    const stockTotal = Object.values(producto.stockPorTalla).reduce((sum, s) => sum + parseInt(s || 0), 0);
                    actualizacion.stock = stockTotal + cantidadARestaurar;
                } else {
                    const stockActual = parseInt(producto.stock || 0);
                    actualizacion.stock = stockActual + cantidadARestaurar;
                }
                
                batch.update(docRef, actualizacion);
            }
        }
        
        await batch.commit();
        limpiarCache();
        
        console.log('✅ Stock restaurado exitosamente');
        return { exito: true };
        
    } catch (error) {
        console.error("❌ Error restaurando stock:", error);
        return { exito: false, mensaje: error.message };
    }
}

/**
 * Obtener stock actual de un producto
 */
async function obtenerStockActual(productoId, talla = null) {
    try {
        await inicializarFirebase();
        
        const docRef = db.collection("productos").doc(productoId);
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            return { stock: 0, encontrado: false };
        }
        
        const producto = docSnap.data();
        
        if (talla && producto.stockPorTalla) {
            return {
                stock: parseInt(producto.stockPorTalla[talla] || 0),
                stockTotal: parseInt(producto.stock || 0),
                encontrado: true
            };
        }
        
        return {
            stock: parseInt(producto.stock || 0),
            encontrado: true
        };
        
    } catch (error) {
        console.error("❌ Error obteniendo stock:", error);
        return { stock: 0, encontrado: false };
    }
}

/**
 * Registrar venta en historial (opcional)
 */
async function registrarVenta(carrito, datosCliente = {}) {
    try {
        await inicializarFirebase();
        
        const venta = {
            items: carrito.map(item => ({
                id: item.id || item.nombre,
                nombre: item.nombre,
                talla: item.talla,
                cantidad: item.cantidad,
                precio: item.precio,
                subtotal: item.precio * item.cantidad
            })),
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            fecha: firebase.firestore.FieldValue.serverTimestamp(),
            cliente: datosCliente,
            estado: 'pendiente', // pendiente, confirmado, entregado
            plataforma: 'whatsapp'
        };
        
        const docRef = await db.collection("ventas").add(venta);
        
        console.log('📝 Venta registrada con ID:', docRef.id);
        
        return { exito: true, ventaId: docRef.id };
        
    } catch (error) {
        console.error("❌ Error registrando venta:", error);
        return { exito: false, mensaje: error.message };
    }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Validar disponibilidad de todo el carrito
 */
async function validarDisponibilidadCarrito(carrito) {
    const resultados = [];
    let todoDisponible = true;
    
    for (const item of carrito) {
        const verificacion = await verificarStockDisponible(
            item.id || item.nombre, 
            item.talla, 
            item.cantidad
        );
        
        resultados.push({
            producto: item.nombre,
            talla: item.talla,
            cantidadSolicitada: item.cantidad,
            ...verificacion
        });
        
        if (!verificacion.disponible) {
            todoDisponible = false;
        }
    }
    
    return {
        todoDisponible,
        resultados,
        mensaje: todoDisponible ? 
            "Todos los productos están disponibles" : 
            "Algunos productos no tienen stock suficiente"
    };
}

/**
 * Generar reporte de productos con poco stock
 */
async function obtenerProductosConPocoStock(limite = 5) {
    try {
        const productos = await obtenerProductos(true);
        
        const productosBajoStock = productos.filter(producto => {
            const stock = parseInt(producto.stock || 0);
            return stock <= limite && stock > 0;
        });
        
        const productosAgotados = productos.filter(producto => {
            const stock = parseInt(producto.stock || 0);
            return stock === 0;
        });
        
        return {
            bajoStock: productosBajoStock,
            agotados: productosAgotados,
            resumen: {
                totalBajoStock: productosBajoStock.length,
                totalAgotados: productosAgotados.length
            }
        };
        
    } catch (error) {
        console.error("❌ Error obteniendo productos con poco stock:", error);
        return { bajoStock: [], agotados: [], resumen: { totalBajoStock: 0, totalAgotados: 0 } };
    }
}

// ==================== HACER FUNCIONES GLOBALES ====================

// Hacer todas las funciones disponibles globalmente
window.verificarStockDisponible = verificarStockDisponible;
window.reducirStockEnFirebase = reducirStockEnFirebase;
window.restaurarStockEnFirebase = restaurarStockEnFirebase;
window.obtenerStockActual = obtenerStockActual;
window.registrarVenta = registrarVenta;
window.validarDisponibilidadCarrito = validarDisponibilidadCarrito;
window.obtenerProductosConPocoStock = obtenerProductosConPocoStock;

console.log('📊 Stock Manager cargado - Funciones disponibles:');
console.log('- verificarStockDisponible()');
console.log('- reducirStockEnFirebase()');
console.log('- restaurarStockEnFirebase()');
console.log('- obtenerStockActual()');
console.log('- registrarVenta()');
console.log('- validarDisponibilidadCarrito()');
console.log('- obtenerProductosConPocoStock()');