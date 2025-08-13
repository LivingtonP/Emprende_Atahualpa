import { inicializarFiltros, asignarEventosHeader, asignarEventosInicio, inicializarBusquedaAvanzada } from './filtros.js';


window.addEventListener('DOMContentLoaded', () => {
    fetch('header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header-container').innerHTML = html;

        inicializarFiltros();
        asignarEventosHeader();
        asignarEventosInicio();
        inicializarBusquedaAvanzada();// buscador ahora sí
    });
});
