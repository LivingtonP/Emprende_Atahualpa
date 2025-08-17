// ==================== MENÚ HAMBURGUESA - JavaScript ====================
// Agregar este código al final de tu main.js o crear un archivo menu.js separado

// Función para configurar el menú hamburguesa
function configurarMenuHamburguesa() {
    console.log('🍔 Configurando menú hamburguesa...');
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (!menuToggle) {
        console.warn('⚠️ No se encontró .menu-toggle');
        return;
    }
    
    if (!navLinks) {
        console.warn('⚠️ No se encontró .nav-links');
        return;
    }
    
    // Función para abrir/cerrar el menú
    function toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🍔 Toggle menú clickeado');
        
        const isOpen = navLinks.classList.contains('show');
        
        if (isOpen) {
            // Cerrar menú
            navLinks.classList.remove('show');
            menuToggle.classList.remove('active');
            body.classList.remove('menu-open');
            console.log('❌ Menú cerrado');
        } else {
            // Abrir menú
            navLinks.classList.add('show');
            menuToggle.classList.add('active');
            body.classList.add('menu-open');
            console.log('✅ Menú abierto');
        }
    }
    
    // Función para cerrar el menú
    function cerrarMenu() {
        navLinks.classList.remove('show');
        menuToggle.classList.remove('active');
        body.classList.remove('menu-open');
        console.log('❌ Menú cerrado automáticamente');
    }
    
    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('touchstart', toggleMenu, { passive: false });
    
    // Cerrar menú al hacer click en un enlace
    const menuLinks = navLinks.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            cerrarMenu();
        });
    });
    
    // Cerrar menú al hacer click fuera de él
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            if (navLinks.classList.contains('show')) {
                cerrarMenu();
            }
        }
    });
    
    // Cerrar menú con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('show')) {
            cerrarMenu();
        }
    });
    
    // Cerrar menú al cambiar el tamaño de pantalla (responsive)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('show')) {
            cerrarMenu();
        }
    });
    
    console.log('✅ Menú hamburguesa configurado correctamente');
}

// ==================== HEADER CON MENÚ ====================

// Modificar la función configurarEventosHeader en main.js
function configurarEventosHeader() {
    console.log('🎯 Configurando eventos del header...');
    
    // 1. Configurar menú hamburguesa
    configurarMenuHamburguesa();
    
    // 2. Evento del carrito (código existente)
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

    // 3. Actualizar contador si la función existe
    if (funcionesCarrito?.actualizarContadorCarrito) {
        funcionesCarrito.actualizarContadorCarrito();
    } else {
        actualizarContadorBasico();
    }
    
    console.log('✅ Todos los eventos del header configurados');
}

// ==================== VERIFICACIÓN DE RENDER ====================

// Función para verificar el entorno
function verificarEntorno() {
    const isRender = window.location.hostname.includes('render') || 
                     window.location.hostname.includes('onrender');
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    console.log('🌍 Entorno detectado:', {
        hostname: window.location.hostname,
        isRender,
        isLocal,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
    });
    
    return { isRender, isLocal };
}

// ==================== DEBUG ESPECÍFICO PARA RENDER ====================

// Función de debug específica para Render
function debugRender() {
    const { isRender } = verificarEntorno();
    
    if (isRender) {
        console.log('🔧 MODO DEBUG RENDER ACTIVADO');
        
        // Verificar elementos después de un retraso
        setTimeout(() => {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            console.log('🔍 Debug elementos:', {
                menuToggle: menuToggle ? '✅ Encontrado' : '❌ NO encontrado',
                navLinks: navLinks ? '✅ Encontrado' : '❌ NO encontrado',
                headerContainer: document.getElementById('header-container') ? '✅' : '❌'
            });
            
            if (menuToggle) {
                console.log('🍔 Estilos del botón hamburguesa:', {
                    display: getComputedStyle(menuToggle).display,
                    visibility: getComputedStyle(menuToggle).visibility,
                    pointerEvents: getComputedStyle(menuToggle).pointerEvents,
                    zIndex: getComputedStyle(menuToggle).zIndex
                });
            }
            
            if (navLinks) {
                console.log('📱 Estilos del menú:', {
                    display: getComputedStyle(navLinks).display,
                    visibility: getComputedStyle(navLinks).visibility,
                    opacity: getComputedStyle(navLinks).opacity
                });
            }
        }, 2000);
        
        // Test de click manual
        window.testMenuToggle = function() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                console.log('🧪 Ejecutando test manual del menú...');
                navLinks.classList.toggle('show');
                console.log('Estado del menú:', navLinks.classList.contains('show') ? 'ABIERTO' : 'CERRADO');
            } else {
                console.error('❌ No se encontraron elementos para el test');
            }
        };
        
        console.log('💡 Ejecuta testMenuToggle() en la consola para probar manualmente');
    }
}

// ==================== INICIALIZACIÓN ROBUSTA ====================

// Función de inicialización robusta para el menú
function inicializarMenuRobusto() {
    let intentos = 0;
    const maxIntentos = 5;
    
    function intentarConfiguracion() {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            configurarMenuHamburguesa();
            debugRender();
            return true;
        }
        
        intentos++;
        if (intentos < maxIntentos) {
            console.log(`⏳ Intento ${intentos}/${maxIntentos} - Reintentando configuración del menú...`);
            setTimeout(intentarConfiguracion, 500 * intentos);
        } else {
            console.error('❌ No se pudo configurar el menú después de', maxIntentos, 'intentos');
        }
        
        return false;
    }
    
    return intentarConfiguracion();
}

// ==================== EXPORTAR FUNCIONES ====================

// Hacer funciones disponibles globalmente
window.configurarMenuHamburguesa = configurarMenuHamburguesa;
window.debugRender = debugRender;
window.verificarEntorno = verificarEntorno;

// ==================== AUTO-INICIALIZACIÓN ====================

// Auto-configurar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarMenuRobusto);
} else {
    // DOM ya está listo
    setTimeout(inicializarMenuRobusto, 100);
}

console.log('🍔 Módulo de menú hamburguesa cargado');