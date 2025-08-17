// MENÚ HAMBURGUESA ROBUSTO - VERSIÓN PRODUCCIÓN
// Optimizado para funcionar en cualquier entorno (local, Render, etc.)

class MenuHamburguesa {
    constructor() {
        this.isMenuOpen = false;
        this.menuToggle = null;
        this.navLinks = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 20; // Más reintentos
        this.debugMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Bind methods
        this.handleToggle = this.handleToggle.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        
        this.log('🚀 MenuHamburguesa iniciado');
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[MENU]', ...args);
        }
    }

    error(...args) {
        console.error('[MENU ERROR]', ...args);
    }

    async init() {
        this.log('Inicializando menú hamburguesa...');
        
        if (this.initialized) {
            this.log('Menú ya inicializado');
            return true;
        }

        // Inyectar estilos primero
        this.injectCriticalStyles();

        // Buscar elementos con múltiples estrategias
        const found = await this.findElementsWithFallback();
        
        if (!found) {
            this.error('No se encontraron elementos del menú después de todos los intentos');
            return false;
        }

        // Configurar elementos
        this.setupElements();
        this.setupEventListeners();
        this.initialized = true;
        
        this.log('✅ Menú hamburguesa inicializado exitosamente');
        this.log('Estado:', this.getState());
        
        return true;
    }

    injectCriticalStyles() {
        if (document.getElementById('menuHamburguesaStyles')) {
            return;
        }

        const style = document.createElement('style');
        style.id = 'menuHamburguesaStyles';
        style.textContent = `
            /* Estilos críticos del menú hamburguesa */
            .menu-toggle {
                background: none !important;
                border: none !important;
                cursor: pointer !important;
                z-index: 10002 !important;
                padding: 8px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-width: 44px !important;
                min-height: 44px !important;
                font-size: 1.5rem !important;
                color: #333 !important;
                transition: color 0.2s ease !important;
            }
            
            .menu-toggle:hover {
                color: #007bff !important;
            }
            
            @media (min-width: 769px) {
                .menu-toggle {
                    display: none !important;
                }
            }
            
            @media (max-width: 768px) {
                .menu-toggle {
                    display: flex !important;
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
                    
                    /* Estado oculto por defecto */
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transform: translateY(-20px) !important;
                    max-height: 0 !important;
                    overflow: hidden !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    pointer-events: none !important;
                }
                
                /* Estado visible - MÁXIMA ESPECIFICIDAD */
                .nav-links.menu-show,
                ul.nav-links.menu-show,
                #navLinks.menu-show,
                .navbar .nav-links.menu-show,
                nav .nav-links.menu-show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0) !important;
                    max-height: 500px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    pointer-events: auto !important;
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
                
                body.menu-open-overlay {
                    overflow: hidden !important;
                }
                
                body.menu-open-overlay::before {
                    content: '' !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    background: rgba(0,0,0,0.5) !important;
                    z-index: 9999 !important;
                    backdrop-filter: blur(2px) !important;
                }
            }
        `;
        
        document.head.appendChild(style);
        this.log('✅ Estilos críticos inyectados');
    }

    async findElementsWithFallback() {
        const strategies = [
            // Estrategia 1: IDs específicos
            () => {
                this.menuToggle = document.getElementById('menuToggle');
                this.navLinks = document.getElementById('navLinks');
                return this.menuToggle && this.navLinks;
            },
            
            // Estrategia 2: Clases específicas
            () => {
                this.menuToggle = document.querySelector('.menu-toggle');
                this.navLinks = document.querySelector('.nav-links');
                return this.menuToggle && this.navLinks;
            },
            
            // Estrategia 3: Selectores por aria-label
            () => {
                this.menuToggle = document.querySelector('button[aria-label*="menú"], button[aria-label*="Menú"], button[aria-label*="menu"]');
                this.navLinks = document.querySelector('nav ul, .navbar ul');
                return this.menuToggle && this.navLinks;
            },
            
            // Estrategia 4: Buscar por contenido
            () => {
                const buttons = document.querySelectorAll('button');
                for (const button of buttons) {
                    if (button.innerHTML.includes('fa-bars') || button.innerHTML.includes('hamburger') || button.classList.contains('menu-toggle')) {
                        this.menuToggle = button;
                        break;
                    }
                }
                this.navLinks = this.navLinks || document.querySelector('nav ul, .navigation ul');
                return this.menuToggle && this.navLinks;
            },
            
            // Estrategia 5: Crear elementos si no existen
            () => {
                this.log('⚠️ Intentando crear elementos faltantes...');
                
                const navbar = document.querySelector('.navbar, nav, header .container');
                if (!navbar) return false;
                
                // Crear botón toggle si no existe
                if (!this.menuToggle) {
                    this.menuToggle = document.createElement('button');
                    this.menuToggle.id = 'menuToggle';
                    this.menuToggle.className = 'menu-toggle';
                    this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    this.menuToggle.setAttribute('aria-label', 'Abrir menú');
                    this.menuToggle.setAttribute('aria-expanded', 'false');
                    navbar.appendChild(this.menuToggle);
                }
                
                // Buscar nav-links existente
                this.navLinks = this.navLinks || document.querySelector('nav ul, .nav-links, ul');
                
                if (this.navLinks && !this.navLinks.classList.contains('nav-links')) {
                    this.navLinks.classList.add('nav-links');
                    this.navLinks.id = this.navLinks.id || 'navLinks';
                }
                
                return this.menuToggle && this.navLinks;
            }
        ];

        // Intentar cada estrategia con reintentos
        while (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.log(`Intento ${this.retryCount}/${this.maxRetries}`);

            for (let i = 0; i < strategies.length; i++) {
                try {
                    if (strategies[i]()) {
                        this.log(`✅ Elementos encontrados con estrategia ${i + 1}`);
                        this.log('MenuToggle:', this.menuToggle);
                        this.log('NavLinks:', this.navLinks);
                        return true;
                    }
                } catch (error) {
                    this.log(`Estrategia ${i + 1} falló:`, error.message);
                }
            }

            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        return false;
    }

    setupElements() {
        // Configurar botón toggle
        if (this.menuToggle) {
            this.menuToggle.className = 'menu-toggle';
            this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            this.menuToggle.setAttribute('aria-label', 'Abrir menú');
            this.menuToggle.setAttribute('aria-expanded', 'false');
            this.menuToggle.style.display = 'flex';
        }

        // Configurar nav-links
        if (this.navLinks) {
            if (!this.navLinks.classList.contains('nav-links')) {
                this.navLinks.classList.add('nav-links');
            }
            this.navLinks.id = this.navLinks.id || 'navLinks';
        }
    }

    setupEventListeners() {
        this.removeEventListeners();

        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.handleToggle);
            this.menuToggle.addEventListener('touchstart', this.handleToggle, { passive: true });
            this.log('✅ Event listeners del toggle agregados');
        }

        document.addEventListener('click', this.handleOutsideClick, true);
        document.addEventListener('touchstart', this.handleOutsideClick, { passive: true });
        document.addEventListener('keydown', this.handleKeyPress);
        window.addEventListener('resize', this.handleResize);

        if (this.navLinks) {
            const links = this.navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', this.handleLinkClick);
                link.addEventListener('touchstart', this.handleLinkClick, { passive: true });
            });
            this.log(`✅ Event listeners en ${links.length} enlaces`);
        }
    }

    removeEventListeners() {
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.handleToggle);
            this.menuToggle.removeEventListener('touchstart', this.handleToggle);
        }
        document.removeEventListener('click', this.handleOutsideClick, true);
        document.removeEventListener('touchstart', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        window.removeEventListener('resize', this.handleResize);
    }

    handleToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.log('Toggle menú:', this.isMenuOpen ? 'cerrar' : 'abrir');
        
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.log('Abriendo menú...');
        
        this.isMenuOpen = true;
        
        if (this.navLinks) {
            // Usar clase específica para evitar conflictos
            this.navLinks.classList.add('menu-show');
            
            // Forzar display para navegadores problemáticos
            requestAnimationFrame(() => {
                this.navLinks.style.display = 'flex';
                this.navLinks.style.flexDirection = 'column';
                this.navLinks.setAttribute('data-menu-open', 'true');
            });
        }
        
        if (this.menuToggle) {
            this.menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            this.menuToggle.setAttribute('aria-label', 'Cerrar menú');
            this.menuToggle.setAttribute('aria-expanded', 'true');
        }
        
        document.body.classList.add('menu-open-overlay');
        
        this.log('✅ Menú abierto');
    }

    closeMenu() {
        this.log('Cerrando menú...');
        
        this.isMenuOpen = false;
        
        if (this.navLinks) {
            this.navLinks.classList.remove('menu-show');
            this.navLinks.removeAttribute('data-menu-open');
            
            // Limpiar estilos inline después de la animación
            setTimeout(() => {
                if (!this.isMenuOpen && window.innerWidth <= 768) {
                    this.navLinks.style.display = '';
                    this.navLinks.style.flexDirection = '';
                }
            }, 300);
        }
        
        if (this.menuToggle) {
            this.menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            this.menuToggle.setAttribute('aria-label', 'Abrir menú');
            this.menuToggle.setAttribute('aria-expanded', 'false');
        }
        
        document.body.classList.remove('menu-open-overlay');
        
        this.log('✅ Menú cerrado');
    }

    handleOutsideClick(e) {
        if (!this.isMenuOpen) return;
        
        const isClickInsideMenu = this.navLinks && this.navLinks.contains(e.target);
        const isClickOnToggle = this.menuToggle && this.menuToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            this.log('Click fuera del menú - cerrando');
            this.closeMenu();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.log('ESC presionado - cerrando menú');
            this.closeMenu();
        }
    }

    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.log('Pantalla grande detectada - cerrando menú');
            this.closeMenu();
        }
    }

    handleLinkClick() {
        if (this.isMenuOpen) {
            this.log('Link clickeado - cerrando menú');
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
            retryCount: this.retryCount,
            debugMode: this.debugMode,
            menuToggleElement: this.menuToggle?.outerHTML || 'N/A',
            navLinksElement: this.navLinks?.outerHTML?.substring(0, 100) + '...' || 'N/A',
            menuClasses: this.navLinks?.className || 'N/A',
            menuDisplay: this.navLinks ? getComputedStyle(this.navLinks).display : 'N/A'
        };
    }

    destroy() {
        this.removeEventListeners();
        this.closeMenu();
        
        const style = document.getElementById('menuHamburguesaStyles');
        if (style) {
            style.remove();
        }
        
        this.initialized = false;
        this.log('Menú destruido');
    }
}

// ==================== SISTEMA DE CARGA DE HEADER ROBUSTO ====================

class HeaderLoader {
    constructor() {
        this.menuSystem = null;
        this.headerLoaded = false;
        this.debugMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[HEADER]', ...args);
        }
    }

    error(...args) {
        console.error('[HEADER ERROR]', ...args);
    }

    async loadHeader() {
        this.log('Cargando header...');
        
        try {
            const headerContainer = await this.ensureHeaderContainer();
            const headerContent = await this.fetchHeaderContent();
            
            headerContainer.innerHTML = headerContent;
            this.headerLoaded = true;
            this.log('✅ Header HTML insertado');

            // Esperar a que el DOM se actualice
            await this.waitForDOMUpdate();

            // Inicializar menú
            await this.initializeMenu();

            // Configurar eventos adicionales
            this.setupHeaderEvents();

            this.log('🎉 Header completamente cargado');
            return true;

        } catch (error) {
            this.error('Error cargando header:', error);
            return false;
        }
    }

    async ensureHeaderContainer() {
        let container = document.getElementById('header-container');
        
        if (!container) {
            // Crear contenedor si no existe
            container = document.createElement('div');
            container.id = 'header-container';
            
            // Insertar al inicio del body
            if (document.body.firstChild) {
                document.body.insertBefore(container, document.body.firstChild);
            } else {
                document.body.appendChild(container);
            }
            
            this.log('✅ Contenedor header creado');
        }
        
        return container;
    }

    async fetchHeaderContent() {
        const possiblePaths = [
            './header.html',
            '/header.html',
            'header.html',
            './src/header.html',
            '/src/header.html',
            './public/header.html',
            '/public/header.html'
        ];

        let lastError = null;

        for (const path of possiblePaths) {
            try {
                this.log(`Intentando cargar: ${path}`);
                const response = await fetch(path);
                
                if (response.ok) {
                    const content = await response.text();
                    this.log(`✅ Header cargado desde: ${path}`);
                    return content;
                }
                
                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                
            } catch (error) {
                lastError = error;
                this.log(`❌ Falló ${path}:`, error.message);
            }
        }

        // Si todas las rutas fallan, crear header básico
        this.log('⚠️ Creando header básico de fallback');
        return this.createFallbackHeader();
    }

    createFallbackHeader() {
        return `
            <header class="main-header">
                <div class="top-bar">
                    <p>¡Bienvenido a nuestro sitio!</p>
                </div>
                <nav class="navbar container">
                    <a href="#" class="logo">LOGO</a>
                    <button class="menu-toggle" id="menuToggle" aria-label="Abrir menú" aria-expanded="false">
                        <i class="fas fa-bars"></i>
                    </button>
                    <ul class="nav-links" id="navLinks">
                        <li><a href="#inicio">Inicio</a></li>
                        <li><a href="#productos">Productos</a></li>
                        <li><a href="#servicios">Servicios</a></li>
                        <li><a href="#contacto">Contacto</a></li>
                    </ul>
                    <div class="search-bar">
                        <input type="search" placeholder="Buscar...">
                        <button type="submit"><i class="fas fa-search"></i></button>
                    </div>
                    <div class="icons">
                        <a href="#" class="cart">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="badge">0</span>
                        </a>
                    </div>
                </nav>
            </header>
        `;
    }

    async waitForDOMUpdate() {
        return new Promise(resolve => {
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(resolve);
            } else {
                setTimeout(resolve, 100);
            }
        });
    }

    async initializeMenu() {
        this.log('Inicializando menú...');
        
        if (this.menuSystem) {
            this.menuSystem.destroy();
        }

        this.menuSystem = new MenuHamburguesa();
        const success = await this.menuSystem.init();

        if (success) {
            window.menuSystem = this.menuSystem;
            this.log('✅ Menú inicializado exitosamente');
            return true;
        } else {
            this.error('❌ Error inicializando el menú');
            return false;
        }
    }

    setupHeaderEvents() {
        this.log('Configurando eventos del header...');

        // Carrito
        const carritoIcon = document.querySelector('.cart');
        if (carritoIcon) {
            carritoIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof window.mostrarModalCarrito === 'function') {
                    window.mostrarModalCarrito();
                } else {
                    this.log('Función de carrito no disponible');
                }
            });
        }

        // Búsqueda
        const searchForm = document.querySelector('.search-bar');
        if (searchForm) {
            const searchInput = searchForm.querySelector('input[type="search"]');
            
            if (searchInput) {
                let searchTimeout;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(() => {
                        const query = e.target.value.trim();
                        if (query.length >= 2 && typeof window.buscarProductos === 'function') {
                            window.buscarProductos(query);
                        } else if (query.length === 0 && typeof window.mostrarTodosLosProductos === 'function') {
                            window.mostrarTodosLosProductos();
                        }
                    }, 300);
                });
            }

            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput?.value.trim();
                if (query && typeof window.buscarProductos === 'function') {
                    window.buscarProductos(query);
                }
            });
        }

        this.log('✅ Eventos del header configurados');
    }
}

// ==================== INICIALIZACIÓN GLOBAL ROBUSTA ====================

let globalHeaderLoader = null;
let initializationPromise = null;

async function inicializarHeaderCompleto() {
    // Evitar múltiples inicializaciones simultáneas
    if (initializationPromise) {
        return initializationPromise;
    }
    
    initializationPromise = (async () => {
        console.log('🚀 Iniciando sistema completo...');
        
        try {
            // Limpiar instancia anterior
            if (globalHeaderLoader?.menuSystem) {
                globalHeaderLoader.menuSystem.destroy();
            }
            
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
        } finally {
            initializationPromise = null;
        }
    })();
    
    return initializationPromise;
}

// ==================== AUTO-INICIALIZACIÓN ROBUSTA ====================

function setupAutoInitialization() {
    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', inicializarHeaderCompleto);
        } else {
            inicializarHeaderCompleto();
        }
    };

    // Múltiples puntos de entrada
    if (typeof window !== 'undefined') {
        if (document.readyState === 'complete') {
            setTimeout(inicializarHeaderCompleto, 100);
        } else {
            init();
        }
        
        // Fallback adicional
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (!globalHeaderLoader?.headerLoaded) {
                    console.log('🔄 Fallback: Reinicializando...');
                    inicializarHeaderCompleto();
                }
            }, 500);
        });
    }
}

setupAutoInitialization();

// ==================== FUNCIONES GLOBALES DE DEBUG Y UTILIDAD ====================

window.debugMenu = function() {
    if (globalHeaderLoader?.menuSystem) {
        const state = globalHeaderLoader.menuSystem.getState();
        console.log('🔍 Estado completo del menú:');
        console.table(state);
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
    console.log('🔄 Reiniciando sistema completo...');
    inicializarHeaderCompleto();
};

window.testMenuCompleto = function() {
    console.log('🧪 Test completo del sistema...');
    
    const tests = {
        headerContainer: !!document.getElementById('header-container'),
        menuToggle: !!document.getElementById('menuToggle'),
        navLinks: !!document.getElementById('navLinks'),
        menuSystem: !!globalHeaderLoader?.menuSystem,
        menuInitialized: !!globalHeaderLoader?.menuSystem?.initialized,
        screenWidth: window.innerWidth,
        isMobile: window.innerWidth <= 768
    };
    
    console.table(tests);
    
    if (tests.menuToggle && tests.navLinks) {
        console.log('🧪 Simulando click en toggle...');
        document.getElementById('menuToggle').click();
        
        setTimeout(() => {
            const navLinks = document.getElementById('navLinks');
            console.log('🔧 Estado después del click:');
            console.log('- Clases:', navLinks.className);
            console.log('- Display:', getComputedStyle(navLinks).display);
            console.log('- Opacity:', getComputedStyle(navLinks).opacity);
            console.log('- Visibility:', getComputedStyle(navLinks).visibility);
            console.log('- Transform:', getComputedStyle(navLinks).transform);
        }, 100);
    }
    
    return tests;
};

// Exportar para uso externo
window.inicializarHeaderCompleto = inicializarHeaderCompleto;
window.MenuHamburguesa = MenuHamburguesa;
window.HeaderLoader = HeaderLoader;

// Log de inicio
console.log(`
🔧 SISTEMA DE MENÚ HAMBURGUESA - VERSIÓN PRODUCCIÓN ROBUSTA
=========================================================
✅ Funciones disponibles:
   - debugMenu() : Ver estado completo
   - toggleMenuManual() : Toggle manual
   - reiniciarMenu() : Reiniciar sistema completo
   - testMenuCompleto() : Test exhaustivo
   - window.menuSystem : Instancia del menú
   - window.globalHeaderLoader : Loader del header

🚀 Características de esta versión:
   - ✅ Múltiples estrategias de búsqueda de elementos
   - ✅ Fallbacks para entornos de producción
   - ✅ Creación automática de elementos faltantes
   - ✅ Estilos críticos inyectados automáticamente
   - ✅ Compatible con Render y otros servicios de hosting
   - ✅ Sistema de logs diferenciado por entorno
   - ✅ Manejo robusto de errores de red
   - ✅ Prevención de inicializaciones múltiples
   - ✅ Detección automática de elementos DOM
   - ✅ Eventos táctiles para dispositivos móviles
   - ✅ Fallback de header básico si no se encuentra archivo

📱 Sistema inicializado automáticamente
🔍 Usa testMenuCompleto() para diagnosticar problemas
🔧 Compatible con cualquier estructura HTML existente
`);