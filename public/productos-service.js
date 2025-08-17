// productos-service.js
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase-config.js";

const COLLECTION_NAME = "productos";

// Clase para gestionar productos en Firestore
export class ProductosService {
  
  // Obtener todos los productos
  static async obtenerTodosLosProductos() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const productos = [];
      
      querySnapshot.forEach((doc) => {
        productos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return productos;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  }

  // Obtener productos por categoría
  static async obtenerProductosPorCategoria(categoria) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("categoria", "==", categoria)
      );
      const querySnapshot = await getDocs(q);
      const productos = [];
      
      querySnapshot.forEach((doc) => {
        productos.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return productos;
    } catch (error) {
      console.error("Error al obtener productos por categoría:", error);
      throw error;
    }
  }

  // Obtener un producto específico por ID
  static async obtenerProductoPorId(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error("Producto no encontrado");
      }
    } catch (error) {
      console.error("Error al obtener producto:", error);
      throw error;
    }
  }

  // Buscar productos por nombre
  static async buscarProductos(termino) {
    try {
      const productos = await this.obtenerTodosLosProductos();
      return productos.filter(producto => 
        producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        producto.marca.toLowerCase().includes(termino.toLowerCase())
      );
    } catch (error) {
      console.error("Error al buscar productos:", error);
      throw error;
    }
  }

  // Agregar un nuevo producto
  static async agregarProducto(producto) {
    try {
      // Agregar timestamp de creación
      const nuevoProducto = {
        ...producto,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), nuevoProducto);
      return {
        id: docRef.id,
        ...nuevoProducto
      };
    } catch (error) {
      console.error("Error al agregar producto:", error);
      throw error;
    }
  }

  // Actualizar un producto existente
  static async actualizarProducto(id, datosActualizados) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      const actualizacion = {
        ...datosActualizados,
        fechaActualizacion: new Date()
      };
      
      await updateDoc(docRef, actualizacion);
      
      // Retornar el producto actualizado
      return await this.obtenerProductoPorId(id);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      throw error;
    }
  }

  // Eliminar un producto
  static async eliminarProducto(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      return { success: true, message: "Producto eliminado exitosamente" };
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      throw error;
    }
  }

  // Actualizar stock de un producto
  static async actualizarStock(id, nuevoStock) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        stock: nuevoStock,
        fechaActualizacion: new Date()
      });
      
      return await this.obtenerProductoPorId(id);
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      throw error;
    }
  }

  // Reducir stock después de una compra
  static async reducirStock(id, cantidad = 1) {
    try {
      const producto = await this.obtenerProductoPorId(id);
      
      if (producto.stock < cantidad) {
        throw new Error("Stock insuficiente");
      }
      
      const nuevoStock = producto.stock - cantidad;
      return await this.actualizarStock(id, nuevoStock);
    } catch (error) {
      console.error("Error al reducir stock:", error);
      throw error;
    }
  }

  // Obtener productos con stock bajo (útil para alertas)
  static async obtenerProductosStockBajo(limite = 5) {
    try {
      const productos = await this.obtenerTodosLosProductos();
      return productos.filter(producto => producto.stock <= limite);
    } catch (error) {
      console.error("Error al obtener productos con stock bajo:", error);
      throw error;
    }
  }

  // Migrar productos existentes a Firestore (usar solo una vez)
  static async migrarProductosExistentes(productosArray) {
    try {
      const batch = writeBatch(db);
      
      productosArray.forEach((producto) => {
        const docRef = doc(collection(db, COLLECTION_NAME));
        const productoConFechas = {
          ...producto,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        };
        batch.set(docRef, productoConFechas);
      });
      
      await batch.commit();
      console.log("Migración completada exitosamente");
      return { success: true, message: "Productos migrados exitosamente" };
    } catch (error) {
      console.error("Error en la migración:", error);
      throw error;
    }
  }
}