// Sistema de filtros optimizado para Firebase - Versión limpia
let filtroActual = {
    categoria: null,
    termino: '',
    precioMin: null,
    precioMax: null,
    talla: null
};

let productosFiltrados = [];
let todosLosProductos = [];

// Inicialización principal
async function inicializarSistemaFiltros() {
    try {
        await esperarProductosFirebase();
        configurarEventListeners();
    } catch (error) {
        console.error('Error inicializando filtros:', error);
    }
}

// Esperar productos de Firebase
async function esperarProductosFirebase() {
    return new Promise((resolve) => {
        let intentos = 0;
        const maxIntentos = 50;
        
        const verificarProductos = () => {
            intentos++;
            let productosEncontrados = null;
            
            if (window.productos?.length > 0) {
                productosEncontrados = procesarProductosFirebase(window.productos);
            } else if (window.productosFirebase?.length > 0) {
                productosEncontrados = procesarProductosFirebase(window.productosFirebase);
            } else if (window.productosOriginales?.length > 0) {
                productosEncontrados = procesarProductosFirebase(window.productosOriginales);
            }
            
            if (!productosEncontrados?.length) {
                const productosDOM = extraerProductosDelDOM();
                if (productosDOM.length > 0) {
                    productosEncontrados = productosDOM;
                }
            }
            
            if (productosEncontrados?.length > 0) {
                todosLosProductos = productosEncontrados;
                productosFiltrados = [...productosEncontrados];
                resolve();
                return;
            }
            
            if (intentos < maxIntentos) {
                setTimeout(verificarProductos, 500);
            } else {
                todosLosProductos = [];
                productosFiltrados = [];
                resolve();
            }
        };
        
        verificarProductos();
    });
}

// Procesar productos de Firebase con corrección de subcategorías
function procesarProductosFirebase(productosRaw) {
    if (!Array.isArray(productosRaw)) return [];
    
    return productosRaw.map((producto, index) => {
        let productoId = producto.id;
        if (!productoId || !isNaN(productoId)) {
            productoId = producto.firebaseId || 
                        producto.documentId || 
                        generarIdUnico(producto, index);
        }
        
        return {
            id: productoId,
            firebaseId: producto.firebaseId || producto.id || productoId,
            nombre: producto.nombre || producto.name || producto.title || 'Producto sin nombre',
            marca: producto.marca || producto.brand || 'Sin marca',
            precio: normalizarPrecio(producto.precio || producto.price || 0),
            precioOriginal: producto.precio || producto.price || 0,
            
            // CORRECCIÓN CRÍTICA: Manejo correcto de categorías y subcategorías
            categoria: normalizarCategoria(producto.categoria || producto.category || 'sin categoria'),
            subcategoria: normalizarCategoria(producto.subcategoria || producto.subcategory || ''),
            
            descripcion: producto.descripcion || producto.description || '',
            imagen: producto.imagen || producto.image || producto.foto || '',
            talla: producto.talla || producto.size || null,
            tallas: normalizarTallas(producto.tallas || producto.sizes || producto.talla),
            color: producto.color || null,
            stock: parseInt(producto.stock || 0),
            disponible: (producto.stock || 0) > 0,
            fechaCreacion: producto.fechaCreacion || producto.createdAt || null,
            fechaActualizacion: producto.fechaActualizacion || producto.updatedAt || null,
            ultimaVenta: producto.ultimaVenta || producto.lastSale || null,
            origen: 'Firebase',
            indiceOriginal: index
        };
    });
}

// CORRECCIÓN: Normalizar categorías sin cambiar el case original
function normalizarCategoria(categoria) {
    if (!categoria) return '';
    return categoria.toString().trim();
}

// Generar ID único
function generarIdUnico(producto, index) {
    const nombre = (producto.nombre || producto.name || '').replace(/\s+/g, '');
    const marca = (producto.marca || producto.brand || '').replace(/\s+/g, '');
    const precio = (producto.precio || producto.price || 0).toString();
    const datos = `${nombre}-${marca}-${precio}-${index}`;
    let hash = 0;
    
    for (let i = 0; i < datos.length; i++) {
        const char = datos.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return `prod_${Math.abs(hash)}_${Date.now().toString().slice(-4)}`;
}

// Normalizar precio
function normalizarPrecio(precio) {
    if (typeof precio === 'number' && precio >= 0) {
        return precio;
    }
    
    if (typeof precio === 'string') {
        let precioLimpio = precio.replace(/[^\d.,]/g, '');
        
        if (precioLimpio.includes(',') && precioLimpio.includes('.')) {
            const ultimaComa = precioLimpio.lastIndexOf(',');
            const ultimoPunto = precioLimpio.lastIndexOf('.');
            
            if (ultimaComa > ultimoPunto) {
                precioLimpio = precioLimpio.replace(/\./g, '').replace(',', '.');
            } else {
                precioLimpio = precioLimpio.replace(/,/g, '');
            }
        } else if (precioLimpio.includes(',')) {
            const partes = precioLimpio.split(',');
            if (partes.length === 2 && partes[1].length <= 2) {
                precioLimpio = precioLimpio.replace(',', '.');
            } else {
                precioLimpio = precioLimpio.replace(/,/g, '');
            }
        }
        
        const resultado = parseFloat(precioLimpio);
        return isNaN(resultado) ? 0 : resultado;
    }
    
    return 0;
}

// Normalizar tallas
function normalizarTallas(tallasInput) {
    if (!tallasInput) return [];
    
    if (Array.isArray(tallasInput)) {
        return tallasInput.filter(t => t && t.toString().trim().length > 0);
    }
    
    if (typeof tallasInput === 'string') {
        return tallasInput.split(/[,\s;|]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);
    }
    
    return [tallasInput.toString().trim()].filter(t => t.length > 0);
}

// Extraer productos del DOM
function extraerProductosDelDOM() {
    const productCards = document.querySelectorAll('.product-card, [data-producto-firebase]');
    const productos = [];
    
    productCards.forEach((card, index) => {
        try {
            const producto = {
                id: card.getAttribute('data-firebase-id') || 
                    card.getAttribute('data-product-id') || 
                    `dom_${index}_${Date.now()}`,
                nombre: extraerTextoDelCard(card, ['[data-nombre]', '.product-name', 'h3', '.nombre', '.title']) || 'Producto sin nombre',
                marca: extraerTextoDelCard(card, ['[data-marca]', '.product-brand', '.marca', '.brand']) || 'Sin marca',
                precio: normalizarPrecio(extraerTextoDelCard(card, ['[data-precio]', '.product-price', '.precio', '.price']) || '0'),
                categoria: card.getAttribute('data-categoria') || card.getAttribute('data-category') || 'Sin categoría',
                descripcion: extraerTextoDelCard(card, ['[data-descripcion]', '.descripcion', '.description']) || '',
                imagen: card.querySelector('img')?.src || '',
                tallas: normalizarTallas(extraerTextoDelCard(card, ['[data-tallas]', '.tallas', '.sizes']) || ''),
                stock: parseInt(extraerTextoDelCard(card, ['[data-stock]', '.stock']) || '0'),
                origen: 'DOM-Firebase',
                indiceOriginal: index
            };
            productos.push(producto);
        } catch (error) {
            // Error silencioso
        }
    });
    
    return productos;
}

function extraerTextoDelCard(card, selectores) {
    for (const selector of selectores) {
        const elemento = card.querySelector(selector);
        if (elemento) {
            return elemento.textContent?.trim() || elemento.getAttribute('data-value') || '';
        }
    }
    return null;
}

// Configurar event listeners
function configurarEventListeners() {
    configurarFiltrosCategorias();
    configurarBusqueda();
    configurarFiltrosPrecio();
    configurarFiltrosTallas();
    configurarInicio();
    configurarRecargaFirebase();
}

function configurarFiltrosCategorias() {
    const enlacesCategorias = document.querySelectorAll('.filter-link[data-category]');
    
    enlacesCategorias.forEach(enlace => {
        enlace.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (todosLosProductos.length === 0) {
                await esperarProductosFirebase();
            }
            
            const categoria = enlace.getAttribute('data-category');
            await filtrarPorCategoria(categoria);
            actualizarEstadoNavegacion(enlace);
        });
    });
}

function configurarBusqueda() {
    const formBusqueda = document.querySelector('.search-bar');
    const inputBusqueda = formBusqueda?.querySelector('input[type="search"]');
    
    if (!formBusqueda || !inputBusqueda) return;
    
    formBusqueda.addEventListener('submit', async (e) => {
        e.preventDefault();
        const termino = inputBusqueda.value.trim();
        
        if (todosLosProductos.length === 0 && termino.length > 0) {
            await esperarProductosFirebase();
        }
        
        realizarBusqueda(termino);
    });
    
    let timeoutBusqueda;
    inputBusqueda.addEventListener('input', async (e) => {
        clearTimeout(timeoutBusqueda);
        const termino = e.target.value.trim();
        
        timeoutBusqueda = setTimeout(async () => {
            if (termino.length >= 2) {
                if (todosLosProductos.length === 0) {
                    await esperarProductosFirebase();
                }
                realizarBusqueda(termino);
            } else if (termino.length === 0) {
                mostrarTodosLosProductos();
            }
        }, 300);
    });
}

// CORRECCIÓN PRINCIPAL: Filtrado por categoría y subcategoría mejorado
async function filtrarPorCategoria(categoria) {
    try {
        if (todosLosProductos.length === 0) {
            await esperarProductosFirebase();
        }
        
        filtroActual.categoria = categoria;
        filtroActual.termino = '';
        
        const inputBusqueda = document.querySelector('.search-bar input[type="search"]');
        if (inputBusqueda) inputBusqueda.value = '';
        
        aplicarTodosFiltros();
        
    } catch (error) {
        console.error('Error filtrando por categoría:', error);
        mostrarMensajeError('Error al filtrar productos por categoría');
    }
}

// CORRECCIÓN: Función de filtrado mejorada
function aplicarTodosFiltros() {
    let productos = [...todosLosProductos];
    
    // FILTRO CORREGIDO POR CATEGORÍA Y SUBCATEGORÍA
    if (filtroActual.categoria) {
        productos = productos.filter(producto => {
            const categoriaProducto = producto.categoria || '';
            const subcategoriaProducto = producto.subcategoria || '';
            const filtroCategoria = filtroActual.categoria;
            
            // Comparación exacta (case-sensitive para mantener datos originales)
            return (
                categoriaProducto === filtroCategoria ||
                subcategoriaProducto === filtroCategoria ||
                // Comparación case-insensitive como fallback
                categoriaProducto.toLowerCase() === filtroCategoria.toLowerCase() ||
                subcategoriaProducto.toLowerCase() === filtroCategoria.toLowerCase()
            );
        });
    }
    
    // Filtro por término de búsqueda
    if (filtroActual.termino) {
        productos = busquedaAvanzada(productos, filtroActual.termino);
    }
    
    // Filtro por precio
    if (filtroActual.precioMin !== null || filtroActual.precioMax !== null) {
        productos = productos.filter(producto => {
            const precio = producto.precio || 0;
            
            if (filtroActual.precioMin !== null && precio < filtroActual.precioMin) {
                return false;
            }
            
            if (filtroActual.precioMax !== null && precio > filtroActual.precioMax) {
                return false;
            }
            
            return true;
        });
    }
    
    // Filtro por talla
    if (filtroActual.talla) {
        productos = productos.filter(producto => {
            const tallasProducto = producto.tallas || [];
            
            if (Array.isArray(filtroActual.talla)) {
                return filtroActual.talla.some(talla => 
                    tallasProducto.some(tp => tp.toLowerCase() === talla.toLowerCase())
                );
            } else {
                return tallasProducto.some(tp => 
                    tp.toLowerCase() === filtroActual.talla.toLowerCase()
                );
            }
        });
    }
    
    productosFiltrados = productos;
    const contexto = generarContextoFiltros();
    mostrarProductosFiltrados(productos, contexto);
}

function busquedaAvanzada(productos, termino) {
    if (!Array.isArray(productos) || productos.length === 0) return [];
    
    const terminoLower = termino.toLowerCase();
    const palabras = terminoLower.split(' ').filter(p => p.length > 0);
    
    return productos.filter(producto => {
        if (!producto) return false;
        
        const campos = [
            producto.nombre || '',
            producto.marca || '',
            producto.descripcion || '',
            producto.categoria || '',
            producto.subcategoria || ''
        ];
        
        if (producto.tallas?.length) campos.push(...producto.tallas);
        
        const textoCompleto = campos.join(' ').toLowerCase();
        
        if (textoCompleto.includes(terminoLower)) return true;
        
        if (palabras.every(palabra => textoCompleto.includes(palabra))) return true;
        
        if (palabras.length > 1) {
            return palabras.some(palabra => textoCompleto.includes(palabra));
        }
        
        return false;
    });
}

// Configuraciones adicionales
function configurarRecargaFirebase() {
    document.addEventListener('productosFirebaseDisponibles', async (evento) => {
        if (evento.detail?.productos) {
            todosLosProductos = procesarProductosFirebase(evento.detail.productos);
            productosFiltrados = [...todosLosProductos];
        }
    });
    
    let ultimaLongitud = 0;
    setInterval(() => {
        const longitudActual = window.productos?.length || 0;
        if (longitudActual > 0 && longitudActual !== ultimaLongitud) {
            ultimaLongitud = longitudActual;
            setTimeout(async () => {
                await esperarProductosFirebase();
            }, 1000);
        }
    }, 2000);
}

function configurarFiltrosPrecio() {
    const inputPrecioMin = document.getElementById('precioMin');
    const inputPrecioMax = document.getElementById('precioMax');
    
    if (inputPrecioMin) {
        inputPrecioMin.addEventListener('change', () => {
            filtroActual.precioMin = parseFloat(inputPrecioMin.value) || null;
            aplicarTodosFiltros();
        });
    }
    
    if (inputPrecioMax) {
        inputPrecioMax.addEventListener('change', () => {
            filtroActual.precioMax = parseFloat(inputPrecioMax.value) || null;
            aplicarTodosFiltros();
        });
    }
}

function configurarFiltrosTallas() {
    const selectTalla = document.getElementById('filtroTalla');
    
    if (selectTalla) {
        poblarOpcionesTallas(selectTalla);
        
        selectTalla.addEventListener('change', () => {
            filtroActual.talla = selectTalla.value || null;
            aplicarTodosFiltros();
        });
    }
}

function poblarOpcionesTallas(select) {
    if (todosLosProductos.length === 0) return;
    
    const tallasUnicas = new Set();
    
    todosLosProductos.forEach(producto => {
        const tallas = producto.tallas || [];
        tallas.forEach(talla => tallasUnicas.add(talla));
    });
    
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    Array.from(tallasUnicas).sort().forEach(talla => {
        const option = document.createElement('option');
        option.value = talla;
        option.textContent = talla;
        select.appendChild(option);
    });
}

function configurarInicio() {
    const linkInicio = document.getElementById('linkInicio');
    
    if (linkInicio) {
        linkInicio.addEventListener('click', async (e) => {
            e.preventDefault();
            if (todosLosProductos.length === 0) {
                await esperarProductosFirebase();
            }
            mostrarTodosLosProductos();
        });
    }
}

async function realizarBusqueda(termino) {
    try {
        if (!termino || termino.length < 1) {
            mostrarTodosLosProductos();
            return;
        }
        
        if (todosLosProductos.length === 0) {
            await esperarProductosFirebase();
        }
        
        filtroActual.termino = termino;
        aplicarTodosFiltros();
        
    } catch (error) {
        console.error('Error en búsqueda:', error);
        mostrarMensajeError('Error al realizar la búsqueda');
    }
}

async function mostrarTodosLosProductos() {
    if (todosLosProductos.length === 0) {
        await esperarProductosFirebase();
    }
    
    filtroActual = {
        categoria: null,
        termino: '',
        precioMin: null,
        precioMax: null,
        talla: null
    };
    
    limpiarInputsFiltros();
    
    const productos = [...todosLosProductos];
    productosFiltrados = productos;
    
    mostrarProductosFiltrados(productos, 'Todos los productos');
    actualizarEstadoNavegacion(null);
}

function limpiarInputsFiltros() {
    const inputBusqueda = document.querySelector('.search-bar input[type="search"]');
    if (inputBusqueda) inputBusqueda.value = '';
    
    const inputPrecioMin = document.getElementById('precioMin');
    if (inputPrecioMin) inputPrecioMin.value = '';
    
    const inputPrecioMax = document.getElementById('precioMax');
    if (inputPrecioMax) inputPrecioMax.value = '';
    
    const selectTalla = document.getElementById('filtroTalla');
    if (selectTalla) selectTalla.value = '';
}

function generarContextoFiltros() {
    const contextos = [];
    
    if (filtroActual.categoria) {
        contextos.push(`Categoría: ${filtroActual.categoria}`);
    }
    
    if (filtroActual.termino) {
        contextos.push(`"${filtroActual.termino}"`);
    }
    
    if (filtroActual.precioMin !== null || filtroActual.precioMax !== null) {
        if (filtroActual.precioMin !== null && filtroActual.precioMax !== null) {
            contextos.push(`Precio: $${filtroActual.precioMin} - $${filtroActual.precioMax}`);
        } else if (filtroActual.precioMin !== null) {
            contextos.push(`Precio mín: $${filtroActual.precioMin}`);
        } else {
            contextos.push(`Precio máx: $${filtroActual.precioMax}`);
        }
    }
    
    if (filtroActual.talla) {
        if (Array.isArray(filtroActual.talla)) {
            contextos.push(`Tallas: ${filtroActual.talla.join(', ')}`);
        } else {
            contextos.push(`Talla: ${filtroActual.talla}`);
        }
    }
    
    return contextos.length > 0 ? contextos.join(' | ') : 'Todos los productos';
}

function mostrarProductosFiltrados(productos, contexto) {
    if (typeof renderProducts === 'function') {
        renderProducts(productos);
    } else if (typeof displayProductos === 'function') {
        displayProductos(productos);
    } else if (window.renderizarProductos) {
        window.renderizarProductos(productos);
    } else if (window.mostrarProductos) {
        window.mostrarProductos(productos);
    } else {
        const evento = new CustomEvent('productosActualizados', {
            detail: { productos, contexto, filtros: filtroActual }
        });
        document.dispatchEvent(evento);
    }
    
    actualizarContadorProductos(productos.length, contexto);
}

function actualizarEstadoNavegacion(enlaceActivo) {
    const todosLosEnlaces = document.querySelectorAll('.nav-links a, .filter-link');
    todosLosEnlaces.forEach(enlace => enlace.classList.remove('active'));
    
    if (enlaceActivo) {
        enlaceActivo.classList.add('active');
    } else {
        const linkInicio = document.getElementById('linkInicio');
        if (linkInicio) linkInicio.classList.add('active');
    }
}

function actualizarContadorProductos(cantidad, contexto) {
    const contador = document.querySelector('.section-title, .productos-contador');
    if (contador) {
        const textoOriginal = 'Productos';
        contador.textContent = contexto === 'Todos los productos' ? 
            `${textoOriginal} (${cantidad})` : `${contexto} (${cantidad})`;
    }
}

function mostrarMensajeError(mensaje) {
    console.error('Error:', mensaje);
    
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(mensaje, 'error');
    } else {
        const notificacion = document.createElement('div');
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 1000;
            font-size: 14px;
        `;
        
        document.body.appendChild(notificacion);
        setTimeout(() => notificacion.remove(), 5000);
    }
}

// Funciones públicas
window.filtrarPorCategoria = filtrarPorCategoria;
window.realizarBusqueda = realizarBusqueda;
window.mostrarTodosLosProductos = mostrarTodosLosProductos;
window.aplicarTodosFiltros = aplicarTodosFiltros;
window.obtenerProductosFiltrados = () => [...productosFiltrados];
window.obtenerFiltroActual = () => ({ ...filtroActual });
window.obtenerTodosLosProductos = () => [...todosLosProductos];
window.recargarProductosFirebase = esperarProductosFirebase;

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarSistemaFiltros, 1000);
});

document.addEventListener('firestoreReady', () => {
    setTimeout(inicializarSistemaFiltros, 500);
});

document.addEventListener('productosFirebaseCargados', () => {
    setTimeout(inicializarSistemaFiltros, 300);
});

if (document.readyState !== 'loading') {
    setTimeout(inicializarSistemaFiltros, 800);
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inicializarSistemaFiltros,
        filtrarPorCategoria,
        realizarBusqueda,
        mostrarTodosLosProductos,
        procesarProductosFirebase
    };
}