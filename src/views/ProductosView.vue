<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerProductos, guardarProductos } from '@/services/db.js'
import { validarProducto } from '@/services/operaciones.js'

const router = useRouter()

const nombre = ref('')
const categoria = ref('')
const cantidad = ref('')
const precio = ref('')
const mensaje = ref('')
const busqueda = ref('')
const categoriaFiltro = ref('')

const productos = ref([])

onMounted(() => {
  productos.value = obtenerProductos()
})

const sincronizarYGuardar = () => {
  guardarProductos(productos.value)
}

const agregarProducto = () => {
  mensaje.value = ''

  const error = validarProducto({ nombre: nombre.value, categoria: categoria.value,
    cantidad: cantidad.value, precio: precio.value })
  if (error) {
    mensaje.value = error
    return
  }

  productos.value.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    nombre: nombre.value.trim(),
    categoria: categoria.value,
    cantidad: Number(cantidad.value),
    precio: Number(precio.value),
  })

  sincronizarYGuardar()

  nombre.value = ''
  categoria.value = ''
  cantidad.value = ''
  precio.value = ''

  mensaje.value = 'Producto registrado correctamente.'
}

const eliminarProducto = (id) => {
  productos.value = productos.value.filter((producto) => producto.id !== id)
  sincronizarYGuardar()
}

const incrementarStock = (producto) => {
  producto.cantidad++
  sincronizarYGuardar()
}

const decrementarStock = (producto) => {
  if (producto.cantidad > 0) {
    producto.cantidad--
    sincronizarYGuardar() // Si llega a 0, al guardarse dejará de mostrarse aquí automáticamente
  }
}

// CONDICIÓN: En Mi Despensa solo se muestran los productos con stock mayor a 0
const productosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()
  const categoriaSeleccionada = categoriaFiltro.value

  return productos.value
    .filter((producto) => Number(producto.cantidad) > 0) // <--- Filtro clave
    .filter((producto) => {
      const coincideTexto =
        !texto ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.categoria.toLowerCase().includes(texto)

      const coincideCategoria =
        !categoriaSeleccionada || producto.categoria === categoriaSeleccionada

      return coincideTexto && coincideCategoria
    })
})

const totalProductos = computed(() => {
  return productos.value.reduce((total, producto) => total + Number(producto.cantidad), 0)
})

const valorInventario = computed(() => {
  return productos.value.reduce((total, producto) => total + (producto.precio * producto.cantidad), 0)
})

const formatearPrecio = (precio) => {
  return Number(precio || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

const volverInicio = () => {
  router.push('/inicio')
}
</script>

<template>
  <div class="productos-page">
    <header class="encabezado">
      <div>
        <h1>🛒 Mi despensa</h1>
        <p>Registra y administra los productos disponibles en tu hogar</p>
      </div>

      <button class="volver" @click="volverInicio">← Volver al inicio</button>
    </header>

    <main class="contenido">
      <section class="resumen-grid">
        <div class="resumen-card">
          <span>📦</span>
          <div>
            <p>Productos con stock</p>
            <strong>{{ productos.filter(p => Number(p.cantidad) > 0).length }}</strong>
          </div>
        </div>

        <div class="resumen-card">
          <span>🔢</span>
          <div>
            <p>Unidades disponibles</p>
            <strong>{{ totalProductos }}</strong>
          </div>
        </div>

        <div class="resumen-card">
          <span>💵</span>
          <div>
            <p>Valor de la despensa</p>
            <strong>{{ formatearPrecio(valorInventario) }}</strong>
          </div>
        </div>
      </section>

      <section class="formulario-card">
        <h2>Registrar producto</h2>

        <form @submit.prevent="agregarProducto">
          <div class="form-grid">
            <div class="campo">
              <label for="nombre">Producto</label>
              <input id="nombre" v-model="nombre" type="text" placeholder="Ej. Leche" />
            </div>

            <div class="campo">
              <label for="categoria">Categoría</label>
              <select id="categoria" v-model="categoria">
                <option value="" disabled>Selecciona una categoría</option>
                <option>Frutas/Verduras</option>
                <option>Carnes</option>
                <option>Lácteos</option>
                <option>Panadería</option>
                <option>Limpieza</option>
                <option>Enlatados</option>
              </select>
            </div>

            <div class="campo">
              <label for="cantidad">Cantidad</label>
              <input id="cantidad" v-model="cantidad" type="number" min="1" step="1" placeholder="1" />
            </div>

            <div class="campo">
              <label for="precio">Precio unitario</label>
              <input
                id="precio"
                v-model="precio"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <p
            v-if="mensaje"
            :class="mensaje.includes('correctamente') ? 'mensaje-exito' : 'mensaje-error'"
          >
            {{ mensaje }}
          </p>

          <button class="agregar" type="submit">+ Agregar producto</button>
        </form>
      </section>

      <section class="lista-card">
        <div class="lista-header">
          <h2>Productos registrados</h2>

          <div class="filtros-contenedor">
            <select v-model="categoriaFiltro" class="filtro-select">
              <option value="">Todas las categorías</option>
              <option>Frutas/Verduras</option>
              <option>Carnes</option>
              <option>Lácteos</option>
              <option>Panadería</option>
              <option>Limpieza</option>
              <option>Enlatados</option>
            </select>

            <input
              v-model="busqueda"
              class="busqueda"
              type="text"
              placeholder="🔎 Buscar producto..."
            />
          </div>
        </div>

        <div v-if="productosFiltrados.length === 0" class="sin-productos">
          <div>🛒</div>
          <h3>No hay productos con stock en tu despensa</h3>
          <p>Agrega productos nuevos o revisa tu lista de súper.</p>
        </div>

        <div v-else class="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad (Stock)</th>
                <th>Precio</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="producto in productosFiltrados" :key="producto.id">
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.categoria }}</td>
                <td>
                  <div class="control-stock">
                    <button class="btn-stock" @click="decrementarStock(producto)">-</button>
                    <span class="stock-valor">{{ producto.cantidad }}</span>
                    <button class="btn-stock" @click="incrementarStock(producto)">+</button>
                  </div>
                </td>
                <td>{{ formatearPrecio(producto.precio) }}</td>
                <td>
                  {{ formatearPrecio(producto.precio * producto.cantidad) }}
                </td>
                <td>
                  <button class="eliminar" @click="eliminarProducto(producto.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Estilos idénticos a los anteriores */
.productos-page { min-height: 100vh; background: #f4f6f5; color: #374151; }
.encabezado { background: white; padding: 22px 8%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.encabezado h1 { margin: 0; color: #2f6b4f; }
.encabezado p { margin: 6px 0 0; color: #6b7280; }
.volver { background: transparent; border: 1px solid #2f6b4f; color: #2f6b4f; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.contenido { max-width: 1100px; margin: auto; padding: 35px 20px; }
.resumen-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 25px; }
.resumen-card { background: white; padding: 20px; border-radius: 12px; display: flex; align-items: center; gap: 15px; box-shadow: 0 3px 12px rgba(0,0,0,0.05); }
.resumen-card span { font-size: 30px; }
.resumen-card p { margin: 0 0 5px; color: #6b7280; font-size: 13px; }
.resumen-card strong { color: #2f6b4f; font-size: 21px; }
.formulario-card, .lista-card { background: white; padding: 28px; border-radius: 15px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.formulario-card h2, .lista-card h2 { margin-top: 0; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
.campo label { display: block; font-weight: 600; margin-bottom: 7px; }
.campo input, .campo select, .busqueda { width: 100%; box-sizing: border-box; padding: 11px; border: 1px solid #d1d5db; border-radius: 8px; background: white; font-size: 14px; }
.agregar { margin-top: 15px; background: #2f6b4f; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.lista-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
.filtros-contenedor { display: flex; gap: 12px; align-items: center; }
.filtro-select, .busqueda { padding: 11px; border: 1px solid #d1d5db; border-radius: 8px; background: white; font-size: 14px; color: #374151; }
.busqueda { max-width: 250px; }
.tabla-contenedor { overflow-x: auto; margin-top: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 13px; border-bottom: 1px solid #e5e7eb; }
th { color: #6b7280; font-size: 13px; }
.control-stock { display: flex; align-items: center; gap: 10px; }
.btn-stock { background: #e2e8f0; border: none; width: 28px; height: 28px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-stock:hover { background: #cbd5e1; }
.stock-valor { min-width: 20px; text-align: center; font-weight: 600; }
.eliminar { border: none; background: #feeceb; color: #b42318; padding: 7px 10px; border-radius: 6px; cursor: pointer; }
.sin-productos { text-align: center; padding: 45px; color: #6b7280; }
.sin-productos div { font-size: 45px; }
.sin-productos h3 { color: #374151; margin-bottom: 5px; }
.mensaje-error { color: #b42318; font-size: 14px; }
.mensaje-exito { color: #2f6b4f; font-size: 14px; font-weight: 600; }
@media (max-width: 700px) {
  .resumen-grid, .form-grid { grid-template-columns: 1fr; }
  .lista-header, .encabezado { flex-direction: column; align-items: flex-start; }
  .filtros-contenedor { flex-direction: column; width: 100%; }
  .filtro-select, .busqueda { max-width: none; width: 100%; }
  .contenido { padding: 20px 12px; }
  .formulario-card, .lista-card { padding: 18px 12px; }
  table { min-width: 620px; }
  .tabla-contenedor { -webkit-overflow-scrolling: touch; }
}
</style>