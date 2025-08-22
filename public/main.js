// main.js - Versión CORREGIDA que funciona sin módulos 
// ES6

// Variables globales
let funcionesCarrito = null;


// Función para cargar funciones del carrito (si existen)
async function cargarFuncionesCarrito() {
    try {
        // Verificar si las funciones del carrito existen globalmente
        if (window.mostrarModalCarrito && window.agregarAlCarrito) {
            funcionesCarrito = {
                mostrarModalCarrito: window.mostrarModalCarrito,
                agregarAlCarrito: window.agregarAlCarrito,
                actualizarContadorCarrito: window.actualizarContadorCarrito
            };
            console.log('✅ Funciones de carrito cargadas');
        }
    } catch (error) {
        console.warn('⚠️ Funciones de carrito no disponibles, usando funciones básicas');
    }
}

// Función para cargar header
async function cargarHeader() {
    try {
        const response = await fetch('./header.html');
        if (response.ok) {
            const html = await response.text();
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = html;
                console.log('✅ Header cargado correctamente');
                
                // Configurar eventos del header después de cargarlo
                setTimeout(() => configurarEventosHeader(), 100);
            }
        } else {
            console.warn('⚠️ No se pudo cargar header.html');
        }
    } catch (error) {
        console.warn('⚠️ Error cargando header:', error);
    }
}

// Función para configurar eventos del header
function configurarEventosHeader() {
    // Evento del carrito
    const carritoIcono = document.querySelector('.cart');
    if (carritoIcono) {
        carritoIcono.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (funcionesCarrito?.mostrarModalCarrito) {
                funcionesCarrito.mostrarModalCarrito();
            } else {
                mostrarCarritoBasico();
            }
        });
        console.log('✅ Evento del carrito configurado');
    }

    // Actualizar contador si la función existe
    if (funcionesCarrito?.actualizarContadorCarrito) {
        funcionesCarrito.actualizarContadorCarrito();
    } else {
        actualizarContadorBasico();
    }
}

// Función para mostrar estado de carga
function mostrarCargando() {
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando productos desde Firebase...</p>
            </div>
        `;
    }
}

// Función CORREGIDA para mostrar productos
function mostrarProductos(productos) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('❌ No se encontró productsGrid');
        return;
    }

    console.log(`🎯 Mostrando ${productos.length} productos`);

    if (!productos || productos.length === 0) {
        productsGrid.innerHTML = `
            <div class="sin-resultados">
                <i class="fas fa-search"></i>
                <p>No hay productos disponibles</p>
                <button onclick="window.location.reload()" class="btn-retry">🔄 Recargar</button>
                <button onclick="reiniciarProductos()" class="btn-reiniciar">🔧 Reintentar</button>
            </div>
        `;
        return;
    }

    // Generar HTML con las clases CSS CORRECTAS
    const productosHTML = productos.map(producto => {
        // Validar datos del producto
        const nombre = producto.nombre || 'Producto sin nombre';
        const precio = parseFloat(producto.precio || 0);
        const stock = parseInt(producto.stock || 0);
        const imagen = producto.imagen || 'https://via.placeholder.com/300x300?text=Sin+Imagen';
        const marca = producto.marca || 'Sin marca';
        const descripcion = producto.descripcion || '';
        
        return `
        <div class="product-card" data-producto-id="${producto.id}">
            <div class="product-card__image-wrapper">
                <img class="product-card__image" 
                    src="${imagen}" 
                    alt="${nombre}" 
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'">
                ${producto.descuento ? `<div class="product-card__badge">-${producto.descuento}%</div>` : ''}
            </div>
            <div class="product-card__content">
                <div class="product-card__header">
                    <h3 class="product-card__title">${nombre}</h3>
                    <p class="product-card__brand">${marca}</p>
                </div>
                
                ${descripcion ? `<p class="product-card__description">${descripcion}</p>` : ''}
                
                <div class="product-card__meta">
                    ${producto.tallas ? `<p><strong>Tallas:</strong> ${Array.isArray(producto.tallas) ? producto.tallas.join(', ') : producto.tallas}</p>` : ''}
                    <p><strong>Stock:</strong> ${stock} disponibles</p>
                </div>
                
                <div class="product-card__price">
                    <span class="product-card__price-current">$${precio.toFixed(2)}</span>
                    ${producto.precioAnterior ? `<span class="product-card__price-old">$${parseFloat(producto.precioAnterior).toFixed(2)}</span>` : ''}
                </div>
                
                <button class="product-card__btn" onclick="agregarAlCarritoHandler('${producto.id}')">
                    🛒 Agregar al carrito
                </button>
            </div>
        </div>
        `;
    }).join('');

    productsGrid.innerHTML = productosHTML;
    console.log(`✅ ${productos.length} productos mostrados correctamente`);
}

// Función para mostrar errores
function mostrarError(error) {
    console.error('❌ Error mostrado al usuario:', error);
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar productos</p>
                <p><small>${error.message}</small></p>
                <button onclick="window.location.reload()" class="btn-retry">🔄 Recargar página</button>
                <button onclick="reiniciarProductos()" class="btn-reiniciar">🔧 Reintentar</button>
                <button onclick="window.verificarFirebase()" class="btn-debug">🔍 Debug Firebase</button>
            </div>
        `;
    }
}

// Función para configurar toggles de vista
function configurarVistas() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');
    
    if (viewButtons.length && productsGrid) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const view = btn.dataset.view;
                productsGrid.className = view === 'list' ? 'products-list' : 'products-grid';
                console.log(`👀 Vista cambiada a: ${view}`);
            });
        });
        console.log('✅ Botones de vista configurados');
    }
}

// ==================== FUNCIONES DEL CARRITO ====================

// Handler global para agregar al carrito
function agregarAlCarritoHandler(productoId) {
    console.log(`🛒 Agregando producto ${productoId} al carrito`);
    
    if (funcionesCarrito?.agregarAlCarrito) {
        // Obtener datos del producto desde el DOM
        const card = document.querySelector(`[data-producto-id="${productoId}"]`);
        if (card) {
            const producto = {
                id: productoId,
                nombre: card.querySelector('.product-card__title')?.textContent || 'Producto',
                precio: parseFloat(card.querySelector('.product-card__price-current')?.textContent.replace('$', '') || 0),
                imagen: card.querySelector('.product-card__image')?.src || '',
                talla: 'M', // Default
                cantidad: 1
            };
            funcionesCarrito.agregarAlCarrito(producto);
        }
    } else {
        agregarAlCarritoBasico(productoId);
    }
}

// Función básica de carrito (fallback)
function agregarAlCarritoBasico(productoId) {
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    const productoExistente = carrito.find(item => item.id === productoId);
    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({ id: productoId, cantidad: 1 });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorBasico();
    
    // Notificación simple
    mostrarNotificacionBasica('✅ Producto agregado al carrito');
}

// Actualizar contador básico
function actualizarContadorBasico() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const badge = document.querySelector('.cart .badge');
    if (badge) {
        badge.textContent = total;
    }
}

// Modal de carrito básico
function mostrarCarritoBasico() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    if (carrito.length === 0) {
        mostrarNotificacionBasica('🛒 El carrito está vacío');
        return;
    }
    
    let mensaje = 'Productos en tu carrito:\\n\\n';
    carrito.forEach(item => {
        mensaje += `• Producto ID: ${item.id} - Cantidad: ${item.cantidad}\\n`;
    });
    
    alert(mensaje);
}

// Notificación básica
function mostrarNotificacionBasica(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #4CAF50; color: white; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 600; max-width: 300px;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => notificacion.remove(), 3000);
}

// ==================== FUNCIONES DE DEBUG ====================

function reiniciarProductos() {
    console.log('🔄 Reiniciando productos...');
    mostrarCargando();
    
    // Limpiar cache si la función existe
    if (window.limpiarCacheProductos) {
        window.limpiarCacheProductos();
    }
    
    // Recargar productos
    setTimeout(async () => {
        try {
            if (window.obtenerProductos) {
                const productos = await window.obtenerProductos(true);
                mostrarProductos(productos);
                console.log('✅ Productos reiniciados exitosamente');
            } else {
                throw new Error('Función obtenerProductos no disponible');
            }
        } catch (error) {
            console.error('❌ Error reiniciando productos:', error);
            mostrarError(error);
        }
    }, 500);
}

function mostrarProductosDebug() {
    if (window.obtenerProductos) {
        window.obtenerProductos().then(productos => {
            console.log('📦 Productos actuales:', productos);
            console.table(productos);
        });
    } else {
        console.error('❌ Función obtenerProductos no disponible');
    }
}

// ==================== INICIALIZACIÓN PRINCIPAL ====================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando aplicación...');
        
        // 1. Cargar funciones del carrito
        await cargarFuncionesCarrito();
        
        // 2. Cargar header
        await cargarHeader();
        
        // 3. Mostrar loading
        mostrarCargando();
        
        // 4. Esperar a que las funciones de productos estén disponibles
        let intentos = 0;
        while (!window.inicializarProductos && intentos < 10) {
            console.log(`⏳ Esperando funciones de productos... (${intentos + 1}/10)`);
            await new Promise(resolve => setTimeout(resolve, 500));
            intentos++;
        }
        
        if (!window.inicializarProductos) {
            throw new Error('Las funciones de productos no están disponibles');
        }
        
        // 5. Cargar productos
        console.log('🔥 Cargando productos desde Firebase...');
        const productos = await window.inicializarProductos();
        
        // 6. Mostrar productos
        mostrarProductos(productos);
        
        // 7. Configurar vistas
        configurarVistas();
        
        // 8. Configurar scroll suave
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
        
        console.log('🎉 Aplicación cargada completamente');
        
    } catch (error) {
        console.error('❌ Error en la inicialización:', error);
        mostrarError(error);
    }
});

// Hacer funciones disponibles globalmente
window.agregarAlCarritoHandler = agregarAlCarritoHandler;
window.reiniciarProductos = reiniciarProductos;
window.mostrarProductosDebug = mostrarProductosDebug;

// 🔧 Hacer mostrarProductos disponible globalmente para filtros
window.mostrarProductos = mostrarProductos;

// 🔧 Función para conectar con el sistema de filtros
window.conectarFiltros = () => {
    console.log('🔗 Conectando sistema de filtros con main.js');
    
    // Cuando los productos se actualicen por filtros
    document.addEventListener('productosActualizados', (event) => {
        const { productos, contexto } = event.detail;
        console.log(`📡 Evento recibido: ${contexto} con ${productos.length} productos`);
        mostrarProductos(productos);
    });
    
    console.log('✅ Filtros conectados exitosamente');
};

// Auto-conectar filtros cuando estén disponibles
setTimeout(() => {
    if (window.conectarFiltros) {
        window.conectarFiltros();
    }
}, 1000);

console.log(`
🔧 FUNCIONES DE DEBUG DISPONIBLES:
- reiniciarProductos() : Recargar productos
- mostrarProductosDebug() : Ver productos en consola  
- window.verificarFirebase() : Verificar Firebase
`);


