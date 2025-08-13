
      // CÓDIGO LIMPIO Y OPTIMIZADO - Reemplaza tu JavaScript actual

// Función para configurar el menú hamburguesa
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (!menuToggle || !navLinks) {
        console.error('Elementos del menú no encontrados, reintentando...');
        setTimeout(setupMobileMenu, 200);
        return;
    }

    // Limpiar event listeners previos
    const newMenuToggle = menuToggle.cloneNode(true);
    menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
    const finalMenuToggle = document.getElementById('menuToggle');
    
    // Variable de estado del menú
    let isMenuOpen = false;
    
    // Función para abrir menú
    function openMenu() {
        isMenuOpen = true;
        navLinks.classList.add('show');
        navLinks.style.display = 'flex';
        finalMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
        finalMenuToggle.setAttribute('aria-label', 'Cerrar menú');
        document.body.style.overflow = 'hidden';
    }
    
    // Función para cerrar menú
    function closeMenu() {
        isMenuOpen = false;
        navLinks.classList.remove('show');
        navLinks.style.display = '';
        finalMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        finalMenuToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
    }
    
    // Función toggle principal
    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Event listeners múltiples para máxima compatibilidad
    finalMenuToggle.addEventListener('click', toggleMenu, true);
    finalMenuToggle.addEventListener('touchstart', function(e) {
        e.preventDefault();
        toggleMenu(e);
    }, { passive: false });
    
    // Asegurar que el botón sea clickeable
    finalMenuToggle.style.pointerEvents = 'auto';
    finalMenuToggle.style.cursor = 'pointer';
    finalMenuToggle.style.zIndex = '10002';
    finalMenuToggle.style.position = 'relative';
    
    // Forzar display en móvil
    if (window.innerWidth <= 768) {
        finalMenuToggle.style.display = 'block';
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !finalMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            closeMenu();
        }
    }, true);
    
    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
    
    console.log('Menú hamburguesa configurado correctamente');
}

// Función para configurar los enlaces de filtro
function setupFilterLinks() {
    setTimeout(() => {
        const filterLinks = document.querySelectorAll('.filter-link');
        const navLinks = document.getElementById('navLinks');
        
        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoria = link.getAttribute('data-category');
                
                // Cerrar menú móvil al hacer clic en un enlace
                if (navLinks && navLinks.classList.contains('show')) {
                    navLinks.classList.remove('show');
                    navLinks.style.display = '';
                    const menuToggle = document.getElementById('menuToggle');
                    if (menuToggle) {
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        menuToggle.setAttribute('aria-label', 'Abrir menú');
                    }
                    document.body.style.overflow = '';
                }
                
                // Llamar función de filtrado
                if (typeof filtrarPorCategoria === 'function') {
                    filtrarPorCategoria(categoria);
                }
            });
        });
    }, 300);
}

// Función principal de carga
function loadHeader() {
    console.log('Cargando header...');
    
    fetch('./header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            
            // Esperar renderizado completo antes de inicializar
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        setupMobileMenu();
                        setupFilterLinks();
                        
                        // Manejar redimensionado de ventana
                        let resizeTimer;
                        window.addEventListener('resize', function() {
                            clearTimeout(resizeTimer);
                            resizeTimer = setTimeout(() => {
                                const navLinks = document.getElementById('navLinks');
                                const menuToggle = document.getElementById('menuToggle');
                                
                                if (window.innerWidth > 768 && navLinks && menuToggle) {
                                    navLinks.classList.remove('show');
                                    navLinks.style.display = '';
                                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                                    menuToggle.setAttribute('aria-label', 'Abrir menú');
                                    document.body.style.overflow = '';
                                }
                            }, 250);
                        });
                        
                    }, 500);
                });
            });
        })
        .catch(error => {
            console.error('Error cargando el header:', error);
        });
}

// Inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}

// Función de filtrado (personalizar según tus necesidades)
function filtrarPorCategoria(categoria) {
    console.log('Filtrando por categoría:', categoria);
    // Implementar tu lógica de filtrado aquí
}
    