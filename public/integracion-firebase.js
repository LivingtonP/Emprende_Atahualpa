// integracion-firebase.js - Código para integrar el sistema de filtros con Firebase

// Función para conectar con tu colección de Firebase actual
async function conectarConFirebaseStore() {
    try {
        if (typeof db === 'undefined') {
            throw new Error('Firebase no está inicializado');
        }
        
        const productosRef = db.collection('ventas').doc('productos');
        
        const unsubscribe = productosRef.onSnapshot(
            (snapshot) => {
                if (snapshot.exists) {
                    const data = snapshot.data();
                    const productos = procesarProductosDeEstructuraFirebase(data);
                    
                    if (productos.length > 0) {
                        window.productos = productos;
                        
                        const evento = new CustomEvent('productosFirebaseDisponibles', {
                            detail: { productos, fuente: 'Firebase-Store' }
                        });
                        document.dispatchEvent(evento);
                    }
                }
            },
            (error) => {
                throw error;
            }
        );
        
        return unsubscribe;
        
    } catch (error) {
        return null;
    }
}

// Función alternativa para obtener todos los documentos de una subcolección
async function obtenerProductosDeSubcoleccion() {
    try {
        if (typeof db === 'undefined') {
            throw new Error('Firebase no está inicializado');
        }
        
        const productosSnapshot = await db.collection('ventas')
            .doc('productos')
            .collection('items')
            .get();
        
        if (productosSnapshot.empty) {
            return [];
        }
        
        const productos = [];
        productosSnapshot.forEach((doc) => {
            const data = doc.data();
            productos.push({
                id: doc.id,
                firebaseId: doc.id,
                ...data
            });
        });
        
        return productos;
        
    } catch (error) {
        return [];
    }
}

// Función para obtener productos de documentos individuales
async function obtenerProductosDeDocumentosIndividuales() {
    try {
        if (typeof db === 'undefined') {
            throw new Error('Firebase no está inicializado');
        }
        
        const documentIds = [
            '6G3B8wl1fgmb8afvT53v',
            'B7XDkQ6udBE20vOca6gN',
            'JNDUGYvAhyylZBzvyIqx',
            'P7SfwlzdU0r4DbPbxT34',
            'WubhjR4Gzqc6AsEfTPyW'
        ];
        
        const productos = [];
        
        const promesasDocumentos = documentIds.map(async (docId) => {
            try {
                const docRef = db.collection('ventas').doc('productos').collection('items').doc(docId);
                const doc = await docRef.get();
                
                if (doc.exists) {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        firebaseId: doc.id,
                        ...data
                    };
                }
                return null;
            } catch (error) {
                return null;
            }
        });
        
        const resultados = await Promise.all(promesasDocumentos);
        
        resultados.forEach(producto => {
            if (producto) productos.push(producto);
        });
        
        return productos;
        
    } catch (error) {
        return [];
    }
}

// Función para procesar productos según tu estructura actual de Firebase
function procesarProductosDeEstructuraFirebase(data) {
    const productos = [];
    
    if (typeof data === 'object' && data !== null) {
        if (data.productos && Array.isArray(data.productos)) {
            productos.push(...data.productos);
        }
        else if (data.items && Array.isArray(data.items)) {
            productos.push(...data.items);
        }
        else {
            Object.keys(data).forEach(key => {
                if (typeof data[key] === 'object' && data[key] !== null) {
                    if (data[key].nombre || data[key].name || data[key].precio || data[key].price) {
                        productos.push({
                            id: key,
                            firebaseId: key,
                            ...data[key]
                        });
                    }
                }
            });
        }
    }
    
    return productos.length > 0 ? window.procesarProductosFirebase(productos) : [];
}

// Función para obtener productos usando query más flexible
async function obtenerProductosConQuery() {
    try {
        if (typeof db === 'undefined') {
            throw new Error('Firebase no está inicializado');
        }
        
        const rutasPosibles = [
            'productos',
            'ventas/productos/items',
            'tienda/productos',
            'inventory/productos'
        ];
        
        for (const ruta of rutasPosibles) {
            try {
                const snapshot = await db.collection(ruta)
                    .orderBy('fechaCreacion', 'desc')
                    .limit(100)
                    .get();
                
                if (!snapshot.empty) {
                    const productos = [];
                    snapshot.forEach((doc) => {
                        productos.push({
                            id: doc.id,
                            firebaseId: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    return productos;
                }
            } catch (error) {
                continue;
            }
        }
        
        return [];
        
    } catch (error) {
        return [];
    }
}

// Función para configurar listener en tiempo real más robusto
function configurarListenerTiempoReal() {
    let unsubscribe = null;
    
    const intentarListener = async () => {
        try {
            if (db && db.collection) {
                unsubscribe = db.collection('productos')
                    .onSnapshot(
                        (snapshot) => {
                            const productos = [];
                            snapshot.forEach((doc) => {
                                productos.push({
                                    id: doc.id,
                                    firebaseId: doc.id,
                                    ...doc.data()
                                });
                            });
                            
                            if (productos.length > 0) {
                                actualizarSistemaConProductos(productos);
                            }
                        },
                        (error) => {
                            setTimeout(() => {
                                configurarListenerAlternativo();
                            }, 2000);
                        }
                    );
            }
        } catch (error) {
            configurarListenerAlternativo();
        }
    };
    
    const configurarListenerAlternativo = () => {
        const intervalo = setInterval(async () => {
            try {
                const productos = await obtenerProductosConQuery();
                if (productos.length > 0) {
                    actualizarSistemaConProductos(productos);
                }
            } catch (error) {
                // Error silenciado
            }
        }, 30000);
        
        unsubscribe = () => {
            clearInterval(intervalo);
        };
    };
    
    intentarListener();
    
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}

// Función para actualizar el sistema de filtros con nuevos productos
function actualizarSistemaConProductos(productos) {
    const productosProcessados = window.procesarProductosFirebase(productos);
    
    window.productos = productosProcessados;
    window.productosFirebase = productosProcessados;
    
    const evento = new CustomEvent('productosFirebaseDisponibles', {
        detail: { 
            productos: productosProcessados, 
            fuente: 'Tiempo-Real',
            timestamp: new Date().toISOString()
        }
    });
    document.dispatchEvent(evento);
}

// Función de inicialización automática
async function inicializarIntegracionFirebase() {
    let intentos = 0;
    const maxIntentos = 20;
    
    const esperarFirebase = () => {
        return new Promise((resolve) => {
            const verificar = () => {
                intentos++;
                
                if (typeof db !== 'undefined' && db) {
                    resolve(true);
                } else if (intentos < maxIntentos) {
                    setTimeout(verificar, 1000);
                } else {
                    resolve(false);
                }
            };
            verificar();
        });
    };
    
    const firebaseDisponible = await esperarFirebase();
    
    if (firebaseDisponible) {
        const unsubscribe = configurarListenerTiempoReal();
        
        try {
            const productos = await obtenerProductosConQuery();
            if (productos.length > 0) {
                actualizarSistemaConProductos(productos);
            } else {
                const productosEspecificos = await obtenerProductosDeDocumentosIndividuales();
                if (productosEspecificos.length > 0) {
                    actualizarSistemaConProductos(productosEspecificos);
                }
            }
        } catch (error) {
            // Error silenciado
        }
        
        window.desconectarFirebase = unsubscribe;
    }
}

// Funciones de utilidad pública
window.inicializarIntegracionFirebase = inicializarIntegracionFirebase;
window.obtenerProductosConQuery = obtenerProductosConQuery;
window.configurarListenerTiempoReal = configurarListenerTiempoReal;

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(inicializarIntegracionFirebase, 2000);
});

document.addEventListener('firebaseReady', inicializarIntegracionFirebase);

if (typeof db !== 'undefined') {
    setTimeout(inicializarIntegracionFirebase, 1000);
}

// redireccion-productos.js - Sistema de redirección automática a la sección de productos

// Configuración de la redirección
const configRedireccion = {
    selectoresProductos: [
        '#productsGrid',
        '.products-grid',          
        '#productos',
        '.productos-container',
        '.products-container',
        '#seccionProductos',
        '.section-productos',
        '[data-productos]'
    ],
    
    scrollSuave: true,
    offsetScroll: -80,
    duracionScroll: 800,
    mostrarIndicador: true,
    soloEnBusquedas: false
};

// Función principal de redirección
function redirigirAProductos(contexto = 'busqueda') {
    const seccionProductos = encontrarSeccionProductos();
    
    if (!seccionProductos) {
        return false;
    }
    
    if (configRedireccion.mostrarIndicador) {
        mostrarIndicadorRedireccion();
    }
    
    if (configRedireccion.scrollSuave) {
        scrollSuaveAElemento(seccionProductos);
    } else {
        seccionProductos.scrollIntoView();
    }
    
    destacarSeccionMomentaneamente(seccionProductos);
    
    return true;
}

// Encontrar la sección de productos usando múltiples selectores
function encontrarSeccionProductos() {
    for (const selector of configRedireccion.selectoresProductos) {
        const elemento = document.querySelector(selector);
        if (elemento) {
            return elemento;
        }
    }
    
    const elementosConTexto = document.querySelectorAll('div, section');
    for (const elemento of elementosConTexto) {
        const id = elemento.id?.toLowerCase() || '';
        const className = elemento.className?.toLowerCase() || '';
        const dataAttr = elemento.getAttribute('data-section')?.toLowerCase() || '';
        
        if (id.includes('product') || className.includes('product') || 
            id.includes('grid') || className.includes('grid') ||
            dataAttr.includes('product')) {
            return elemento;
        }
    }
    
    return null;
}

// Scroll suave personalizado
function scrollSuaveAElemento(elemento) {
    const rect = elemento.getBoundingClientRect();
    const offsetTop = window.pageYOffset + rect.top + configRedireccion.offsetScroll;
    
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    } else {
        scrollSuaveManual(offsetTop);
    }
}

// Scroll suave manual para compatibilidad
function scrollSuaveManual(targetY) {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const duration = configRedireccion.duracionScroll;
    let start = null;
    
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        
        const ease = progress < 0.5 ? 
            2 * progress * progress : 
            -1 + (4 - 2 * progress) * progress;
        
        window.scrollTo(0, startY + distance * ease);
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    
    requestAnimationFrame(step);
}

// Mostrar indicador visual de redirección
function mostrarIndicadorRedireccion() {
    let indicador = document.getElementById('indicadorRedireccion');
    
    if (!indicador) {
        indicador = document.createElement('div');
        indicador.id = 'indicadorRedireccion';
        indicador.innerHTML = `
            <div class="indicador-content">
                <span class="icono">👀</span>
                <span class="texto">Mostrando resultados...</span>
            </div>
        `;
        
        indicador.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            z-index: 10000;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #indicadorRedireccion .indicador-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            #indicadorRedireccion .icono {
                font-size: 16px;
                animation: parpadeo 1.5s ease-in-out infinite;
            }
            
            @keyframes parpadeo {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(indicador);
    }
    
    indicador.style.opacity = '1';
    
    setTimeout(() => {
        indicador.style.opacity = '0';
    }, 1500);
}

// Destacar sección momentáneamente
function destacarSeccionMomentaneamente(elemento) {
    elemento.classList.add('seccion-destacada');
    
    if (!document.getElementById('estilosDestacado')) {
        const style = document.createElement('style');
        style.id = 'estilosDestacado';
        style.textContent = `
            .seccion-destacada {
                animation: destacarSeccion 2s ease-out;
            }
            
            @keyframes destacarSeccion {
                0% {
                    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 0 10px rgba(74, 144, 226, 0.1);
                    transform: scale(1.01);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        elemento.classList.remove('seccion-destacada');
    }, 2000);
}

// Integrar con el sistema de filtros existente
function integrarConSistemaFiltros() {
    if (typeof window.realizarBusqueda === 'function') {
        const busquedaOriginal = window.realizarBusqueda;
        
        window.realizarBusqueda = async function(termino) {
            const resultado = await busquedaOriginal.call(this, termino);
            
            if (termino && termino.trim().length > 0) {
                setTimeout(() => {
                    redirigirAProductos('busqueda');
                }, 300);
            }
            
            return resultado;
        };
    }
    
    if (!configRedireccion.soloEnBusquedas && typeof window.filtrarPorCategoria === 'function') {
        const filtroOriginal = window.filtrarPorCategoria;
        
        window.filtrarPorCategoria = async function(categoria) {
            const resultado = await filtroOriginal.call(this, categoria);
            
            setTimeout(() => {
                redirigirAProductos('categoria');
            }, 200);
            
            return resultado;
        };
    }
}

// Configurar redirección para formularios de búsqueda
function configurarFormulariosBusqueda() {
    const formularios = document.querySelectorAll('.search-bar, form[role="search"], [data-search-form]');
    
    formularios.forEach(form => {
        form.addEventListener('submit', (e) => {
            const input = form.querySelector('input[type="search"], input[type="text"]');
            const termino = input?.value?.trim();
            
            if (termino && termino.length > 0) {
                setTimeout(() => {
                    redirigirAProductos('formulario');
                }, 100);
            }
        });
    });
}

// Configurar inputs de búsqueda en tiempo real
function configurarBusquedaTiempoReal() {
    const inputs = document.querySelectorAll(
        'input[type="search"], ' +
        '.search-bar input, ' +
        '[data-search-input], ' +
        'input[placeholder*="buscar" i], ' +
        'input[placeholder*="search" i]'
    );
    
    inputs.forEach(input => {
        let timeoutRedireccion;
        
        input.addEventListener('input', (e) => {
            const termino = e.target.value.trim();
            
            clearTimeout(timeoutRedireccion);
            
            if (termino.length >= 2) {
                timeoutRedireccion = setTimeout(() => {
                    redirigirAProductos('tiempo-real');
                }, 800);
            }
        });
    });
}

// Funciones de configuración pública
window.configurarRedireccionProductos = function(opciones = {}) {
    Object.assign(configRedireccion, opciones);
};

window.redirigirAProductos = redirigirAProductos;

window.probarRedireccion = function() {
    const exito = redirigirAProductos('prueba');
    return exito;
};

// Función de inicialización
function inicializarSistemaRedireccion() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(configurarSistema, 500);
        });
    } else {
        setTimeout(configurarSistema, 500);
    }
    
    function configurarSistema() {
        try {
            const seccion = encontrarSeccionProductos();
            
            configurarFormulariosBusqueda();
            configurarBusquedaTiempoReal();
            
            setTimeout(() => {
                integrarConSistemaFiltros();
            }, 1000);
            
        } catch (error) {
            // Error silenciado
        }
    }
}

// Auto-inicialización
inicializarSistemaRedireccion();

// Escuchar eventos del sistema de filtros
document.addEventListener('productosActualizados', (evento) => {
    if (evento.detail?.contexto && evento.detail.contexto !== 'Todos los productos') {
        setTimeout(() => {
            redirigirAProductos('filtros-actualizados');
        }, 200);
    }
});

document.addEventListener('productosFirebaseActualizados', (evento) => {
    if (evento.detail?.fuente && evento.detail.fuente !== 'carga-inicial') {
        setTimeout(() => {
            redirigirAProductos('firebase-actualizado');
        }, 300);
    }
});