// MENÚ HAMBURGUESA DEFINITIVO - Versión que SÍ funciona
// Compatible con tu sistema actual

class MenuHamburguesa {
    constructor() {
        this.isMenuOpen = false;
        this.menuToggle = null;
        this.navLinks = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 10;
        
        // Bind methods
        this.handleToggle = this.handleToggle.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
    }

    async init() {
        console.log('🚀 Iniciando menú hamburguesa...');
        
        if (this.initialized) {
            console.log('✅ Menú ya inicializado');
            return true;
        }

        // Buscar elementos
        const found = await this.findElements();
        
        if (!found) {
            console.error('❌ No se encontraron elementos del menú');
            return false;
        }

        // Configurar
        this.setupEventListeners();
        this.setupMobileStyles();
        this.initialized = true;
        
        console.log('✅ Menú hamburguesa listo');
        console.log('🔧 Estado:', this.getState());
        
        return true;
    }

    async findElements() {
        while (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔍 Buscando elementos (${this.retryCount}/${this.maxRetries})...`);

            // Buscar con múltiples estrategias
            this.menuToggle = document.getElementById('menuToggle') || 
                             document.querySelector('.menu-toggle') ||
                             document.querySelector('button[aria-label*="menú"]') ||
                             document.querySelector('button[aria-label*="Menú"]');

            this.navLinks = document.getElementById('navLinks') || 
                           document.querySelector('.nav-links') ||
                           document.querySelector('nav ul') ||
                           document.querySelector('.navbar ul');

            if (this.menuToggle && this.navLinks) {
                console.log('✅ Elementos encontrados:', {
                    menuToggle: this.menuToggle.className,
                    navLinks: this.navLinks.className,
                    menuToggleId: this.menuToggle.id,
                    navLinksId: this.navLinks.id
                });
                return true;
            }

            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return false;
    }

    setupMobileStyles() {
        // Verificar si ya existen los estilos
        if (document.getElementById('mobileMenuStyles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'mobileMenuStyles';
        style.textContent = `
            @media (max-width: 768px) {
                .menu-toggle {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-width: 44px !important;
                    min-height: 44px !important;
                    background: none !important;
                    border: none !important;
                    cursor: pointer !important;
                    z-index: 10002 !important;
                    font-size: 1.5rem !important;
                    color: #333 !important;
                    padding: 8px !important;
                }
                
                .menu-toggle:hover {
                    color: #007bff !important;
                }
                
                .nav-links {
                    position: absolute !important;
                    top: 100% !important;
                    left: 0 !important;
                    width: 280px !important;
                    background: #1a1a1a !important;
                    flex-direction: column !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    border-radius: 0 0 8px 8px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                    z-index: 10000 !important;
                    list-style: none !important;
                    
                    /* Estado inicial - OCULTO */
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transform: translateY(-20px) !important;
                    max-height: 0 !important;
                    overflow: hidden !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                
                /* Estado VISIBLE - CRÍTICO */
                .nav-links.show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                    max-height: 400px !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                
                /* Forzar estado visible con máxima especificidad */
                ul.nav-links.show,
                #navLinks.show {
                    display: flex !important;
                    flex-direction: column !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .nav-links li {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border-bottom: 1px solid #333 !important;
                }
                
                .nav-links li:last-child {
                    border-bottom: none !important;
                }
                
                .nav-links a {
                    display: block !important;
                    color: white !important;
                    padding: 16px 24px !important;
                    text-decoration: none !important;
                    transition: all 0.3s ease !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    font-weight: 500 !important;
                }
                
                .nav-links a:hover,
                .nav-links a:focus {
                    background-color: #333 !important;
                    color: #007bff !important;
                    padding-left: 32px !important;
                }
                
                .nav-links .highlight {
                    color: #ff4444 !important;
                    font-weight: 600 !important;
                }
                
                .nav-links .highlight:hover {
                    color: #ff6666 !important;
                }
                
                /* Overlay cuando el menú está abierto */
                body.menu-open {
                    overflow: hidden !important;
                }
                
                body.menu-open::before {
                    content: '' !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: rgba(0,0,0,0.5) !important;
                    z-index: 999 !important;
                    backdrop-filter: blur(2px) !important;
                }
            }
            
            @media (min-width: 769px) {
                .menu-toggle {
                    display: none !important;
                }
                
                .nav-links {
                    position: static !important;
                    flex-direction: row !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: none !important;
                    max-height: none !important;
                    overflow: visible !important;
                    display: flex !important;
                }
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ Estilos móviles agregados');
    }

    setupEventListeners() {
        // Limpiar listeners anteriores
        this.removeEventListeners();

        // Toggle del menú
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.handleToggle);
            console.log('✅ Event listener del toggle agregado');
        }

        // Cerrar al hacer clic fuera
        document.addEventListener('click', this.handleOutsideClick, true);

        // Cerrar con ESC
        document.addEventListener('keydown', this.handleKeyPress);

        // Manejar redimensionado
        window.addEventListener('resize', this.handleResize);

        // Cerrar al hacer clic en enlaces
        if (this.navLinks) {
            const links = this.navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', this.handleLinkClick);
            });
            console.log(`✅ Event listeners en ${links.length} enlaces`);
        }
    }

    removeEventListeners() {
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.handleToggle);
        }
        document.removeEventListener('click', this.handleOutsideClick, true);
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    handleToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔘 Toggle menú:', this.isMenuOpen ? 'cerrar' : 'abrir');
        
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        console.log('📂 Abriendo menú...');
        
        this.isMenuOpen = true;
        
        // Agregar clase show al menú
        if (this.navLinks) {
            this.navLinks.classList.add('show');
            // Forzar display para asegurar visibilidad
            this.navLinks.style.display = 'flex';
            this.navLinks.style.flexDirection = 'column';
        }
        
        // Cambiar icono del botón
        if (this.menuToggle) {
            this.menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            this.menuToggle.setAttribute('aria-label', 'Cerrar menú');
            this.menuToggle.setAttribute('aria-expanded', 'true');
        }
        
        // Bloquear scroll del body
        document.body.classList.add('menu-open');
        
        console.log('✅ Menú abierto');
        console.log('🔧 Clases del menú:', this.navLinks.className);
        console.log('🔧 Display del menú:', getComputedStyle(this.navLinks).display);
    }

    closeMenu() {
        console.log('📁 Cerrando menú...');
        
        this.isMenuOpen = false;
        
        // Quitar clase show del menú
        if (this.navLinks) {
            this.navLinks.classList.remove('show');
            // En móvil, permitir que CSS maneje el display
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    if (!this.isMenuOpen) {
                        this.navLinks.style.display = '';
                    }
                }, 300);
            }
        }
        
        // Restaurar icono del botón
        if (this.menuToggle) {
            this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            this.menuToggle.setAttribute('aria-label', 'Abrir menú');
            this.menuToggle.setAttribute('aria-expanded', 'false');
        }
        
        // Restaurar scroll del body
        document.body.classList.remove('menu-open');
        
        console.log('✅ Menú cerrado');
    }

    handleOutsideClick(e) {
        if (!this.isMenuOpen) return;
        
        const isClickInsideMenu = this.navLinks && this.navLinks.contains(e.target);
        const isClickOnToggle = this.menuToggle && this.menuToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            console.log('👆 Click fuera del menú - cerrando');
            this.closeMenu();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Escape' && this.isMenuOpen) {
            console.log('⌨️ ESC presionado - cerrando menú');
            this.closeMenu();
        }
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            console.log('📱 Pantalla grande detectada - cerrando menú');
            this.closeMenu();
        }
    }

    handleLinkClick() {
        if (this.isMenuOpen) {
            console.log('🔗 Link clickeado - cerrando menú');
            setTimeout(() => {
                this.closeMenu();
            }, 150);
        }
    }

    // Métodos públicos
    toggle() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    getState() {
        return {
            initialized: this.initialized,
            isMenuOpen: this.isMenuOpen,
            hasMenuToggle: !!this.menuToggle,
            hasNavLinks: !!this.navLinks,
            screenWidth: window.innerWidth,
            isMobile: window.innerWidth <= 768,
            menuClasses: this.navLinks ? this.navLinks.className : 'N/A',
            menuDisplay: this.navLinks ? getComputedStyle(this.navLinks).display : 'N/A'
        };
    }

    destroy() {
        this.removeEventListeners();
        this.closeMenu();
        
        // Remover estilos
        const style = document.getElementById('mobileMenuStyles');
        if (style) {
            style.remove();
        }
        
        this.initialized = false;
        console.log('🗑️ Menú destruido');
    }
}

// ==================== SISTEMA DE CARGA DE HEADER ====================

class HeaderLoader {
    constructor() {
        this.menuSystem = null;
        this.headerLoaded = false;
    }

    async loadHeader() {
        console.log('📄 Cargando header...');
        
        try {
            // Detectar entorno
            const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
            const headerPath = isProduction ? '/header.html' : './header.html';
            
            console.log('🌐 Entorno:', isProduction ? 'Producción' : 'Desarrollo');
            console.log('📂 Ruta header:', headerPath);

            const response = await fetch(headerPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            const container = document.getElementById('header-container');
            
            if (!container) {
                throw new Error('Contenedor #header-container no encontrado');
            }

            container.innerHTML = html;
            this.headerLoaded = true;
            console.log('✅ Header HTML insertado');

            // Esperar actualización del DOM
            await new Promise(resolve => setTimeout(resolve, 100));

            // Inicializar menú
            await this.initializeMenu();

            // Configurar otros eventos
            this.setupHeaderEvents();

            console.log('🎉 Header completamente cargado');
            return true;

        } catch (error) {
            console.error('❌ Error cargando header:', error);
            
            // Intentar rutas alternativas
            const fallbackPaths = ['./header.html', '/header.html', 'header.html'];
            
            for (const path of fallbackPaths) {
                try {
                    console.log('🔄 Intentando ruta alternativa:', path);
                    const response = await fetch(path);
                    
                    if (response.ok) {
                        const html = await response.text();
                        document.getElementById('header-container').innerHTML = html;
                        await new Promise(resolve => setTimeout(resolve, 100));
                        await this.initializeMenu();
                        this.setupHeaderEvents();
                        console.log('✅ Header cargado con ruta alternativa:', path);
                        return true;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            throw new Error('No se pudo cargar el header desde ninguna ruta');
        }
    }

    async initializeMenu() {
        console.log('🔧 Inicializando menú...');
        
        // Destruir instancia anterior
        if (this.menuSystem) {
            this.menuSystem.destroy();
        }

        // Crear nueva instancia
        this.menuSystem = new MenuHamburguesa();
        const success = await this.menuSystem.init();

        if (success) {
            window.menuSystem = this.menuSystem;
            console.log('✅ Menú inicializado exitosamente');
            return true;
        } else {
            console.error('❌ Error inicializando el menú');
            return false;
        }
    }

    setupHeaderEvents() {
        console.log('⚙️ Configurando eventos del header...');

        // Configurar carrito
        const carritoIcon = document.querySelector('.cart');
        if (carritoIcon) {
            carritoIcon.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🛒 Carrito clickeado');
                
                if (window.mostrarModalCarrito) {
                    window.mostrarModalCarrito();
                } else {
                    console.warn('⚠️ Función de carrito no disponible');
                }
            });
        }

        // Configurar búsqueda
        const searchForm = document.querySelector('.search-bar');
        if (searchForm) {
            const searchInput = searchForm.querySelector('input[type="search"]');
            
            // Búsqueda en tiempo real
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        const query = e.target.value.trim();
                        if (query.length >= 2 && window.buscarProductos) {
                            window.buscarProductos(query);
                        } else if (query.length === 0 && window.mostrarTodosLosProductos) {
                            window.mostrarTodosLosProductos();
                        }
                    }, 300);
                });
            }

            // Búsqueda al enviar
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput?.value.trim();
                if (query && window.buscarProductos) {
                    window.buscarProductos(query);
                }
            });
        }

        // Configurar filtros
        const filterLinks = document.querySelectorAll('.filter-link');
        filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remover clase activa
                filterLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const category = link.dataset.category;
                console.log('🏷️ Filtrando por:', category);
                
                if (window.filtrarPorCategoria) {
                    window.filtrarPorCategoria(category);
                }
            });
        });

        // Configurar filtros adicionales
        const stockToggle = document.getElementById('stockToggle');
        if (stockToggle) {
            stockToggle.addEventListener('change', (e) => {
                if (window.filtrarPorStock) {
                    window.filtrarPorStock(e.target.checked);
                }
            });
        }

        const ordenSelect = document.getElementById('ordenSelect');
        if (ordenSelect) {
            ordenSelect.addEventListener('change', (e) => {
                if (window.ordenarProductos) {
                    window.ordenarProductos(e.target.value);
                }
            });
        }

        console.log('✅ Eventos del header configurados');
    }
}

// ==================== INICIALIZACIÓN GLOBAL ====================

let globalHeaderLoader = null;

async function inicializarHeaderCompleto() {
    console.log('🚀 Iniciando sistema completo...');
    
    try {
        globalHeaderLoader = new HeaderLoader();
        const success = await globalHeaderLoader.loadHeader();
        
        if (success) {
            console.log('🎉 Sistema completamente inicializado');
            
            // Disparar evento personalizado
            const event = new CustomEvent('headerLoaded', {
                detail: { 
                    menuSystem: globalHeaderLoader.menuSystem,
                    headerLoader: globalHeaderLoader
                }
            });
            document.dispatchEvent(event);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        return false;
    }
}

// Auto-inicialización
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarHeaderCompleto);
} else {
    inicializarHeaderCompleto();
}

// ==================== FUNCIONES GLOBALES DE DEBUG ====================

window.debugMenu = function() {
    if (globalHeaderLoader?.menuSystem) {
        const state = globalHeaderLoader.menuSystem.getState();
        console.log('🔍 Estado completo del menú:');
        console.table(state);
        
        // Info adicional de debug
        console.log('📱 Información adicional:');
        console.log('- Pantalla:', window.innerWidth + 'px');
        console.log('- Es móvil:', window.innerWidth <= 768);
        console.log('- Menú abierto:', state.isMenuOpen);
        console.log('- Elementos encontrados:', state.hasMenuToggle && state.hasNavLinks);
        
        return state;
    } else {
        console.log('❌ Sistema de menú no inicializado');
        return null;
    }
};

window.toggleMenuManual = function() {
    if (globalHeaderLoader?.menuSystem?.initialized) {
        globalHeaderLoader.menuSystem.toggle();
        console.log('🔧 Toggle manual ejecutado');
    } else {
        console.error('❌ Sistema de menú no disponible');
    }
};

window.reiniciarMenu = function() {
    console.log('🔄 Reiniciando sistema de menú...');
    if (globalHeaderLoader) {
        globalHeaderLoader.initializeMenu();
    } else {
        inicializarHeaderCompleto();
    }
};

window.testMenu = function() {
    console.log('🧪 Ejecutando test del menú...');
    
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    console.log('🔍 Test de elementos:');
    console.log('- menuToggle encontrado:', !!menuToggle);
    console.log('- navLinks encontrado:', !!navLinks);
    
    if (menuToggle && navLinks) {
        console.log('- menuToggle ID:', menuToggle.id);
        console.log('- menuToggle clases:', menuToggle.className);
        console.log('- navLinks ID:', navLinks.id);
        console.log('- navLinks clases:', navLinks.className);
        console.log('- navLinks display:', getComputedStyle(navLinks).display);
        console.log('- Ancho pantalla:', window.innerWidth + 'px');
        
        // Test de funcionalidad
        console.log('🧪 Simulando click...');
        menuToggle.click();
        
        setTimeout(() => {
            console.log('🔧 Estado después del click:');
            console.log('- navLinks clases:', navLinks.className);
            console.log('- navLinks display:', getComputedStyle(navLinks).display);
            console.log('- navLinks opacity:', getComputedStyle(navLinks).opacity);
            console.log('- navLinks visibility:', getComputedStyle(navLinks).visibility);
        }, 100);
    } else {
        console.error('❌ Elementos no encontrados para el test');
    }
};

// Exportar funciones principales
window.inicializarHeaderCompleto = inicializarHeaderCompleto;
window.MenuHamburguesa = MenuHamburguesa;
window.HeaderLoader = HeaderLoader;

console.log(`
🔧 SISTEMA DE MENÚ HAMBURGUESA - VERSIÓN FINAL
==============================================
✅ Funciones disponibles:
   - debugMenu() : Ver estado completo
   - toggleMenuManual() : Toggle manual
   - reiniciarMenu() : Reiniciar sistema  
   - testMenu() : Test completo de funcionalidad
   - window.menuSystem : Instancia del menú
   - window.globalHeaderLoader : Loader del header

📱 Sistema inicializado automáticamente
🔍 Usa testMenu() para diagnosticar problemas
`);