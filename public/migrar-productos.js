// migrar-productos.js
import { ProductosService } from './productos-service.js';

// Tus productos actuales
const productos = [
  {
    nombre: "Enterizo ",
    marca: "LUXE COLLECTION",
    precio: 19.99,
    precioOriginal: 25.99,
    descuento: "5",
    imagen: "../src/mujeres/prenda1.png",
    categoria: "prendaOfertas",
    talla: "M",
    descripcion: "Enterizo color rosa , sin mangas,premiun.",
    stock: 2
  },
  {
    nombre: "Enterizo de niña",
    marca: "Creaciones Anthonella",
    precio: 3.49,
    imagen: "../src/mujeres/enterizo.png",
    categoria: "mujer",
    talla: "s",
    descripcion: "Enterizo color rosa, con dibujos animados ",
    stock: 1
  },
  {
    nombre: "Blusa Azul sencilla",
    marca: "Slim fit",
    precio: 2.99,
    imagen: "../src/mujeres/blusa azul.jpg",
    categoria: "mujer",
    talla: "S",
    descripcion: "Blusa de color azul sencilla, con magas ",
    stock: 1
  },
  {
    nombre: "Abrigo ",
    marca: "Sport ST",
    precio: 19.99,
    imagen: "../src/hombres/abrigo1.png",
    categoria: "hombre",
    talla: "42",
    descripcion: "Abrigo de algodón, color negro con diseños color cafe claro, contiene dos bolsillos externos",
    stock: 1
  },
  {
    nombre: "Pantaloneta",
    marca: "Adidas replica económica",
    precio: 2.99,
    imagen: "../src/hombres/pantr.png",
    categoria: "hombre",
    talla: "38",
    descripcion: "Pantaloneta color roja, con franjas negras",
    stock: 1
  }
];

// Función para ejecutar la migración
async function ejecutarMigracion() {
  try {
    console.log("Iniciando migración de productos...");
    
    const resultado = await ProductosService.migrarProductosExistentes(productos);
    
    if (resultado.success) {
      console.log("✅ Migración completada exitosamente");
      
      // Verificar que los productos se guardaron correctamente
      const productosGuardados = await ProductosService.obtenerTodosLosProductos();
      console.log(`📦 Total de productos en Firestore: ${productosGuardados.length}`);
      
      // Mostrar los productos guardados
      productosGuardados.forEach((producto, index) => {
        console.log(`${index + 1}. ${producto.nombre} - ID: ${producto.id}`);
      });
    }
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  }
}

// Ejecutar la migración (descomenta la siguiente línea para ejecutar)
// ejecutarMigracion();

// También puedes exportar los productos y la función para usar en otros archivos
export { productos, ejecutarMigracion };
