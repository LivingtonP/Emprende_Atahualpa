// Importar funciones de filtrado
import { 
    inicializarFiltros, 
    asignarEventosHeader, 
    asignarEventosInicio, 
    inicializarBusquedaAvanzada 
} from './filtros.js';

// Importar funciones del carrito
import { 
    actualizarContadorCarrito, 
    mostrarModalCarrito 
} from './FuncionCarrito.js';

// Importar sistema de notificaciones
import './notificaciones.js';

window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando carga de la aplicación...');
        
        // Cargar el header primero
        const response = await fetch('header.html');
        if (!response.ok) {
            throw new Error(`Error al cargar header: ${response.status}`);
        }
        
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;

        // Esperar un momento para que el DOM se actualice
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('✅ Header cargado correctamente');

        // Inicializar funciones de filtrado
        inicializarFiltros();
        asignarEventosHeader();
        asignarEventosInicio();
        inicializarBusquedaAvanzada();
        
        console.log('✅ Filtros inicializados');

        // Inicializar funciones del carrito
        actualizarContadorCarrito();
        
        // Asignar evento al carrito
        const carritoIcono = document.querySelector('.cart');
        if (carritoIcono) {
            carritoIcono.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarModalCarrito();
            });
            console.log('✅ Evento del carrito asignado');
        } else {
            console.error('❌ No se encontró el ícono del carrito (.cart)');
        }

        // Inicializar toggles de vista (si los tienes)
        inicializarToggleVista();

        console.log('🎉 Aplicación cargada completamente');

    } catch (error) {
        console.error('❌ Error cargando la aplicación:', error);
        // Mostrar mensaje de error al usuario
        const headerContainer = document.getElementById('header-container');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <div style="background: #f8d7da; color: #721c24; padding: 10px; text-align: center;">
                    Error cargando la aplicación. Por favor, recarga la página.
                </div>
            `;
        }
    }
});

// Función para inicializar los toggles de vista (grid/list)
function inicializarToggleVista() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('productsGrid');

    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remover clase active de todos los botones
            viewButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });

            // Agregar clase active al botón clickeado
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            // Cambiar vista del grid
            const view = btn.dataset.view;
            if (productsGrid) {
                productsGrid.className = view === 'list' ? 'products-list' : 'products-grid';
            }
        });
    });
}