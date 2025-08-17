// carrito_mostrar.js - Versión corregida SIN MÓDULOS

// Cargar header dinámicamente
async function loadHeader() {
    try {
        const response = await fetch('./header.html');
        if (response.ok) {
            const html = await response.text();
            const headerContainer = document.getElementById('header-container');
            if (headerContainer) {
                headerContainer.innerHTML = html;
                console.log('✅ Header cargado correctamente');
                
                // Pequeña espera para asegurar que el DOM esté listo
                setTimeout(configurarEventosHeader, 100);
            }
        } else {
            console.warn('⚠️ No se pudo cargar header.html');
        }
    } catch (error) {
        console.error('❌ Error cargando el header:', error);
    }
}

// Configurar eventos del header
function configurarEventosHeader() {
    // Asignar evento al icono del carrito
    const carritoIcono = document.querySelector('.cart');
    
    if (carritoIcono) {
        // Remover eventos anteriores para evitar duplicados
        carritoIcono.removeEventListener('click', handleCarritoClick);
        carritoIcono.addEventListener('click', handleCarritoClick);
        console.log('✅ Evento del carrito configurado');
    } else {
        console.warn('⚠️ No se encontró el icono del carrito (.cart)');
    }

    // Actualizar contador del carrito al cargar la página
    if (window.actualizarContadorCarrito) {
        window.actualizarContadorCarrito();
    } else {
        // Fallback si la función no está disponible aún
        setTimeout(() => {
            if (window.actualizarContadorCarrito) {
                window.actualizarContadorCarrito();
            }
        }, 500);
    }
}

// Handler para el click del carrito
function handleCarritoClick(e) {
    e.preventDefault();
    console.log('🛒 Click en carrito detectado');
    
    // Verificar que las funciones del carrito estén disponibles
    if (window.mostrarModalCarrito) {
        window.mostrarModalCarrito();
    } else {
        console.error('❌ La función mostrarModalCarrito no está disponible');
        // Fallback básico
        mostrarCarritoBasico();
    }
}

// Función de fallback básica
function mostrarCarritoBasico() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    let mensaje = 'Productos en tu carrito:\\n\\n';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = (item.precio || 0) * (item.cantidad || 1);
        total += subtotal;
        mensaje += `• ${item.nombre || 'Producto'}\\n`;
        mensaje += `  Talla: ${item.talla || 'N/A'}\\n`;
        mensaje += `  Cantidad: ${item.cantidad || 1}\\n`;
        mensaje += `  Subtotal: $${subtotal.toFixed(2)}\\n\\n`;
    });
    
    mensaje += `Total: $${total.toFixed(2)}`;
    alert(mensaje);
}

// Función para verificar si las dependencias están cargadas
function verificarDependencias() {
    const funciones = [
        'agregarAlCarrito',
        'mostrarModalCarrito', 
        'actualizarContadorCarrito'
    ];
    
    const faltantes = funciones.filter(fn => typeof window[fn] !== 'function');
    
    if (faltantes.length > 0) {
        console.warn('⚠️ Funciones de carrito faltantes:', faltantes);
        return false;
    }
    
    console.log('✅ Todas las funciones de carrito están disponibles');
    return true;
}

// Ejecutar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando carrito_mostrar...');
    
    try {
        // Cargar header
        await loadHeader();
        
        // Verificar dependencias con reintentos
        let intentos = 0;
        const maxIntentos = 10;
        
        const esperarDependencias = () => {
            if (verificarDependencias() || intentos >= maxIntentos) {
                if (intentos >= maxIntentos) {
                    console.warn('⚠️ Algunas funciones de carrito no están disponibles después de esperar');
                }
                return;
            }
            
            intentos++;
            console.log(`⏳ Esperando dependencias del carrito... (${intentos}/${maxIntentos})`);
            setTimeout(esperarDependencias, 500);
        };
        
        esperarDependencias();
        
    } catch (error) {
        console.error('❌ Error inicializando carrito_mostrar:', error);
    }
});

console.log('📦 carrito_mostrar.js cargado');