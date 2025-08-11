import { productos } from './productos.js';

// Función para renderizar productos
export function renderProductos(listaProductos, opciones = {}) {
    const {
        mostrarDescripcion = true,
        mostrarStock = true,
        mostrarTallas = true,
        mostrarBoton = true
    } = opciones;

    const contenedor = document.getElementById("productsGrid");

    contenedor.innerHTML = listaProductos.map(prod => `
        <article class="product-card" 
        data-category="${prod.categoria}" 
        data-size="${prod.talla}" 
        data-price="${prod.precio}">

            <!-- Imagen y badge -->
            <div class="product-card__image-wrapper">
                <img src="${prod.imagen}" 
                    alt="${prod.nombre}" 
                    class="product-card__image" 
                    loading="lazy" />
                ${prod.descuento 
                    ? `<span class="product-card__badge">-${prod.descuento}%</span>` 
                    : ''}
            </div>

            <!-- Info -->
            <div class="product-card__content">
                <header class="product-card__header">
                    <h3 class="product-card__title">${prod.nombre}</h3>
                    <span class="product-card__brand">${prod.marca}</span>
                </header>

                ${mostrarDescripcion 
                    ? `<p class="product-card__description">${prod.descripcion}</p>` 
                    : ''}

                <div class="product-card__meta">
                    ${mostrarTallas 
                        ? `<p class="product-card__tallas"><strong>Tallas:</strong> ${prod.talla}</p>` 
                        : ''}
                    ${mostrarStock && prod.stock !== undefined 
                        ? `<p class="product-card__stock"><strong>Stock:</strong> ${prod.stock}</p>` 
                        : ''}
                </div>

                <!-- Precio -->
                <div class="product-card__price">
                    <span class="product-card__price-current">$${prod.precio.toFixed(2)}</span>
                    ${prod.precioOriginal 
                        ? `<span class="product-card__price-old">$${prod.precioOriginal.toFixed(2)}</span>` 
                        : ''}
                </div>

                <!-- Botón -->
                ${mostrarBoton 
                    ? `<button class="product-card__btn" aria-label="Agregar ${prod.nombre} al carrito">
                        <i class="fas fa-shopping-bag"></i> Agregar
                    </button>` 
                    : ''}
            </div>
        </article>
    `).join('');
}

// Función para mostrar todos los productos inicialmente
export function inicializarFiltros() {
    renderProductos(productos);
    // Aquí puedes agregar otros filtros si los tienes
}

// Función para asignar eventos a los links del header (que se cargan dinámicamente)
export function asignarEventosHeader() {
    const filterLinks = document.querySelectorAll('.filter-link');
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const categoria = link.getAttribute('data-category');
            filtrarPorCategoria(categoria);
        });
    });
}

// Función para filtrar productos por categoría y renderizar
export function filtrarPorCategoria(categoria) {
    const productosFiltrados = productos.filter(prod => prod.categoria === categoria);
    renderProductos(productosFiltrados);
}

// Función para recargar la pagina
export function asignarEventosInicio() {
    const linkInicio = document.getElementById('linkInicio');
    if(linkInicio) {
        linkInicio.addEventListener('click', (e) => {
            e.preventDefault();
            // Recarga la página
            window.location.reload();
        });
    }
}
