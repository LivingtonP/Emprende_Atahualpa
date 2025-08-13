// header-loader.js - Cargar header dinámicamente

/**
 * Función para cargar el header desde archivo HTML externo
 */
async function loadHeaderFromFile() {
    try {
        const response = await fetch('./header.html');
        if (!response.ok) {
            throw new Error('No se pudo cargar header.html');
        }
        const headerHTML = await response.text();
        
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = headerHTML;
            initializeHeaderFunctions();
            console.log('✅ Header cargado exitosamente');
        }
    } catch (error) {
        console.error('❌ Error cargando header:', error);
        // Fallback: cargar header inline si no se puede cargar el archivo
        loadHeaderInline();
    }
}

/**
 * Función fallback para cargar header inline
 */
function loadHeaderInline() {
    const headerHTML = `
    <header class="main-header">
        <!-- Barra superior -->
        <div class="top-bar">
            <p>🚚 Envío gratis en pedidos superiores a $25 | No se aceptan devoluciones una vez entregado</p>
            <p>📍 Envíos gratis dentro de la parroquia Atahualpa</p>
        </div>
        
        <!-- Barra de navegación -->
        <nav class="navbar container">
            <!-- Botón menú hamburguesa (visible solo en móvil) -->
            <div class="menu-toggle" id="menuToggle">
                <i class="fas fa-bars"></i>
            </div>
            
            <!-- Logo -->
            <a class="logo" href="#">ATAHUALPA</a>
            
            <!-- Menú -->
            <ul class="nav-links" id="navLinks">
                <li><a href="#inicio" class="active" id="linkInicio">Inicio</a></li>
                <li><a href="#mujer" class="filter-link" data-category="mujer">Mujer</a></li>
                <li><a href="#hombre" class="filter-link" data-category="hombre">Hombre</a></li>
                <li><a href="#prendasdesegunda" class="filter-link" data-category="prendaU">Prendas de segunda</a></li>
                <li><a href="#ofertas" class="filter-link" data-category="prendaOfertas">Ofertas</a></li>
            </ul>
            
            <!-- Buscador -->
            <form class="search-bar" role="search">
                <input type="search" placeholder="Buscar productos..." aria-label="Buscar">
                <button type="submit"><i class="fas fa-search"></i></button>
            </form>
            
            <!-- Iconos -->
            <div class="icons">
                <a href="#" title="Mi cuenta"><i class="fas fa-user"></i></a>
                <a href="#" class="cart" title="Carrito de compras">
                    <i class="fas fa-shopping-bag"></i>
                </a>
            </div>
        </nav>
    </header>
    `;

    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
        initializeHeaderFunctions();
        console.log('✅ Header inline cargado como fallback');
    }
}

/**
 * Inicializar todas las funcionalidades del header
 */
function initializeHeaderFunctions() {
    console.log('🔧 Inicializando funciones del header...');
    
    // Esperar un poco para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        // Menú móvil
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        console.log('🎛️ MenuToggle encontrado:', !!menuToggle);
        console.log('🎛️ NavLinks encontrado:', !!navLinks);

        if (menuToggle && navLinks) {
            // Remover event listeners previos para evitar duplicados
            menuToggle.removeEventListener('click', toggleMenu);
            
            // Agregar event listener
            menuToggle.addEventListener('click', toggleMenu);
            
            console.log('✅ Event listeners del menú agregados correctamente');

            function toggleMenu(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🖱️ Click en menú hamburguesa detectado');
                
                navLinks.classList.toggle('active');
                
                // Cambiar icono del menú
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    if (navLinks.classList.contains('active')) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-times');
                        console.log('📱 Menú abierto');
                    } else {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                        console.log('📱 Menú cerrado');
                    }
                }
            }
        } else {
            console.error('❌ No se encontraron elementos del menú');
        }

        // Cerrar menú al hacer clic en un enlace (móvil)
        const navLinksElements = document.querySelectorAll('.nav-links a');
        console.log('🔗 Enlaces encontrados:', navLinksElements.length);
        
        navLinksElements.forEach(link => {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
                
                // Remover clase active de todos los enlaces
                navLinksElements.forEach(l => l.classList.remove('active'));
                // Agregar clase active al enlace clickeado
                this.classList.add('active');

                // Smooth scroll si es un enlace interno
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target) || menuToggle.contains(event.target);
            
            if (!isClickInsideNav && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Cerrar menú al redimensionar ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }, 100); // Timeout de 100ms

    // Efecto scroll del header
    const header = document.querySelector('.main-header');
    if (header) {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.boxShadow = '0 4px 25px rgba(0,0,0,0.15)';
            } else {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    // Funcionalidad del buscador
    const searchForm = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    if (searchInput && searchButton) {
        // Efectos visuales del buscador
        searchInput.addEventListener('focus', function() {
            searchButton.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
        });

        searchInput.addEventListener('blur', function() {
            searchButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        });

        // Funcionalidad de búsqueda
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const query = searchInput.value.trim();
                
                if (query) {
                    performSearch(query);
                    searchInput.value = '';
                    searchInput.blur();
                }
            });
        }
    }

    // Actualizar enlace activo basado en scroll
    updateActiveNavLink();
    window.addEventListener('scroll', debounce(updateActiveNavLink, 100));
}

/**
 * Realizar búsqueda (conectar con tu lógica de productos)
 */
function performSearch(query) {
    console.log(`🔍 Buscando: "${query}"`);
    
    // Aquí puedes conectar con tu lógica de filtrado de productos
    // Por ejemplo, disparar un evento personalizado
    const searchEvent = new CustomEvent('headerSearch', {
        detail: { query: query }
    });
    document.dispatchEvent(searchEvent);
    
    // O llamar directamente una función de tu main.js si está disponible
    if (window.filterProducts) {
        window.filterProducts(query);
    }
}

/**
 * Actualizar enlace activo basado en la posición del scroll
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        
        if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Función debounce para optimizar eventos de scroll
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando carga del header...');
    loadHeaderFromFile();
});

// Exportar funciones para uso en otros módulos si es necesario
if (typeof window !== 'undefined') {
    window.headerLoader = {
        loadHeader: loadHeaderFromFile,
        initializeHeader: initializeHeaderFunctions,
        performSearch: performSearch
    };
}