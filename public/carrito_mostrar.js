
        import { mostrarModalCarrito, actualizarContadorCarrito } from './FuncionCarrito.js';

        // Cargar header dinámicamente
        async function loadHeader() {
            try {
                const response = await fetch('./header.html');
                const html = await response.text();
                document.getElementById('header-container').innerHTML = html;

                // Asignar eventos al carrito después de cargar el header
                const carritoIcono = document.querySelector('.cart');
                
                if (carritoIcono) {
                    carritoIcono.addEventListener('click', (e) => {
                        e.preventDefault();
                        mostrarModalCarrito(); // Usar la función importada
                    });
                }

                // Actualizar contador del carrito al cargar la página
                actualizarContadorCarrito();

            } catch (error) {
                console.error('Error cargando el header:', error);
            }
        }

        // Ejecutar cuando el DOM esté cargado
        document.addEventListener('DOMContentLoaded', () => {
            loadHeader();
        });