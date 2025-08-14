import { productos } from './productos.js';
import { notificarError, notificarExito, notificarInfo } from './notificaciones.js';

// ===================== FUNCIONES DEL CARRITO =====================

/**
 * Agregar producto al carrito
 */
export function agregarAlCarrito(producto) {
    if (!producto || !producto.nombre) return;

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const index = carrito.findIndex(item => item.nombre === producto.nombre && item.talla === producto.talla);

    // Buscar stock actual desde el array productos
    const productoOriginal = productos.find(p => p.nombre === producto.nombre && p.talla === producto.talla);
    const stockActual = productoOriginal ? productoOriginal.stock : Infinity;

    if (index > -1) {
        // Producto ya existe en el carrito
        if (carrito[index].cantidad + (producto.cantidad || 1) > stockActual) {
            notificarError(
                `Solo quedan ${stockActual} unidades disponibles de "${producto.nombre}" en talla ${producto.talla}`,
                'Stock insuficiente'
            );
            return;
        }
        carrito[index].cantidad += producto.cantidad || 1;
        notificarInfo(
            `Se aumentó la cantidad de "${producto.nombre}" en el carrito`,
            'Cantidad actualizada'
        );
    } else {
        // Producto nuevo en el carrito
        if ((producto.cantidad || 1) > stockActual) {
            notificarError(
                `Solo quedan ${stockActual} unidades disponibles de "${producto.nombre}" en talla ${producto.talla}`,
                'Stock insuficiente'
            );
            return;
        }
        carrito.push({
            nombre: producto.nombre,
            precio: producto.precio,
            talla: producto.talla,
            cantidad: producto.cantidad || 1,
            imagen: producto.imagen
        });
        notificarExito(
            `"${producto.nombre}" agregado al carrito`,
            '¡Producto agregado!'
        );
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
}

/**
 * Mostrar modal del carrito
 */
export function mostrarModalCarrito() {
    const modal = document.getElementById('modalCarrito');
    const body = document.getElementById('modalCarritoBody');

    if (!modal || !body) {
        console.error('No se encontraron los elementos del modal del carrito');
        return;
    }

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    if (carrito.length === 0) {
        body.innerHTML = `<p>El carrito está vacío.</p>`;
    } else {
        body.innerHTML = `
            <h3>Productos en tu carrito</h3>
            ${carrito.map(item => `
                <div class="modal-carrito-item">
                    <img src="${item.imagen}" alt="${item.nombre}" />
                    <div class="info">
                        <p><strong>${item.nombre}</strong></p>
                        <p>Talla: ${item.talla}</p>
                        <p>$${item.precio.toFixed(2)}</p>
                    </div>
                    <div class="cantidad">x${item.cantidad}</div>
                    <button class="btn-eliminar" data-nombre="${item.nombre}" data-talla="${item.talla}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
            <div class="modal-carrito-total">
                <strong>Total: $${calcularTotal(carrito).toFixed(2)}</strong>
            </div>
            <div class="modal-carrito-footer">
                <button id="cerrarModalBtn">Seguir comprando</button>
                <button id="vaciarCarritoBtn">Vaciar carrito</button>
                <button id="irAWspBtn">Enviar compra a WhatsApp</button>
            </div>
        `;
    }

    modal.style.display = 'flex';
    asignarEventosModal();
}

/**
 * Asignar eventos al modal del carrito
 */
function asignarEventosModal() {
    const modal = document.getElementById('modalCarrito');
    const cerrarBtn = document.getElementById('cerrarModalBtn');
    const vaciarBtn = document.getElementById('vaciarCarritoBtn');
    const wspBtn = document.getElementById('irAWspBtn');
    const closeBtn = document.querySelector('.modal-close');
    const botonesEliminar = document.querySelectorAll('.btn-eliminar');

    // Cerrar modal
    if (cerrarBtn) cerrarBtn.onclick = () => cerrarModal();
    if (closeBtn) closeBtn.onclick = () => cerrarModal();
    
    // Vaciar carrito
    if (vaciarBtn) vaciarBtn.onclick = () => vaciarCarrito();
    
    // Enviar a WhatsApp
    if (wspBtn) wspBtn.onclick = () => enviarCarritoWhatsApp();
    
    // Eliminar productos individuales
    botonesEliminar.forEach(btn => {
        btn.onclick = () => {
            const nombre = btn.dataset.nombre;
            const talla = btn.dataset.talla;
            eliminarDelCarrito(nombre, talla);
        };
    });

    // Cerrar al hacer click fuera del modal
    if (modal) {
        modal.onclick = (e) => { 
            if (e.target === modal) cerrarModal(); 
        };
    }
}

/**
 * Actualizar contador del carrito en el header
 */
export function actualizarContadorCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    const badge = document.querySelector('.cart .badge');
    if (badge) {
        badge.textContent = totalItems;
    }
}

/**
 * Eliminar producto específico del carrito
 */
export function eliminarDelCarrito(nombre, talla) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productoEliminado = carrito.find(item => item.nombre === nombre && item.talla === talla);
    
    carrito = carrito.filter(item => !(item.nombre === nombre && item.talla === talla));
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarModalCarrito(); // Refrescar el modal
    
    if (productoEliminado) {
        notificarInfo(
            `"${productoEliminado.nombre}" eliminado del carrito`,
            'Producto eliminado'
        );
    }
}

/**
 * Vaciar todo el carrito
 */
export function vaciarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        notificarInfo('El carrito ya está vacío');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        localStorage.removeItem('carrito');
        actualizarContadorCarrito();
        mostrarModalCarrito();
        notificarExito('Carrito vaciado correctamente', 'Carrito limpio');
    }
}

/**
 * Cerrar modal del carrito
 */
function cerrarModal() {
    const modal = document.getElementById('modalCarrito');
    if (modal) modal.style.display = 'none';
}

/**
 * Calcular total del carrito
 */
function calcularTotal(carrito) {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

/**
 * Enviar carrito a WhatsApp
 */
function enviarCarritoWhatsApp() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    let mensaje = '¡Hola! Me interesan estos productos:\n\n';
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `• ${item.nombre}\n`;
        mensaje += `  Talla: ${item.talla}\n`;
        mensaje += `  Cantidad: ${item.cantidad}\n`;
        mensaje += `  Precio: $${subtotal.toFixed(2)}\n\n`;
        total += subtotal;
    });

    mensaje += `Total: $${total.toFixed(2)}`;

    // Reemplaza con tu número de WhatsApp
    const numeroWhatsApp = '593969251642';
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(urlWhatsApp, '_blank');
}

/**
 * Obtener carrito actual
 */
export function obtenerCarrito() {
    return JSON.parse(localStorage.getItem('carrito')) || [];
}

/**
 * Asignar eventos a botones "Agregar al carrito" de los productos
 */
export function asignarEventosAgregar() {
    const botones = document.querySelectorAll('.product-card__btn');
    botones.forEach(btn => {
        btn.onclick = () => {
            const card = btn.closest('.product-card');
            const nombre = card.querySelector('.product-card__title').textContent;
            const precio = parseFloat(card.dataset.price);
            const talla = card.dataset.size;
            const imagen = card.querySelector('img').src;
            
            agregarAlCarrito({ 
                nombre, 
                precio, 
                talla, 
                cantidad: 1, 
                imagen 
            });
        };
    });
}