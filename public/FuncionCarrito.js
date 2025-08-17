// FuncionCarrito.js - Versión MEJORADA con validación de stock real de Firebase

// ===================== FUNCIONES DEL CARRITO =====================

/**
 * Agregar producto al carrito CON VALIDACIÓN DE STOCK REAL
 */
async function agregarAlCarrito(producto) {
    if (!producto || !producto.nombre) {
        console.warn('Producto inválido:', producto);
        return;
    }

    // VALIDACIÓN MEJORADA DEL PRECIO
    if (!producto.precio || typeof producto.precio !== 'number' || isNaN(producto.precio)) {
        console.error('Precio inválido para el producto:', producto);
        mostrarNotificacion('Error: El producto no tiene un precio válido', 'error');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => 
        item.nombre === producto.nombre && 
        item.talla === producto.talla
    );

    // NUEVA VALIDACIÓN: Verificar stock REAL en Firebase
    const cantidadSolicitada = producto.cantidad || 1;
    let cantidadEnCarrito = 0;
    
    if (index > -1) {
        cantidadEnCarrito = carrito[index].cantidad;
    }
    
    const cantidadTotal = cantidadEnCarrito + cantidadSolicitada;
    
    // 🔥 VALIDACIÓN REAL CON FIREBASE
    try {
        mostrarNotificacion('Verificando disponibilidad...', 'info');
        
        const verificacion = await verificarStockDisponible(
            producto.id || producto.nombre, 
            producto.talla, 
            cantidadTotal
        );
        
        if (!verificacion.disponible) {
            mostrarNotificacion(
                `❌ ${verificacion.mensaje}. No se puede agregar al carrito.`,
                'error'
            );
            return;
        }
        
        // ✅ Stock disponible - proceder a agregar
        if (index > -1) {
            // Producto ya existe en el carrito
            carrito[index].cantidad = cantidadTotal;
            mostrarNotificacion(
                `✅ Cantidad actualizada para "${producto.nombre}". Stock disponible: ${verificacion.stockActual}`,
                'success'
            );
        } else {
            // Producto nuevo en el carrito
            carrito.push({
                id: producto.id || producto.nombre, // Importante: guardar ID
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                talla: producto.talla || 'M',
                cantidad: cantidadSolicitada,
                imagen: producto.imagen || 'https://via.placeholder.com/300x300?text=Sin+Imagen'
            });
            mostrarNotificacion(
                `✅ "${producto.nombre}" agregado al carrito. Stock disponible: ${verificacion.stockActual}`,
                'success'
            );
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        
    } catch (error) {
        console.error('❌ Error verificando stock:', error);
        mostrarNotificacion('Error verificando disponibilidad. Intenta de nuevo.', 'error');
    }
}

/**
 * Mostrar modal del carrito CON VALIDACIÓN DE STOCK
 */
async function mostrarModalCarrito() {
    const modal = document.getElementById('modalCarrito');
    const body = document.getElementById('modalCarritoBody');

    if (!modal || !body) {
        console.error('No se encontraron los elementos del modal del carrito');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // LIMPIAR ELEMENTOS INVÁLIDOS ANTES DE MOSTRAR
    carrito = carrito.filter(item => {
        const esValido = item && 
                        item.nombre && 
                        typeof item.precio === 'number' && 
                        !isNaN(item.precio) && 
                        item.cantidad && 
                        item.cantidad > 0;
        
        if (!esValido) {
            console.warn('Elemento inválido removido del carrito:', item);
        }
        return esValido;
    });

    // Actualizar localStorage con elementos válidos
    localStorage.setItem('carrito', JSON.stringify(carrito));

    if (carrito.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 10px;"></i>
                <p>El carrito está vacío.</p>
                <p style="color: #666; font-size: 0.9rem;">¡Agrega algunos productos!</p>
            </div>
        `;
    } else {
        // 🔥 VALIDAR STOCK DE TODOS LOS PRODUCTOS EN TIEMPO REAL
        body.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #007bff;"></i>
                <p>Validando disponibilidad de productos...</p>
            </div>
        `;
        
        try {
            const validacion = await validarDisponibilidadCarrito(carrito);
            
            // Filtrar productos que ya no están disponibles
            const productosValidos = [];
            const productosInvalidos = [];
            
            for (let i = 0; i < carrito.length; i++) {
                const item = carrito[i];
                const resultado = validacion.resultados[i];
                
                if (resultado.disponible) {
                    productosValidos.push(item);
                } else {
                    productosInvalidos.push({
                        ...item,
                        stockActual: resultado.stockActual
                    });
                }
            }
            
            // Actualizar carrito si hay productos inválidos
            if (productosInvalidos.length > 0) {
                localStorage.setItem('carrito', JSON.stringify(productosValidos));
                
                const mensajeInvalidos = productosInvalidos
                    .map(p => `• ${p.nombre} (solicitado: ${p.cantidad}, disponible: ${p.stockActual})`)
                    .join('\n');
                
                mostrarNotificacion(
                    `⚠️ Algunos productos fueron removidos por falta de stock:\n${mensajeInvalidos}`,
                    'warning'
                );
            }
            
            carrito = productosValidos;
            
        } catch (error) {
            console.error('Error validando carrito:', error);
            mostrarNotificacion('Error validando productos. Algunos pueden no estar disponibles.', 'warning');
        }
        
        const total = calcularTotal(carrito);
        body.innerHTML = `
            <h3>Productos en tu carrito</h3>
            <div class="carrito-items">
                ${carrito.map(item => `
                    <div class="modal-carrito-item">
                        <img src="${item.imagen || 'https://via.placeholder.com/60x60?text=Sin+Imagen'}" alt="${item.nombre || 'Producto'}" onerror="this.src='https://via.placeholder.com/60x60?text=Sin+Imagen'" />
                        <div class="info">
                            <p><strong>${item.nombre || 'Producto sin nombre'}</strong></p>
                            <p>Talla: ${item.talla || 'N/A'}</p>
                            <p>$${(item.precio || 0).toFixed(2)}</p>
                        </div>
                        <div class="cantidad">x${item.cantidad || 1}</div>
                        <button class="btn-eliminar" onclick="eliminarDelCarrito('${(item.nombre || '').replace(/'/g, "\\'")}', '${item.talla || ''}')" title="Eliminar producto">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="modal-carrito-total">
                <strong>Total: $${total.toFixed(2)}</strong>
            </div>
            <div class="modal-carrito-footer">
                <button id="cerrarModalBtn" onclick="cerrarModalCarrito()">Seguir comprando</button>
                <button id="vaciarCarritoBtn" onclick="vaciarCarrito()">Vaciar carrito</button>
                <button id="irAWspBtn" onclick="procesarCompraWhatsApp()">💬 Comprar por WhatsApp</button>
            </div>
        `;
    }

    modal.style.display = 'flex';
    
    // Configurar evento para cerrar al hacer click fuera
    modal.onclick = (e) => { 
        if (e.target === modal) cerrarModalCarrito(); 
    };
    
    // Configurar botón X de cerrar
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = cerrarModalCarrito;
    }
}

/**
 * Procesar compra con reducción de stock automática
 */
async function procesarCompraWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    try {
        mostrarNotificacion('🔄 Procesando compra...', 'info');
        
        // 1. VALIDAR STOCK FINAL
        const validacion = await validarDisponibilidadCarrito(carrito);
        
        if (!validacion.todoDisponible) {
            mostrarNotificacion('❌ Algunos productos ya no tienen stock suficiente. Revisa tu carrito.', 'error');
            mostrarModalCarrito(); // Refrescar modal para mostrar productos actualizados
            return;
        }
        
        // 2. REDUCIR STOCK EN FIREBASE
        const resultadoStock = await reducirStockEnFirebase(carrito);
        
        if (!resultadoStock.exito) {
            mostrarNotificacion(`❌ Error procesando la compra: ${resultadoStock.mensaje}`, 'error');
            return;
        }
        
        // 3. REGISTRAR VENTA (OPCIONAL)
        await registrarVenta(carrito, {
            origen: 'tienda_online',
            fecha: new Date().toISOString()
        });
        
        // 4. GENERAR PDF CON IMÁGENES
        await enviarCarritoWhatsApp();
        
        // 5. LIMPIAR CARRITO DESPUÉS DE LA COMPRA EXITOSA
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        cerrarModalCarrito();
        
        mostrarNotificacion('✅ ¡Compra procesada exitosamente! Stock actualizado.', 'success');
        
        // 6. REFRESCAR PRODUCTOS EN LA PÁGINA
        if (window.reiniciarProductos) {
            setTimeout(() => {
                window.reiniciarProductos();
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error procesando compra:', error);
        mostrarNotificacion('Error procesando la compra. Intenta de nuevo.', 'error');
    }
}

/**
 * Enviar carrito a WhatsApp con PDF (sin modificar stock - ya se hizo)
 */
async function enviarCarritoWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }

    try {
        if (typeof window.jspdf === 'undefined') {
            console.warn('jsPDF no está disponible, enviando solo texto a WhatsApp');
            enviarTextoWhatsApp(carrito);
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('¡Gracias por tu compra!', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text('Detalle de tu pedido realizado en nuestra tienda.', 105, 30, { align: 'center' });

        let y = 50;
        const margin = 10;

        for (const item of carrito) {
            // ===== AGREGAR IMAGEN =====
            if (item.imagen) {
                try {
                    const imgBase64 = await getBase64FromUrl(item.imagen);
                    doc.addImage(imgBase64, 'JPEG', margin, y, 20, 20);
                } catch (err) {
                    console.warn('No se pudo cargar imagen del producto:', item.nombre, err);
                }
            }

            // ===== TEXTO DEL PRODUCTO =====
            const precio = item.precio || 0;
            const cantidad = item.cantidad || 0;
            const subtotal = precio * cantidad;

            doc.setFontSize(10);
            doc.text(item.nombre || 'Sin nombre', margin + 25, y + 5);
            doc.text(`Talla: ${item.talla || 'N/A'}`, margin + 25, y + 10);
            doc.text(`Cantidad: ${cantidad}`, margin + 25, y + 15);
            doc.text(`Precio: $${precio.toFixed(2)}`, margin + 25, y + 20);
            doc.text(`Subtotal: $${subtotal.toFixed(2)}`, margin + 25, y + 25);

            y += 30;
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
        }

        const total = calcularTotal(carrito);
        doc.setFontSize(12);
        doc.text(`TOTAL: $${total.toFixed(2)}`, 200, y, { align: 'right' });

        doc.save('detalle-pedido.pdf');

        enviarTextoWhatsApp(carrito);

    } catch (error) {
        console.error('Error generando PDF:', error);
        enviarTextoWhatsApp(carrito);
    }
}

// ==================== FUNCIONES AUXILIARES (SIN CAMBIOS) ====================

/**
 * Actualizar contador del carrito en el header
 */
function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    const badge = document.querySelector('.cart .badge');
    if (badge) {
        badge.textContent = totalItems;
        
        // Animación simple del contador
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 150);
    }
}

/**
 * Eliminar producto específico del carrito
 */
function eliminarDelCarrito(nombre, talla) {
    if (!nombre) {
        console.warn('Nombre de producto inválido para eliminar');
        return;
    }
    
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEliminado = carrito.find(item => 
        item && item.nombre === nombre && item.talla === talla
    );
    
    carrito = carrito.filter(item => 
        !(item && item.nombre === nombre && item.talla === talla)
    );
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarModalCarrito(); // Refrescar el modal
    
    if (productoEliminado) {
        mostrarNotificacion(
            `"${productoEliminado.nombre}" eliminado del carrito`,
            'info'
        );
    }
}

/**
 * Vaciar carrito con confirmación
 */
function vaciarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        mostrarModalCarrito();
        mostrarNotificacion('Carrito vaciado correctamente', 'success');
    }
}

/**
 * Cerrar modal del carrito
 */
function cerrarModalCarrito() {
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Calcular total del carrito
 */
function calcularTotal(carrito) {
    return carrito.reduce((total, item) => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 0;
        return total + (precio * cantidad);
    }, 0);
}

/**
 * Enviar solo texto a WhatsApp (fallback)
 */
function enviarTextoWhatsApp(carrito) {
    const total = calcularTotal(carrito);
    
    let mensaje = '¡Hola! Me interesan estos productos:\\n\\n';
    carrito.forEach(item => {
        const precio = item.precio || 0;
        const cantidad = item.cantidad || 0;
        const subtotal = precio * cantidad;
        mensaje += `• ${item.nombre || 'Producto sin nombre'}\\n  Talla: ${item.talla || 'N/A'}\\n  Cantidad: ${cantidad}\\n  Precio: ${subtotal.toFixed(2)}\\n\\n`;
    });
    mensaje += `Total: ${total.toFixed(2)}\\n\\n¡Gracias!`;

    const numeroWhatsApp = '593969251642';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

/**
 * Función auxiliar para convertir URL a base64
 */
function getBase64FromUrl(url) {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }));
}

/**
 * Obtener carrito actual
 */
function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

/**
 * Función para limpiar carrito corrupto
 */
function limpiarCarritoCorrupto() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const carritoOriginal = carrito.length;
    
    console.log('Limpiando carrito. Estado inicial:', carrito);
    
    carrito = carrito.filter(item => {
        const esValido = item && 
                        item.nombre && 
                        typeof item.precio === 'number' && 
                        !isNaN(item.precio) && 
                        item.precio >= 0 &&
                        item.cantidad && 
                        item.cantidad > 0;
        
        if (!esValido) {
            console.warn('Elemento inválido removido:', item);
        }
        return esValido;
    });
    
    if (carrito.length !== carritoOriginal) {
        console.log(`Se removieron ${carritoOriginal - carrito.length} elementos corruptos del carrito`);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarNotificacion(`Se limpiaron ${carritoOriginal - carrito.length} elementos inválidos del carrito`, 'info');
    } else {
        console.log('El carrito está limpio, no hay elementos corruptos');
    }
    
    return carrito;
}

/**
 * Mostrar notificación simple
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    
    const colores = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3',
        warning: '#ff9800'
    };
    
    notificacion.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        z-index: 10000;
        background: ${colores[tipo] || colores.info}; 
        color: white; 
        padding: 15px 20px;
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 600; 
        max-width: 350px;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Agregar estilo de animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    if (!document.querySelector('style[data-notif]')) {
        style.setAttribute('data-notif', 'true');
        document.head.appendChild(style);
    }
    
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    // Auto-remover
    setTimeout(() => {
        notificacion.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// ==================== FUNCIONES DE CANCELACIÓN ====================

/**
 * Cancelar pedido y restaurar stock
 */
async function cancelarPedido(motivoCancelacion = 'Cancelado por el usuario') {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        mostrarNotificacion('No hay productos para cancelar', 'info');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres cancelar el pedido? Se restaurará el stock de los productos.')) {
        return;
    }
    
    try {
        mostrarNotificacion('🔄 Cancelando pedido y restaurando stock...', 'info');
        
        // Restaurar stock en Firebase
        const resultado = await restaurarStockEnFirebase(carrito);
        
        if (resultado.exito) {
            // Limpiar carrito
            localStorage.removeItem('carrito');
            actualizarContadorCarrito();
            cerrarModalCarrito();
            
            mostrarNotificacion('✅ Pedido cancelado y stock restaurado exitosamente', 'success');
            
            // Refrescar productos
            if (window.reiniciarProductos) {
                setTimeout(() => {
                    window.reiniciarProductos();
                }, 1000);
            }
        } else {
            mostrarNotificacion(`❌ Error cancelando pedido: ${resultado.mensaje}`, 'error');
        }
        
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        mostrarNotificacion('Error cancelando el pedido', 'error');
    }
}

// ==================== HACER FUNCIONES GLOBALES ====================

// Hacer todas las funciones disponibles globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.mostrarModalCarrito = mostrarModalCarrito;
window.actualizarContadorCarrito = actualizarContadorCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.cerrarModalCarrito = cerrarModalCarrito;
window.enviarCarritoWhatsApp = enviarCarritoWhatsApp;
window.procesarCompraWhatsApp = procesarCompraWhatsApp;
window.cancelarPedido = cancelarPedido;
window.obtenerCarrito = obtenerCarrito;
window.limpiarCarritoCorrupto = limpiarCarritoCorrupto;

// Inicializar contador al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Limpiar carrito corrupto al cargar la página
    limpiarCarritoCorrupto();
    actualizarContadorCarrito();
    console.log('✅ Funciones de carrito con validación de stock cargadas');
    console.log('🔥 NUEVAS FUNCIONES:');
    console.log('- procesarCompraWhatsApp() : Procesa compra y reduce stock');
    console.log('- cancelarPedido() : Cancela pedido y restaura stock');
});