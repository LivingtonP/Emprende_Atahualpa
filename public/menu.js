// MENÚ HAMBURGUESA OPTIMIZADO - Sin conflictos de doble clic
class MobileMenu {
    constructor() {
        this.isMenuOpen = false;
        this.menuToggle = null;
        this.navLinks = null;
        this.isInitialized = false;
    }

    // Método para inicializar el menú - Versión robusta
    init() {
        if (this.isInitialized) {
            console.log('Menú ya inicializado, saltando...');
            return;
        }
        
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        
        console.log('Elementos del menú:', { 
            menuToggle: !!this.menuToggle, 
            navLinks: !!this.navLinks 
        });
        
        if (!this.menuToggle || !this.navLinks) {
            console.log('Elementos del menú no encontrados, reintentando...');
            setTimeout(() => this.init(), 200);
            return;
        }

        this.setupEventListeners();
        this.setupStyles();
        this.isInitialized = true;
        console.log('✅ Menú hamburguesa inicializado correctamente');
        
        // Verificar que el menú funciona
        this.testMenu();
    }
    
    // Método para probar el menú
    testMenu() {
        if (this.menuToggle) {
            console.log('Menu toggle element:', this.menuToggle);
            console.log('Menu toggle computed style:', window.getComputedStyle(this.menuToggle).display);
            console.log('Menu toggle onclick:', this.menuToggle.onclick);
        }
    }

    // Configurar estilos necesarios
    setupStyles() {
        this.menuToggle.style.cursor = 'pointer';
        this.menuToggle.style.zIndex = '10002';
        this.menuToggle.style.position = 'relative';
        this.menuToggle.style.pointerEvents = 'auto';
        
        // Asegurar visibilidad en móvil
        if (window.innerWidth <= 768) {
            this.menuToggle.style.display = 'block';
        }
    }

    // Configurar event listeners una sola vez
    setupEventListeners() {
        // Usar solo UN event listener - eliminamos conflictos
        this.menuToggle.addEventListener('click', (e) => this.handleToggle(e));
        
        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Manejar redimensionado
        window.addEventListener('resize', () => this.handleResize());
    }

    // Manejar el toggle del menú - Con logging adicional
    handleToggle(e) {
        console.log('🔘 Menu toggle clicked');
        e.preventDefault();
        e.stopPropagation();
        
        if (this.isMenuOpen) {
            console.log('Cerrando menú...');
            this.closeMenu();
        } else {
            console.log('Abriendo menú...');
            this.openMenu();
        }
    }

    // Abrir menú
    openMenu() {
        this.isMenuOpen = true;
        this.navLinks.classList.add('show');
        this.navLinks.style.display = 'flex';
        this.menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        this.menuToggle.setAttribute('aria-label', 'Cerrar menú');
        document.body.style.overflow = 'hidden';
    }

    // Cerrar menú
    closeMenu() {
        this.isMenuOpen = false;
        this.navLinks.classList.remove('show');
        this.navLinks.style.display = '';
        this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        this.menuToggle.setAttribute('aria-label', 'Abrir menú');
        document.body.style.overflow = '';
    }

    // Manejar clic fuera del menú
    handleOutsideClick(e) {
        if (this.isMenuOpen && 
            !this.menuToggle.contains(e.target) && 
            !this.navLinks.contains(e.target)) {
            this.closeMenu();
        }
    }

    // Manejar tecla Escape
    handleKeyPress(e) {
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMenu();
        }
    }

    // Manejar redimensionado
    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMenu();
        }
        
        // Mostrar/ocultar botón según el tamaño de pantalla
        if (window.innerWidth <= 768) {
            this.menuToggle.style.display = 'block';
        } else {
            this.menuToggle.style.display = '';
        }
    }
}

// Configurar navegación y filtros
function setupNavigationLinks() {
    // Configurar enlace de Inicio para recargar página
    const inicioLink = document.getElementById('linkInicio');
    if (inicioLink) {
        inicioLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cerrar menú móvil si está abierto
            if (window.mobileMenu && window.mobileMenu.isMenuOpen) {
                window.mobileMenu.closeMenu();
            }
            
            // Recargar la página
            window.location.reload();
        });
    }
    
    // Configurar filtros de navegación
    const filterLinks = document.querySelectorAll('.filter-link');
    
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const categoria = link.getAttribute('data-category');
            
            // Aplicar filtro si la función existe
            if (typeof filtrarPorCategoria === 'function') {
                filtrarPorCategoria(categoria);
            }
            
            // Scroll suave a productos
            const productosSection = document.querySelector('#productos');
            if (productosSection) {
                productosSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Cerrar menú móvil si está abierto
            if (window.mobileMenu && window.mobileMenu.isMenuOpen) {
                window.mobileMenu.closeMenu();
            }
        });
    });
}

// Cargar header y inicializar menú - Versión robusta para producción
function loadHeader() {
    console.log('Cargando header...');
    
    // Detectar si estamos en producción o desarrollo
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const headerPath = isProduction ? '/header.html' : './header.html';
    
    console.log('Entorno:', isProduction ? 'Producción' : 'Desarrollo');
    console.log('Ruta del header:', headerPath);
    
    fetch(headerPath)
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Header cargado, longitud:', data.length);
            const container = document.getElementById('header-container');
            if (!container) {
                console.error('Contenedor header-container no encontrado');
                return;
            }
            
            container.innerHTML = data;
            
            // Múltiples intentos de inicialización para producción
            let attempts = 0;
            const maxAttempts = 5;
            
            function initializeMenu() {
                attempts++;
                console.log(`Intento de inicialización ${attempts}/${maxAttempts}`);
                
                const menuToggle = document.getElementById('menuToggle');
                const navLinks = document.getElementById('navLinks');
                
                if (menuToggle && navLinks) {
                    console.log('Elementos encontrados, inicializando menú...');
                    
                    // Crear instancia global del menú
                    window.mobileMenu = new MobileMenu();
                    window.mobileMenu.init();
                    
                    // Configurar navegación
                    setupNavigationLinks();
                    
                    console.log('Menú inicializado exitosamente');
                } else {
                    console.log('Elementos no encontrados:', { menuToggle: !!menuToggle, navLinks: !!navLinks });
                    
                    if (attempts < maxAttempts) {
                        setTimeout(initializeMenu, 200 * attempts); // Incrementar delay
                    } else {
                        console.error('No se pudo inicializar el menú después de', maxAttempts, 'intentos');
                    }
                }
            }
            
            // Inicializar inmediatamente y también después de un delay
            initializeMenu();
            setTimeout(initializeMenu, 500);
        })
        .catch(error => {
            console.error('Error cargando el header:', error);
            
            // Fallback: intentar cargar desde diferentes rutas
            const fallbackPaths = ['./header.html', '/header.html', 'header.html'];
            
            function tryFallback(index = 0) {
                if (index >= fallbackPaths.length) {
                    console.error('Todas las rutas de fallback fallaron');
                    return;
                }
                
                console.log('Intentando ruta de fallback:', fallbackPaths[index]);
                fetch(fallbackPaths[index])
                    .then(response => {
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        return response.text();
                    })
                    .then(data => {
                        document.getElementById('header-container').innerHTML = data;
                        setTimeout(() => {
                            window.mobileMenu = new MobileMenu();
                            window.mobileMenu.init();
                            setupNavigationLinks();
                        }, 300);
                    })
                    .catch(() => {
                        tryFallback(index + 1);
                    });
            }
            
            tryFallback();
        });
}

// Inicialización principal
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHeader);
} else {
    loadHeader();
}

// Función de filtrado (personalizar según necesidades)
function filtrarPorCategoria(categoria) {
    console.log('Filtrando por categoría:', categoria);
    // Tu lógica de filtrado aquí
}