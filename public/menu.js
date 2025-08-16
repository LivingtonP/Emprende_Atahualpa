// MENÚ HAMBURGUESA OPTIMIZADO - Sin conflictos de doble clic
class MobileMenu {
    constructor() {
        this.isMenuOpen = false;
        this.menuToggle = null;
        this.navLinks = null;
        this.isInitialized = false;
    }

    // Método para inicializar el menú
    init() {
        if (this.isInitialized) return;
        
        this.menuToggle = document.getElementById('menuToggle');
        this.navLinks = document.getElementById('navLinks');
        
        if (!this.menuToggle || !this.navLinks) {
            console.log('Elementos del menú no encontrados, reintentando...');
            setTimeout(() => this.init(), 100);
            return;
        }

        this.setupEventListeners();
        this.setupStyles();
        this.isInitialized = true;
        console.log('Menú hamburguesa inicializado correctamente');
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

    // Manejar el toggle del menú
    handleToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
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

// Cargar header y inicializar menú
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
            
            // Inicializar después de que el DOM esté listo
            setTimeout(() => {
                // Crear instancia global del menú
                window.mobileMenu = new MobileMenu();
                window.mobileMenu.init();
                
                // Configurar navegación
                setupNavigationLinks();
            }, 100);
        })
        .catch(error => {
            console.error('Error cargando el header:', error);
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