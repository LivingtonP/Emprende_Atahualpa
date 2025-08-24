// ===================== SISTEMA DE CARRITO DE COMPRAS =====================

/**
 * Configuración del carrito
 */
const CART_CONFIG = {
    storageKey: 'carrito',
    whatsappNumber: '593969251642',
    emptyImage: 'https://via.placeholder.com/300x300?text=Sin+Imagen'
};

/**
 * Validar que las notificaciones estén disponibles
 */
function validarSistemaNotificaciones() {
    if (typeof window.mostrarNotificacion !== 'function') {
        console.error('❌ Sistema de Notificaciones no encontrado. Asegúrate de cargar notificaciones.js primero.');
        return false;
    }
    return true;
}

/**
 * Funciones de notificación seguras (fallback si no está el sistema)
 */
const notificacion = {
    exito: (mensaje, titulo, duracion) => {
        if (validarSistemaNotificaciones()) {
            window.notificarExito(mensaje, titulo, duracion);
        } else {
            console.log(`✅ ÉXITO: ${titulo || ''} - ${mensaje}`);
        }
    },
    error: (mensaje, titulo, duracion) => {
        if (validarSistemaNotificaciones()) {
            window.notificarError(mensaje, titulo, duracion);
        } else {
            console.error(`❌ ERROR: ${titulo || ''} - ${mensaje}`);
        }
    },
    advertencia: (mensaje, titulo, duracion) => {
        if (validarSistemaNotificaciones()) {
            window.notificarAdvertencia(mensaje, titulo, duracion);
        } else {
            console.warn(`⚠️ ADVERTENCIA: ${titulo || ''} - ${mensaje}`);
        }
    },
    info: (mensaje, titulo, duracion) => {
        if (validarSistemaNotificaciones()) {
            window.notificarInfo(mensaje, titulo, duracion);
        } else {
            console.info(`ℹ️ INFO: ${titulo || ''} - ${mensaje}`);
        }
    }
};

/**
 * Utilidades del carrito
 */
const CartUtils = {
    get() {
        try {
            const data = localStorage.getItem(CART_CONFIG.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.warn('Error al leer el carrito del localStorage:', error);
            return [];
        }
    },

    save(cart) {
        try {
            localStorage.setItem(CART_CONFIG.storageKey, JSON.stringify(cart));
            this.updateCounter();
        } catch (error) {
            console.error('Error al guardar el carrito:', error);
            notificacion.error('Error al guardar en el carrito', 'Error de Almacenamiento');
        }
    },

    clear() {
        try {
            localStorage.removeItem(CART_CONFIG.storageKey);
            this.updateCounter();
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
        }
    },

    updateCounter() {
        const cart = this.get();
        const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        const badge = document.querySelector('.cart .badge');
        
        if (badge) {
            badge.textContent = totalItems;
            badge.style.transform = 'scale(1.3)';
            badge.style.background = '#10B981';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
                badge.style.background = '';
            }, 200);
        }
        
        // También actualizar otros posibles selectores
        const cartCounters = document.querySelectorAll('.cart-counter, .carrito-contador, #cart-count');
        cartCounters.forEach(counter => {
            counter.textContent = totalItems;
        });
    },

    validate(cart) {
        if (!Array.isArray(cart)) return [];
        
        return cart.filter(item => 
            item && 
            typeof item === 'object' &&
            item.nombre && 
            typeof item.nombre === 'string' &&
            typeof item.precio === 'number' && 
            !isNaN(item.precio) && 
            item.precio >= 0 &&
            item.cantidad && 
            typeof item.cantidad === 'number' &&
            item.cantidad > 0
        );
    },

    calculateTotal(cart) {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    },

    findIndex(cart, product) {
        return cart.findIndex(item => 
            item.nombre === product.nombre && 
            (item.talla || 'M') === (product.talla || 'M')
        );
    },

    // Método para obtener información del carrito
    getInfo() {
        const cart = this.get();
        const validCart = this.validate(cart);
        return {
            items: validCart,
            count: validCart.length,
            totalItems: validCart.reduce((sum, item) => sum + item.cantidad, 0),
            total: this.calculateTotal(validCart),
            isEmpty: validCart.length === 0
        };
    }
};

/**
 * Agregar producto al carrito con validación completa
 */
async function agregarAlCarrito(producto) {
    // Validaciones iniciales
    if (!producto || typeof producto !== 'object') {
        notificacion.error('El producto no es válido', 'Error de Producto');
        return false;
    }

    if (!producto.nombre || typeof producto.nombre !== 'string') {
        notificacion.error('El producto debe tener un nombre válido', 'Error de Producto');
        return false;
    }

    if (typeof producto.precio !== 'number' || isNaN(producto.precio) || producto.precio < 0) {
        notificacion.error('El precio del producto no es válido', 'Error de Precio');
        return false;
    }

    let carrito = CartUtils.validate(CartUtils.get());
    const index = CartUtils.findIndex(carrito, producto);
    const cantidadSolicitada = producto.cantidad || 1;
    const cantidadEnCarrito = index > -1 ? carrito[index].cantidad : 0;
    const cantidadTotal = cantidadEnCarrito + cantidadSolicitada;

    try {
        notificacion.info('Verificando disponibilidad...', 'Procesando', 2000);
        
        // Verificar stock si la función existe
        if (typeof window.verificarStockDisponible === 'function') {
            const verificacion = await window.verificarStockDisponible(
                producto.id || producto.nombre, 
                producto.talla || 'M', 
                cantidadTotal
            );
            
            if (!verificacion.disponible) {
                notificacion.error(
                    `${verificacion.mensaje}\n\nStock disponible: ${verificacion.stockActual || 0} unidades`,
                    'Stock Insuficiente'
                );
                return false;
            }
        }

        // Preparar producto para el carrito
        const productoCarrito = {
            id: producto.id || producto.nombre,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            talla: producto.talla || 'M',
            cantidad: cantidadSolicitada,
            imagen: producto.imagen || CART_CONFIG.emptyImage,
            fechaAgregado: new Date().toISOString()
        };

        // Actualizar o agregar producto
        if (index > -1) {
            carrito[index].cantidad = cantidadTotal;
            carrito[index].fechaAgregado = new Date().toISOString();
            notificacion.exito(
                `Cantidad actualizada para "${producto.nombre}"\nNueva cantidad: ${cantidadTotal}`,
                'Producto Actualizado'
            );
        } else {
            carrito.push(productoCarrito);
            notificacion.exito(
                `"${producto.nombre}" agregado exitosamente\nCantidad: ${cantidadSolicitada}`,
                '¡Producto Agregado!'
            );
        }

        CartUtils.save(carrito);
        return true;

    } catch (error) {
        console.error('Error al agregar producto:', error);
        notificacion.error(
            'No se pudo agregar el producto. Intenta nuevamente.',
            'Error de Conexión'
        );
        return false;
    }
}















/**
 * Generar HTML de carrito vacío - Versión moderna
 */
function generateEmptyCartHTML() {
    return `
        <div class="empty-cart-container">
            <div class="empty-cart-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="m1 1 4 4 13 2 2 13v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1z"></path>
                    <path d="M16 8V6a4 4 0 0 0-8 0v2"></path>
                </svg>
            </div>
            <h3 class="empty-cart-title">Tu carrito está vacío</h3>
            <p class="empty-cart-description">¡Descubre nuestros increíbles productos y añade algunos a tu carrito!</p>
            <div class="empty-cart-suggestions">
                <div class="suggestion-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
                        <path d="M12 22s8-4 8-10V7l-8-5-8 5v5c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Productos de calidad garantizada</span>
                </div>
                <div class="suggestion-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m3 11 18-5v12L3 14v-3z"/>
                        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
                    </svg>
                    <span>Envío gratuito disponible</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generar HTML de loading - Versión moderna
 */
function generateLoadingHTML() {
    return `
        <div class="loading-container">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <h3 class="loading-title">Validando Disponibilidad</h3>
            <p class="loading-description">Verificando stock en tiempo real...</p>
            <div class="loading-progress">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;
}

/**
 * Generar HTML de producto en carrito - Versión moderna
 */
function generateCartItemHTML(item, index) {
    const subtotal = (item.precio * item.cantidad).toFixed(2);
    
    return `
        <div class="modern-cart-item" data-item-index="${index}">
            <div class="item-image-container">
                <img src="${item.imagen || CART_CONFIG.emptyImage}" 
                    alt="${item.nombre}" 
                    class="item-image"
                    onerror="this.src='${CART_CONFIG.emptyImage}'" />
                <div class="quantity-badge">${item.cantidad}</div>
            </div>
            
            <div class="item-details">
                <h4 class="item-name">${item.nombre}</h4>
                <div class="item-meta">
                    <span class="item-size">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        Talla ${item.talla}
                    </span>
                    <span class="item-unit-price">$${item.precio.toFixed(2)} c/u</span>
                </div>
            </div>
            
            <div class="item-actions">
                <div class="price-section">
                    <span class="item-total">$${subtotal}</span>
                </div>
                <button class="btn-remove" 
                        onclick="eliminarDelCarrito('${item.nombre.replace(/'/g, "\\'")}', '${item.talla}')" 
                        title="Eliminar producto"
                        aria-label="Eliminar ${item.nombre}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

/**
 * Mostrar modal del carrito - Versión moderna
 */
async function mostrarModalCarrito() {
    const modal = document.getElementById('modalCarrito');
    const body = document.getElementById('modalCarritoBody');

    if (!modal || !body) {
        notificacion.error('No se encontró la interfaz del carrito en la página', 'Error del Sistema');
        return;
    }

    let carrito = CartUtils.validate(CartUtils.get());
    
    // Guardar carrito limpio
    if (carrito.length !== CartUtils.get().length) {
        CartUtils.save(carrito);
        notificacion.info('Se limpiaron productos inválidos del carrito', 'Carrito Actualizado');
    }

    if (carrito.length === 0) {
        body.innerHTML = generateEmptyCartHTML();
    } else {
        body.innerHTML = generateLoadingHTML();
        
        try {
            // Validar disponibilidad si la función existe
            if (typeof window.validarDisponibilidadCarrito === 'function') {
                const validacion = await window.validarDisponibilidadCarrito(carrito);
                const productosValidos = [];
                const productosInvalidos = [];
                
                carrito.forEach((item, i) => {
                    const resultado = validacion.resultados[i];
                    if (resultado && resultado.disponible) {
                        productosValidos.push(item);
                    } else {
                        productosInvalidos.push({ 
                            ...item, 
                            stockActual: resultado ? resultado.stockActual : 0 
                        });
                    }
                });
                
                if (productosInvalidos.length > 0) {
                    CartUtils.save(productosValidos);
                    const listaProductos = productosInvalidos
                        .map(p => `• ${p.nombre} (Solicitado: ${p.cantidad}, Disponible: ${p.stockActual})`)
                        .join('\n');
                    
                    notificacion.advertencia(
                        `Se removieron productos con stock insuficiente:\n\n${listaProductos}`,
                        'Stock Actualizado', 8000
                    );
                }
                
                carrito = productosValidos;
            }
            
        } catch (error) {
            console.warn('Error validando stock:', error);
            notificacion.advertencia(
                'No se pudo validar el stock completamente. Los productos se muestran según última información.',
                'Advertencia de Stock', 6000
            );
        }
        
        // Mostrar carrito final
        if (carrito.length === 0) {
            body.innerHTML = generateEmptyCartHTML();
        } else {
            const total = CartUtils.calculateTotal(carrito);
            const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            
            body.innerHTML = `
                <div class="modern-cart-container">
                    <div class="cart-header">
                        <div class="cart-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="m1 1 4 4 13 13v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4H4l-3-7"></path>
                                <path d="M8 12l8-8"></path>
                            </svg>
                            <h2>Mi Carrito</h2>
                        </div>
                        <div class="cart-summary">
                            <span class="items-count">${totalItems} artículo${totalItems !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    
                    <div class="cart-items-container">
                        ${carrito.map((item, index) => generateCartItemHTML(item, index)).join('')}
                    </div>
                    
                    <div class="cart-summary-section">
                        <div class="summary-row">
                            <span class="summary-label">Subtotal</span>
                            <span class="summary-value">$${total.toFixed(2)}</span>
                        </div>
                        <div class="summary-row total-row">
                            <span class="summary-label">Total</span>
                            <span class="summary-value total-amount">$${total.toFixed(2)}</span>
                        </div>
                        <div class="savings-info">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10 1.14 0 2.25-.16 3.33-.47"></path>
                                <path d="m22 12-8.5 8.5a1.94 1.94 0 0 1-2.76 0L2 12"></path>
                            </svg>
                            <span>Envío gratuito disponible</span>
                        </div>
                    </div>
                    
                    <div class="cart-actions">
                        <button class="btn btn-secondary" onclick="cerrarModalCarrito()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                            Seguir Comprando
                        </button>
                        
                        <button class="btn btn-danger" onclick="vaciarCarrito()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                            </svg>
                            Vaciar Carrito
                        </button>
                        
                        <button class="btn btn-whatsapp" onclick="procesarCompraWhatsApp()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Comprar por WhatsApp
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Mostrar modal
    modal.style.display = 'flex';
    
    // Eventos del modal
    modal.onclick = (e) => { 
        if (e.target === modal) cerrarModalCarrito(); 
    };
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.onclick = cerrarModalCarrito;
    
    // Enfocar el modal para accesibilidad
    modal.setAttribute('tabindex', '-1');
    modal.focus();
}

































let carritoPendiente = [];

/** Abrir modal de confirmación con carrito pendiente */
async function procesarCompraWhatsApp() {
    const carrito = CartUtils.get();
    
    if (carrito.length === 0) {
        notificacion.error('Tu carrito está vacío', 'No hay productos');
        return false;
    }

    // Guardamos carrito pendiente
    carritoPendiente = carrito;

    // Total y unidades
    const total = CartUtils.calculateTotal(carrito);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

    // Mostrar total en modal
    const detalleTotal = document.getElementById("detalleTotal");
    if (detalleTotal) {
        detalleTotal.textContent = `🛒 ${totalItems} productos - TOTAL: $${total.toFixed(2)}`;
    }

    // Mostrar modal usando CSS
    const modal = document.getElementById("confirmacionModal");
    if (modal) {
        modal.style.display = "block"; // solo cambiamos display
    }
}

/** Cerrar modal de confirmación */
function cerrarConfirmacion() {
    const modal = document.getElementById("confirmacionModal");
    if (modal) modal.style.display = "none";
    carritoPendiente = [];
}

/** Confirmar compra y continuar flujo */
async function confirmarCompra() {
    const metodoRadio = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodoRadio) {
        notificacion.error('Debes seleccionar un método de pago.', 'Método de Pago');
        return false;
    }

    const metodo = metodoRadio.value;
    const carrito = carritoPendiente;
    if (!carrito.length) return;

    try {
        notificacion.info('Procesando tu compra...', '🔄 Procesando Compra', 0);

        // Validar disponibilidad final
        if (typeof window.validarDisponibilidadCarrito === 'function') {
            const validacion = await window.validarDisponibilidadCarrito(carrito);
            if (!validacion.todoDisponible) {
                notificacion.error('Algunos productos ya no tienen stock suficiente.', 'Stock Insuficiente');
                mostrarModalCarrito();
                return false;
            }
        }

        // Reducir stock
        if (typeof window.reducirStockEnFirebase === 'function') {
            const resultadoStock = await window.reducirStockEnFirebase(carrito);
            if (!resultadoStock.exito) {
                notificacion.error(`Error: ${resultadoStock.mensaje}`, 'Error de Procesamiento');
                return false;
            }
        }

        // Registrar venta
        if (typeof window.registrarVenta === 'function') {
            await window.registrarVenta(carrito, {
                origen: 'tienda_online',
                fecha: new Date().toISOString(),
                total: CartUtils.calculateTotal(carrito),
                metodoPago: metodo
            });
        }

        // Enviar a WhatsApp
        if (typeof window.enviarCarritoWhatsApp === 'function') {
            await enviarCarritoWhatsApp(carrito, metodo);
        }

        // Limpiar carrito y cerrar modales
        CartUtils.clear();
        cerrarModalCarrito();
        cerrarConfirmacion();

        notificacion.exito(
            '¡Compra procesada correctamente!\n• Stock actualizado\n• Datos enviados\n• Redirigiendo a WhatsApp...',
            '🎉 ¡Compra Exitosa!', 6000
        );

        if (typeof window.reiniciarProductos === 'function') {
            setTimeout(window.reiniciarProductos, 1000);
        }

        return true;

    } catch (error) {
        console.error('Error procesando compra:', error);
        notificacion.error('Error inesperado al procesar la compra. Intenta nuevamente.', 'Error Inesperado');
        return false;
    }
}

// Mostrar u ocultar datos de transferencia
document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const datos = document.getElementById("datosTransferencia");
        if (datos) datos.style.display = this.value === "Transferencia" ? "block" : "none";
    });
});

// Copiar texto de cédula o cuenta
function copiarTexto(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) {
        navigator.clipboard.writeText(el.innerText).then(() => {
            alert("✅ Copiado: " + el.innerText);
        });
    }
}


/** Confirmar compra y continuar flujo */
async function confirmarCompra() {
    const metodoRadio = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodoRadio) {
    notificacion.error('Debes seleccionar un método de pago.', 'Método de Pago');
    return false;
    }

    const metodo = metodoRadio.value;
    const carrito = carritoPendiente;
    if (!carrito.length) return;

    try {
    notificacion.info('Procesando tu compra...', '🔄 Procesando Compra', 0);

    // Validar disponibilidad final
    if (typeof window.validarDisponibilidadCarrito === 'function') {
        const validacion = await window.validarDisponibilidadCarrito(carrito);
        if (!validacion.todoDisponible) {
        notificacion.error('Algunos productos ya no tienen stock suficiente. Revisa tu carrito.', 'Stock Insuficiente');
        mostrarModalCarrito();
        return false;
        }
    }

    // Reducir stock
    if (typeof window.reducirStockEnFirebase === 'function') {
        const resultadoStock = await window.reducirStockEnFirebase(carrito);
        if (!resultadoStock.exito) {
        notificacion.error(`Error: ${resultadoStock.mensaje}`, 'Error de Procesamiento');
        return false;
        }
    }

    // Registrar venta
    if (typeof window.registrarVenta === 'function') {
        await window.registrarVenta(carrito, { 
        origen: 'tienda_online', 
        fecha: new Date().toISOString(),
        total: CartUtils.calculateTotal(carrito),
        metodoPago: metodo
        });
    }

    // Enviar a WhatsApp con método de pago
    await enviarCarritoWhatsApp(carrito, metodo);

    // Limpiar carrito y cerrar modales
    CartUtils.clear();
    cerrarModalCarrito();
    cerrarConfirmacion();

    notificacion.exito(
        '¡Compra procesada correctamente!\n• Stock actualizado\n• Datos enviados\n• Redirigiendo a WhatsApp...',
        '🎉 ¡Compra Exitosa!', 6000
    );

    if (typeof window.reiniciarProductos === 'function') {
        setTimeout(window.reiniciarProductos, 1000);
    } 
    
    return true;

    } catch (error) {
    console.error('Error procesando compra:', error);
    notificacion.error('Error inesperado al procesar la compra. Intenta nuevamente.', 'Error Inesperado');
    return false;
    }
}



/**
 * Enviar carrito a WhatsApp (PDF + texto)
 */
async function enviarCarritoWhatsApp(carrito, metodoPago) {
    try {
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            await generatePDF(carrito, metodoPago);
        }
        enviarTextoWhatsApp(carrito, metodoPago);
    } catch (error) {
        console.warn('Error generando PDF:', error);
        enviarTextoWhatsApp(carrito, metodoPago);
    }
}

/**  
 * Generar PDF del pedido  
 */ 
async function generatePDF(carrito, metodoPago) {     
    try {         
        const { jsPDF } = window.jspdf;         
        const doc = new jsPDF();  

        // --- Función auxiliar para convertir imagen a Base64
        async function getBase64FromUrl(url) {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // Encabezado         
        doc.setFontSize(20);         
        doc.setTextColor(40);         
        doc.text('¡Gracias por tu compra!', 105, 25, { align: 'center' });                  
        doc.setFontSize(14);         
        doc.setTextColor(80);         
        doc.text('Detalle de tu pedido', 105, 35, { align: 'center' });                  
        doc.setFontSize(10);         
        doc.setTextColor(120);         
        doc.text(`Fecha: ${new Date().toLocaleString('es-EC')}`, 105, 45, { align: 'center' });          

        let y = 60;         
        const margin = 15;         
        doc.setDrawColor(200);         
        doc.line(margin, y - 5, 195, y - 5);          

        for (const [index, item] of carrito.entries()) {             
            if (y > 250) {                 
                doc.addPage();                 
                y = 30;             
            }              

            if (item.imagen && item.imagen !== CART_CONFIG.emptyImage) {                 
                try {                     
                    const imgBase64 = await getBase64FromUrl(item.imagen);                     
                    doc.addImage(imgBase64, 'JPEG', margin, y, 25, 25);                 
                } catch {                     
                    doc.setDrawColor(200);                     
                    doc.rect(margin, y, 25, 25);                     
                    doc.setFontSize(8);                     
                    doc.setTextColor(150);                     
                    doc.text('Sin imagen', margin + 12.5, y + 15, { align: 'center' });                 
                }             
            } else {                 
                doc.setDrawColor(200);                 
                doc.rect(margin, y, 25, 25);             
            }              

            const precio = item.precio || 0;             
            const cantidad = item.cantidad || 0;             
            const subtotal = precio * cantidad;              

            doc.setFontSize(12);             
            doc.setTextColor(40);             
            doc.text(`${index + 1}. ${item.nombre}`, margin + 30, y + 8);                          
            doc.setFontSize(10);             
            doc.setTextColor(80);             
            doc.text(`Talla: ${item.talla}`, margin + 30, y + 15);             
            doc.text(`Cantidad: ${cantidad}`, margin + 30, y + 20);             
            doc.text(`Precio unitario: ${precio.toFixed(2)}`, margin + 30, y + 25);                          
            doc.setFontSize(11);             
            doc.setTextColor(40);             
            doc.text(`Subtotal: ${subtotal.toFixed(2)}`, margin + 120, y + 25);              
            y += 35;                          
            if (index < carrito.length - 1) {                 
                doc.setDrawColor(230);                 
                doc.line(margin, y - 5, 195, y - 5);             
            }         
        }          

        // Totales         
        const total = CartUtils.calculateTotal(carrito);         
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);                  
        y += 10;         
        doc.setDrawColor(100);         
        doc.line(margin, y, 195, y);                  
        y += 15;         
        doc.setFontSize(14);         
        doc.setTextColor(40);         
        doc.text(`Total de productos: ${totalItems}`, margin, y);         
        doc.text(`TOTAL A PAGAR: ${total.toFixed(2)}`, 195, y, { align: 'right' });          
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(50);
        doc.text(`Método de pago: ${metodoPago}`, margin, y);

        // Pie
        y += 20;         
        doc.setFontSize(9);         
        doc.setTextColor(120);         
        doc.text('Este documento es un resumen de tu pedido. Para confirmar tu compra, envía este PDF por WhatsApp.', 105, y, { align: 'center', maxWidth: 160 });          

        // Logo en footer
        try {
            const logoBase64 = await getBase64FromUrl("./src/img/logofoter.png");
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                const pageHeight = doc.internal.pageSize.height;
                const pageWidth = doc.internal.pageSize.width;
                doc.addImage(logoBase64, "PNG", 0, pageHeight - 30, pageWidth, 30);
            }
        } catch (e) {
            console.warn("No se pudo cargar el logo del footer:", e);
        }

        doc.save(`pedido-${new Date().getTime()}.pdf`);         
        return true;              
    } catch (error) {         
        console.error('Error generando PDF:', error);         
        throw error;     
    } 
}

/**
 * Enviar mensaje de texto a WhatsApp
 */
function enviarTextoWhatsApp(carrito, metodoPago) {
    const total = CartUtils.calculateTotal(carrito);
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    let mensaje = '🛒 *¡Hola! he adquirido estos productos exitosamente:*\n\n';
    
    carrito.forEach((item, index) => {
        const subtotal = (item.precio * item.cantidad);
        mensaje += `*${index + 1}. ${item.nombre}*\n`;
        mensaje += `   📏 Talla: ${item.talla}\n`;
        mensaje += `   📦 Cantidad: ${item.cantidad}\n`;
        mensaje += `   💰 Precio: ${subtotal.toFixed(2)}\n\n`;
    });
    
    mensaje += `📊 *Resumen de compra:*\n`;
    mensaje += `• Total de productos: ${totalItems}\n`;
    mensaje += `• *Total a pagar: ${total.toFixed(2)}*\n`;
    mensaje += `• Método de pago: *${metodoPago}*\n\n`;
    mensaje += `📅 Fecha: ${new Date().toLocaleString('es-EC')}\n\n`;
    mensaje += `¡Gracias! 😊\nAdjunta el PDF que se descargó automáticamente ✅`;
    
    const urlWhatsApp = `https://wa.me/${CART_CONFIG.whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
    notificacion.info('Redirigiendo a WhatsApp...', '💬 Abriendo WhatsApp', 3000);
    setTimeout(() => { window.open(urlWhatsApp, '_blank'); }, 1000);
}


/**
 * Eliminar producto específico del carrito
 */
function eliminarDelCarrito(nombre, talla) {
    let carrito = CartUtils.get();
    const productoEliminado = carrito.find(item => 
        item.nombre === nombre && (item.talla || 'M') === talla
    );
    
    carrito = carrito.filter(item => 
        !(item.nombre === nombre && (item.talla || 'M') === talla)
    );
    
    CartUtils.save(carrito);
    
    if (productoEliminado) {
        notificacion.info(
            `"${productoEliminado.nombre}" (${productoEliminado.talla}) removido del carrito`, 
            'Producto Eliminado'
        );
    }
    
    // Actualizar vista del modal
    mostrarModalCarrito();
}

/**
 * Vaciar completamente el carrito
 */
function vaciarCarrito() {
    const carrito = CartUtils.get();
    
    if (carrito.length === 0) {
        notificacion.info('Tu carrito ya está vacío', 'Carrito Vacío');
        return;
    }
    
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    if (confirm(`¿Estás seguro de vaciar el carrito?\n\nSe eliminarán ${carrito.length} producto(s) (${totalItems} unidades).`)) {
        CartUtils.clear();
        mostrarModalCarrito();
        notificacion.exito(
            `Carrito vaciado exitosamente\n${carrito.length} productos eliminados`, 
            '🗑️ Carrito Limpio'
        );
    }
}

/**
 * Cancelar pedido y restaurar stock
 */
async function cancelarPedido(motivoCancelacion = 'Cancelado por el usuario') {
    const carrito = CartUtils.get();
    
    if (carrito.length === 0) {
        notificacion.info('No hay productos para cancelar', 'Carrito Vacío');
        return;
    }
    
    const productosTexto = carrito
        .map(item => `• ${item.nombre} (${item.talla}) x${item.cantidad}`)
        .join('\n');
    
    if (!confirm(`¿Cancelar pedido?\n\n${productosTexto}\n\nSe restaurará el stock de estos productos.`)) {
        return;
    }
    
    try {
        notificacion.info('Cancelando pedido y restaurando stock...', '🔄 Cancelando Pedido', 0);
        
        // Restaurar stock si la función existe
        if (typeof window.restaurarStockEnFirebase === 'function') {
            const resultado = await window.restaurarStockEnFirebase(carrito);
            
            if (resultado.exito) {
                CartUtils.clear();
                cerrarModalCarrito();
                
                notificacion.exito(
                    `Pedido cancelado exitosamente\n• ${carrito.length} productos procesados\n• Stock restaurado correctamente`,
                    '✅ Cancelación Completada', 6000
                );
                
                // Reiniciar productos si la función existe
                if (typeof window.reiniciarProductos === 'function') {
                    setTimeout(window.reiniciarProductos, 1000);
                }
            } else {
                notificacion.error(`Error en la cancelación: ${resultado.mensaje}`, 'Error de Cancelación');
            }
        } else {
            // Si no hay función de restaurar stock, solo limpiar carrito
            CartUtils.clear();
            cerrarModalCarrito();
            notificacion.advertencia(
                'Carrito vaciado. Nota: No se pudo restaurar el stock automáticamente.',
                'Pedido Cancelado'
            );
        }
        
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        notificacion.error('Error inesperado al cancelar el pedido.', 'Error Inesperado');
    }
}

/**
 * Cerrar modal del carrito
 */
function cerrarModalCarrito() {
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        modal.style.display = 'none';
        modal.removeAttribute('tabindex');
    }
}

/**
 * Función auxiliar para convertir imagen a base64
 */
function getBase64FromUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = this.naturalHeight;
            canvas.width = this.naturalWidth;
            ctx.drawImage(this, 0, 0);
            const dataURL = canvas.toDataURL();
            resolve(dataURL);
        };
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Obtener información detallada del carrito
 */
function obtenerInformacionCarrito() {
    return CartUtils.getInfo();
}

/**
 * Limpiar productos corruptos del carrito
 */
function limpiarCarritoCorrupto() {
    const carritoOriginal = CartUtils.get();
    const carritoLimpio = CartUtils.validate(carritoOriginal);
    
    if (carritoLimpio.length !== carritoOriginal.length) {
        CartUtils.save(carritoLimpio);
        const eliminados = carritoOriginal.length - carritoLimpio.length;
        notificacion.info(
            `Se limpiaron ${eliminados} producto(s) inválido(s) del carrito`,
            'Carrito Actualizado'
        );
    }
    
    return carritoLimpio;
}

/**
 * Actualizar contador del carrito
 */
function actualizarContadorCarrito() {
    CartUtils.updateCounter();
}

// ===================== EXPORTACIÓN GLOBAL =====================

// Asignar funciones al objeto window para uso global
if (typeof window !== 'undefined') {
    Object.assign(window, {
        // Funciones principales del carrito
        agregarAlCarrito,
        mostrarModalCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        cerrarModalCarrito,
        enviarCarritoWhatsApp,
        procesarCompraWhatsApp,
        cancelarPedido,
        
        // Utilidades del carrito
        obtenerCarrito: () => CartUtils.get(),
        obtenerInformacionCarrito,
        limpiarCarritoCorrupto,
        actualizarContadorCarrito,
        
        // Configuración (solo lectura)
        CART_CONFIG: Object.freeze(CART_CONFIG)
    });
}

// ===================== INICIALIZACIÓN =====================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar dependencias
    if (!validarSistemaNotificaciones()) {
        console.warn('⚠️ Sistema de Notificaciones no encontrado. El carrito funcionará con notificaciones básicas.');
    }
    
    // Limpiar y validar carrito al inicio
    const carritoLimpio = CartUtils.validate(CartUtils.get());
    CartUtils.save(carritoLimpio);
    
    console.log('✅ Sistema de Carrito inicializado correctamente');
    console.log(`📦 Productos en carrito: ${carritoLimpio.length}`);
    
    // Mostrar información del carrito si hay productos
    if (carritoLimpio.length > 0) {
        const info = CartUtils.getInfo();
        console.log(`💰 Total del carrito: ${info.total.toFixed(2)}`);
        console.log(`📊 Total de unidades: ${info.totalItems}`);
    }
});

// Exportación para módulos ES6 (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        agregarAlCarrito,
        mostrarModalCarrito,
        eliminarDelCarrito,
        vaciarCarrito,
        cerrarModalCarrito,
        procesarCompraWhatsApp,
        obtenerInformacionCarrito,
        limpiarCarritoCorrupto,
        actualizarContadorCarrito,
        CART_CONFIG
    };
}