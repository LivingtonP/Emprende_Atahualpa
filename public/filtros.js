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






export function inicializarBusquedaAvanzada() {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const stockToggle = document.getElementById('stockToggle');
    const ordenSelect = document.getElementById('ordenSelect');

    let debounceTimer;

    // Inicializamos Fuse.js para búsqueda aproximada
    const fuse = new Fuse(productos, {
        keys: ['nombre', 'marca', 'categoria', 'talla', 'descripcion'],
        threshold: 0.3, // permite errores leves
        includeScore: true
    });

    function filtrarYRenderizar() {
        const query = searchInput.value.trim().toLowerCase();

        let resultados = [];

        if (query === "") {
            resultados = [...productos];
        } else {
            // Detectar rango de precios (ej: 10-20)
            const rangoMatch = query.match(/^(\d+(\.\d+)?)-(\d+(\.\d+)?)$/);
            if (rangoMatch) {
                const min = parseFloat(rangoMatch[1]);
                const max = parseFloat(rangoMatch[3]);
                resultados = productos.filter(prod => prod.precio >= min && prod.precio <= max);
            } else {
                // Buscar con Fuse.js (palabras clave y aproximada)
                resultados = fuse.search(query).map(res => res.item);
            }
        }

        // Filtrar solo stock si toggle activo
        if (stockToggle.checked) {
            resultados = resultados.filter(prod => prod.stock > 0);
        }

        // Ordenar según selección
        const orden = ordenSelect.value;
        if (orden === 'precio-asc') resultados.sort((a,b) => a.precio - b.precio);
        if (orden === 'precio-desc') resultados.sort((a,b) => b.precio - a.precio);
        // Relevancia ya viene con Fuse.js

        if (resultados.length > 0) {
            renderProductosConHighlight(resultados, query);
            guardarHistorial(query);
        } else {
            mostrarSinResultados(query);
        }
    }

    // Debounce input
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filtrarYRenderizar, 300);
    });

    stockToggle.addEventListener('change', filtrarYRenderizar);
    ordenSelect.addEventListener('change', filtrarYRenderizar);
}

// Función para resaltar palabras clave
function renderProductosConHighlight(lista, query) {
    const contenedor = document.getElementById("productsGrid");
    const palabras = query.split(/\s+/).filter(p => p);

    contenedor.innerHTML = lista.map(prod => {
        let nombre = prod.nombre;
        let descripcion = prod.descripcion;
        palabras.forEach(palabra => {
            const regex = new RegExp(`(${palabra})`, 'gi');
            nombre = nombre.replace(regex, '<mark>$1</mark>');
            descripcion = descripcion.replace(regex, '<mark>$1</mark>');
        });

        return `
        <article class="product-card" data-category="${prod.categoria}" data-size="${prod.talla}" data-price="${prod.precio}">
            <div class="product-card__image-wrapper">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="product-card__image" loading="lazy" />
                ${prod.descuento ? `<span class="product-card__badge">-${prod.descuento}%</span>` : ''}
            </div>
            <div class="product-card__content">
                <header class="product-card__header">
                    <h3 class="product-card__title">${nombre}</h3>
                    <span class="product-card__brand">${prod.marca}</span>
                </header>
                <p class="product-card__description">${descripcion}</p>
                <div class="product-card__meta">
                    <p class="product-card__tallas"><strong>Tallas:</strong> ${prod.talla}</p>
                    <p class="product-card__stock"><strong>Stock:</strong> ${prod.stock}</p>
                </div>
                <div class="product-card__price">
                    <span class="product-card__price-current">$${prod.precio.toFixed(2)}</span>
                    ${prod.precioOriginal ? `<span class="product-card__price-old">$${prod.precioOriginal.toFixed(2)}</span>` : ''}
                </div>
                <button class="product-card__btn" aria-label="Agregar ${prod.nombre} al carrito">
                    <i class="fas fa-shopping-bag"></i> Agregar
                </button>
            </div>
        </article>
        `;
    }).join('');
}

// Guardar historial de búsqueda en localStorage
function guardarHistorial(query) {
    if (!query) return;
    let historial = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    if (!historial.includes(query)) {
        historial.unshift(query); // agrega al inicio
        if (historial.length > 10) historial.pop(); // máximo 10
        localStorage.setItem('historialBusqueda', JSON.stringify(historial));
    }
}

// Mostrar mensaje si no hay resultados
function mostrarSinResultados(query) {
    const contenedor = document.getElementById("productsGrid");
    contenedor.innerHTML = `
        <div class="sin-resultados">
            <i class="fas fa-search"></i>
            <p>No se encontraron productos para: <strong>${query}</strong></p>
        </div>
    `;
}
