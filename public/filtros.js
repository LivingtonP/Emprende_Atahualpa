import { productos } from './productos.js';
import { asignarEventosAgregar } from './FuncionCarrito.js';

// ===================== RENDERIZADO DE PRODUCTOS =====================
export function renderProductos(listaProductos, opciones = {}) {
    const {
        mostrarDescripcion = true,
        mostrarStock = true,
        mostrarTallas = true,
        mostrarBoton = true
    } = opciones;

    const contenedor = document.getElementById("productsGrid");
    if (!contenedor) {
        console.error('No se encontró el contenedor de productos');
        return;
    }

    contenedor.innerHTML = listaProductos.map(prod => `
        <article class="product-card" 
            data-category="${prod.categoria}" 
            data-size="${prod.talla}" 
            data-price="${prod.precio}">

            <div class="product-card__image-wrapper">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="product-card__image" loading="lazy" />
                ${prod.descuento ? `<span class="product-card__badge">-${prod.descuento}%</span>` : ''}
            </div>

            <div class="product-card__content">
                <header class="product-card__header">
                    <h3 class="product-card__title">${prod.nombre}</h3>
                    <span class="product-card__brand">${prod.marca}</span>
                </header>

                ${mostrarDescripcion ? `<p class="product-card__description">${prod.descripcion}</p>` : ''}

                <div class="product-card__meta">
                    ${mostrarTallas ? `<p class="product-card__tallas"><strong>Tallas:</strong> ${prod.talla}</p>` : ''}
                    ${mostrarStock && prod.stock !== undefined ? `<p class="product-card__stock"><strong>Stock:</strong> ${prod.stock}</p>` : ''}
                </div>

                <div class="product-card__price">
                    <span class="product-card__price-current">$${prod.precio.toFixed(2)}</span>
                    ${prod.precioOriginal ? `<span class="product-card__price-old">$${prod.precioOriginal.toFixed(2)}</span>` : ''}
                </div>

                ${mostrarBoton ? `<button class="product-card__btn" aria-label="Agregar ${prod.nombre} al carrito">
                    <i class="fas fa-shopping-bag"></i> Agregar
                </button>` : ''}
            </div>
        </article>
    `).join('');

    // Asignar eventos a los botones recién creados
    asignarEventosAgregar();
}

// ===================== INICIALIZACIÓN =====================
export function inicializarFiltros() {
    renderProductos(productos);
}

// ===================== FILTRADO POR CATEGORÍA =====================
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

export function filtrarPorCategoria(categoria) {
    const productosFiltrados = productos.filter(prod => prod.categoria === categoria);
    renderProductos(productosFiltrados);
}

// ===================== EVENTOS DE NAVEGACIÓN =====================
export function asignarEventosInicio() {
    const linkInicio = document.getElementById('linkInicio');
    if (linkInicio) {
        linkInicio.addEventListener('click', (e) => {
            e.preventDefault();
            renderProductos(productos); // Mostrar todos los productos en lugar de recargar
            // Si prefieres recargar la página, usa: window.location.reload();
        });
    }
}

// ===================== BÚSQUEDA AVANZADA =====================
export function inicializarBusquedaAvanzada() {
    const searchInput = document.querySelector('.search-bar input[type="search"]');
    const stockToggle = document.getElementById('stockToggle');
    const ordenSelect = document.getElementById('ordenSelect');

    if (!searchInput || !stockToggle || !ordenSelect) {
        console.error('No se encontraron algunos elementos de búsqueda');
        return;
    }

    let debounceTimer;

    // Configurar Fuse.js para búsqueda fuzzy
    const fuse = new Fuse(productos, {
        keys: ['nombre', 'marca', 'categoria', 'talla', 'descripcion'],
        threshold: 0.3,
        includeScore: true
    });

    function filtrarYRenderizar() {
        const query = searchInput.value.trim().toLowerCase();
        let resultados = [];

        if (query === "") {
            resultados = [...productos];
        } else {
            // Verificar si es un rango de precios (ej: 10-50)
            const rangoMatch = query.match(/^(\d+(\.\d+)?)-(\d+(\.\d+)?)$/);
            if (rangoMatch) {
                const min = parseFloat(rangoMatch[1]);
                const max = parseFloat(rangoMatch[3]);
                resultados = productos.filter(prod => prod.precio >= min && prod.precio <= max);
            } else {
                // Búsqueda normal con Fuse.js
                resultados = fuse.search(query).map(res => res.item);
            }
        }

        // Filtrar por stock si está activado
        if (stockToggle.checked) {
            resultados = resultados.filter(prod => prod.stock > 0);
        }

        // Ordenar según la selección
        const orden = ordenSelect.value;
        switch (orden) {
            case 'precio-asc':
                resultados.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                resultados.sort((a, b) => b.precio - a.precio);
                break;
            case 'nombre-asc':
                resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
                break;
            case 'nombre-desc':
                resultados.sort((a, b) => b.nombre.localeCompare(a.nombre));
                break;
        }

        // Renderizar resultados
        if (resultados.length > 0) {
            renderProductosConHighlight(resultados, query);
        } else {
            mostrarSinResultados(query);
        }

        guardarHistorial(query);
    }

    // Event listeners
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(filtrarYRenderizar, 300);
    });
    
    stockToggle.addEventListener('change', filtrarYRenderizar);
    ordenSelect.addEventListener('change', filtrarYRenderizar);

    // Prevenir envío del formulario
    const searchForm = document.querySelector('.search-bar');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            filtrarYRenderizar();
        });
    }
}

// ===================== RENDERIZADO CON RESALTADO =====================
function renderProductosConHighlight(lista, query) {
    const contenedor = document.getElementById("productsGrid");
    const palabras = query.split(/\s+/).filter(p => p);

    contenedor.innerHTML = lista.map(prod => {
        let nombre = prod.nombre;
        let descripcion = prod.descripcion;
        
        // Resaltar palabras encontradas
        palabras.forEach(palabra => {
            const regex = new RegExp(`(${palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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

    asignarEventosAgregar(); // Asignar eventos a los botones
}

// ===================== UTILIDADES =====================
function guardarHistorial(query) {
    if (!query) return;
    
    let historial = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    if (!historial.includes(query)) {
        historial.unshift(query);
        if (historial.length > 10) historial.pop();
        localStorage.setItem('historialBusqueda', JSON.stringify(historial));
    }
}

function mostrarSinResultados(query) {
    const contenedor = document.getElementById("productsGrid");
    contenedor.innerHTML = `
        <div class="sin-resultados">
            <i class="fas fa-search"></i>
            <p>No se encontraron productos para: <strong>${query}</strong></p>
            <button onclick="location.reload()" class="btn-reiniciar">Ver todos los productos</button>
        </div>
    `;
}
