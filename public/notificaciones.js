// ===================== SISTEMA DE NOTIFICACIONES PROFESIONALES =====================

/**
 * Configuración global de notificaciones
 */
const NOTIFICATION_CONFIG = {
    types: {
        success: { icon: 'fas fa-check-circle', color: '#10B981', defaultTitle: '¡Perfecto!', gradient: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)' },
        error: { icon: 'fas fa-exclamation-circle', color: '#EF4444', defaultTitle: 'Oops...', gradient: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' },
        warning: { icon: 'fas fa-exclamation-triangle', color: '#F59E0B', defaultTitle: 'Atención', gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' },
        info: { icon: 'fas fa-info-circle', color: '#3B82F6', defaultTitle: 'Información', gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' }
    },
    durations: { 
        success: 4000, 
        error: 6000, 
        warning: 5000, 
        info: 4000 
    }
};

/**
 * Inicializar contenedor y estilos de notificaciones
 */
function initNotificationContainer() {
    let container = document.getElementById('notifications-container');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'notifications-container';
    container.className = 'notifications-container';
    
    if (!document.getElementById('notifications-style')) {
        const style = document.createElement('style');
        style.id = 'notifications-style';
        style.textContent = `
            .notifications-container { 
                position: fixed; 
                top: 20px; 
                right: 20px; 
                z-index: 10000; 
                max-width: 400px; 
                pointer-events: none;
            }
            
            .notification {
                display: flex; 
                align-items: flex-start; 
                background: white; 
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); 
                margin-bottom: 12px; 
                padding: 16px;
                border-left: 4px solid; 
                opacity: 0; 
                transform: translateX(100%);
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                backdrop-filter: blur(10px);
                pointer-events: auto;
                max-width: 100%;
                word-wrap: break-word;
            }
            
            .notification.show { 
                opacity: 1; 
                transform: translateX(0); 
            }
            
            .notification.hide { 
                opacity: 0; 
                transform: translateX(100%); 
                margin-bottom: 0; 
                padding-top: 0; 
                padding-bottom: 0; 
                max-height: 0; 
            }
            
            .notification.success { 
                border-left-color: #10B981; 
                background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); 
            }
            
            .notification.error { 
                border-left-color: #EF4444; 
                background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); 
            }
            
            .notification.warning { 
                border-left-color: #F59E0B; 
                background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); 
            }
            
            .notification.info { 
                border-left-color: #3B82F6; 
                background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); 
            }
            
            .notification-icon { 
                font-size: 20px; 
                margin-right: 12px; 
                margin-top: 2px; 
                flex-shrink: 0; 
            }
            
            .notification.success .notification-icon { color: #10B981; }
            .notification.error .notification-icon { color: #EF4444; }
            .notification.warning .notification-icon { color: #F59E0B; }
            .notification.info .notification-icon { color: #3B82F6; }
            
            .notification-content { 
                flex: 1; 
                min-width: 0; 
            }
            
            .notification-title { 
                font-weight: 600; 
                font-size: 14px; 
                margin-bottom: 4px; 
                color: #111827; 
                line-height: 1.3;
            }
            
            .notification-message { 
                font-size: 13px; 
                line-height: 1.4; 
                color: #6B7280; 
                word-wrap: break-word; 
                white-space: pre-line; 
            }
            
            .notification-close {
                background: none; 
                border: none; 
                color: #9CA3AF; 
                cursor: pointer; 
                font-size: 12px;
                padding: 4px; 
                border-radius: 4px; 
                transition: all 0.2s; 
                flex-shrink: 0; 
                margin-left: 8px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover { 
                background: rgba(0, 0, 0, 0.05); 
                color: #6B7280; 
            }
            
            .notification-close:active {
                transform: scale(0.95);
            }
            
            @media (max-width: 480px) {
                .notifications-container { 
                    left: 12px; 
                    right: 12px; 
                    top: 12px; 
                    max-width: none; 
                }
                .notification { 
                    margin-bottom: 8px; 
                    padding: 12px;
                }
                .notification-title {
                    font-size: 13px;
                }
                .notification-message {
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(container);
    return container;
}

/**
 * Sistema principal de notificaciones
 */
function mostrarNotificacion(message, type = 'info', title = '', duration = null) {
    // Validar parámetros
    if (!message || typeof message !== 'string') {
        console.warn('Sistema de Notificaciones: Mensaje inválido');
        return null;
    }

    const config = NOTIFICATION_CONFIG.types[type];
    if (!config) {
        console.warn(`Sistema de Notificaciones: Tipo "${type}" no válido. Usando "info"`);
        type = 'info';
        config = NOTIFICATION_CONFIG.types.info;
    }

    const container = initNotificationContainer();
    const finalTitle = title || config.defaultTitle;
    const finalDuration = duration !== null ? duration : NOTIFICATION_CONFIG.durations[type];

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('data-notification-id', Date.now());
    notification.innerHTML = `
        <i class="${config.icon} notification-icon" aria-hidden="true"></i>
        <div class="notification-content">
            <div class="notification-title">${finalTitle}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" type="button" aria-label="Cerrar notificación">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;

    // Función para cerrar notificación
    const closeNotification = () => {
        if (notification.parentNode) {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }
    };

    // Eventos
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotification();
        });
    }

    // Click en la notificación para cerrar (opcional)
    notification.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-close')) {
            closeNotification();
        }
    });

    // Agregar al contenedor y mostrar
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-cerrar si tiene duración
    if (finalDuration > 0) {
        setTimeout(closeNotification, finalDuration);
    }

    return notification;
}

/**
 * Funciones específicas de notificación
 */
const notificarExito = (message, title = '', duration = null) => {
    return mostrarNotificacion(message, 'success', title, duration);
};

const notificarError = (message, title = '', duration = null) => {
    return mostrarNotificacion(message, 'error', title, duration);
};

const notificarAdvertencia = (message, title = '', duration = null) => {
    return mostrarNotificacion(message, 'warning', title, duration);
};

const notificarInfo = (message, title = '', duration = null) => {
    return mostrarNotificacion(message, 'info', title, duration);
};

/**
 * Cerrar todas las notificaciones
 */
const cerrarTodasNotificaciones = () => {
    const notificaciones = document.querySelectorAll('.notification');
    notificaciones.forEach(notification => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    });
};

/**
 * Obtener número de notificaciones activas
 */
const contarNotificacionesActivas = () => {
    return document.querySelectorAll('.notification').length;
};

/**
 * Cerrar notificaciones por tipo
 */
const cerrarNotificacionesPorTipo = (tipo) => {
    const notificaciones = document.querySelectorAll(`.notification.${tipo}`);
    notificaciones.forEach(notification => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    });
};

// ===================== EXPORTACIÓN GLOBAL =====================

// Asignar funciones al objeto window para uso global
if (typeof window !== 'undefined') {
    Object.assign(window, {
        // Función principal
        mostrarNotificacion,
        
        // Funciones específicas
        notificarExito,
        notificarError,
        notificarAdvertencia,
        notificarInfo,
        
        // Funciones de control
        cerrarTodasNotificaciones,
        contarNotificacionesActivas,
        cerrarNotificacionesPorTipo,
        
        // Configuración (solo lectura)
        NOTIFICATION_CONFIG: Object.freeze(NOTIFICATION_CONFIG)
    });
}

// ===================== INICIALIZACIÓN =====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Sistema de Notificaciones inicializado correctamente');
    
    // Opcional: Mostrar notificación de bienvenida (comentado por defecto)
    // notificarInfo('Sistema de notificaciones cargado', '🔔 Sistema Listo', 3000);
});

// Exportación para módulos ES6 (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mostrarNotificacion,
        notificarExito,
        notificarError,
        notificarAdvertencia,
        notificarInfo,
        cerrarTodasNotificaciones,
        contarNotificacionesActivas,
        cerrarNotificacionesPorTipo,
        NOTIFICATION_CONFIG
    };
}