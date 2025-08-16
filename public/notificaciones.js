// notificaciones.js - Sistema de notificaciones personalizadas

/**
 * Mostrar notificación personalizada
 * @param {string} message - Mensaje principal
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título opcional
 * @param {number} duration - Duración en ms (0 = no auto-cerrar)
 */
export function mostrarNotificacion(message, type = 'info', title = '', duration = 5000) {
    // Asegurar que existe el contenedor
    let container = document.getElementById('notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    // Iconos según el tipo
    const iconos = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    // Títulos por defecto
    const titulosPorDefecto = {
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información'
    };

    const tituloFinal = title || titulosPorDefecto[type];

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="${iconos[type]} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${tituloFinal}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" type="button">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Agregar al contenedor
    container.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Función para cerrar
    const cerrarNotificacion = () => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };

    // Evento del botón cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', cerrarNotificacion);

    // Auto-cerrar si se especifica duración
    if (duration > 0) {
        setTimeout(cerrarNotificacion, duration);
    }

    // Cerrar al hacer click en la notificación (opcional)
    notification.addEventListener('click', (e) => {
        if (e.target !== closeBtn && !closeBtn.contains(e.target)) {
            cerrarNotificacion();
        }
    });

    return notification;
}

/**
 * Funciones específicas para cada tipo
 */
export function notificarExito(message, title = '', duration = 4000) {
    return mostrarNotificacion(message, 'success', title, duration);
}

export function notificarError(message, title = '', duration = 6000) {
    return mostrarNotificacion(message, 'error', title, duration);
}

export function notificarAdvertencia(message, title = '', duration = 5000) {
    return mostrarNotificacion(message, 'warning', title, duration);
}

export function notificarInfo(message, title = '', duration = 4000) {
    return mostrarNotificacion(message, 'info', title, duration);
}

/**
 * Cerrar todas las notificaciones
 */
export function cerrarTodasNotificaciones() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

export function mostrarModalConfirmacion(mensaje, onConfirm) {
    const modal = document.getElementById('modalConfirmacion');
    const mensajeEl = document.getElementById('modalConfirmacionMensaje');
    const btnCancelar = document.getElementById('modalCancelarBtn');
    const btnAceptar = document.getElementById('modalAceptarBtn');

    mensajeEl.textContent = mensaje;
    modal.style.display = 'flex';

    // Limpiar eventos anteriores
    btnAceptar.onclick = null;
    btnCancelar.onclick = null;

    btnAceptar.onclick = () => {
        modal.style.display = 'none';
        if (onConfirm) onConfirm();
    };

    btnCancelar.onclick = () => {
        modal.style.display = 'none';
    };
}
