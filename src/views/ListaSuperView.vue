<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerProductos, guardarProductos, obtenerCompras, guardarCompras } from '@/services/db.js'
import { crearCompra } from '@/services/operaciones.js'

const router = useRouter()
const productos = ref([])
const cantidadesCompra = reactive({})
const errorCompra = ref('')
const confirmacionCompra = ref('')

// Estado para el filtro de prioridad
const filtroPrioridad = ref('Todos') // 'Todos' | 'Indispensable' | 'Secundario'

onMounted(() => {
  const productosGuardados = obtenerProductos()
  // Asignar 'Indispensable' por defecto a los productos que aún no tengan la propiedad
  productos.value = productosGuardados.map(p => ({
    ...p,
    prioridad: p.prioridad || 'Indispensable',
    vecesComprado: Number(p.vecesComprado) || 0,
    costo: Number(p.costo ?? p.precio ?? 0),
  }))
  productos.value.forEach((p) => { cantidadesCompra[p.id] = 1 })
})

// Muestra únicamente los productos con stock 0
const listaParaElSuper = computed(() => {
  return productos.value.filter((producto) => Number(producto.cantidad) === 0)
})

// Aplica el filtro de prioridad seleccionado por el usuario
const listaFiltrada = computed(() => {
  if (filtroPrioridad.value === 'Todos') return listaParaElSuper.value
  return listaParaElSuper.value.filter(p => p.prioridad === filtroPrioridad.value)
})

// Alterna la prioridad de un producto y guarda en db.js
const cambiarPrioridad = (producto) => {
  producto.prioridad = producto.prioridad === 'Indispensable' ? 'Secundario' : 'Indispensable'
  guardarProductos(productos.value)
}

const incrementarStock = (producto) => {
  producto.cantidad++
  guardarProductos(productos.value)
}

const actualizarCosto = (producto) => {
  if (!Number.isFinite(Number(producto.costo)) || Number(producto.costo) < 0) {
    errorCompra.value = 'El costo debe ser un número válido y no negativo.'
    producto.costo = Number(producto.precio) || 0
    return
  }
  errorCompra.value = ''
  producto.costo = Number(producto.costo)
  guardarProductos(productos.value)
}

const marcarComprado = (id) => {
  const producto = productos.value.find(p => p.id === id)
  if (!producto) return
  try {
    const compra = crearCompra(producto, cantidadesCompra[id])
    // La compra se registra antes de actualizar el inventario.
    guardarCompras([...obtenerCompras(), compra])
    producto.cantidad = Number(producto.cantidad) + compra.cantidad
    producto.precio = compra.precioUnitario
    producto.vecesComprado = (Number(producto.vecesComprado) || 0) + 1
    guardarProductos(productos.value)
    errorCompra.value = ''
    confirmacionCompra.value = `Compra registrada: ${compra.cantidad} unidad(es) de ${compra.nombre}.`
  } catch (error) {
    errorCompra.value = error.message
    confirmacionCompra.value = ''
  }
}

const volverInicio = () => {
  router.push('/inicio')
}
</script>

<template>
  <div class="super-page">
    <header class="encabezado">
      <div>
        <h1>📋 Lista para el Súper</h1>
        <p>Productos con stock agotado (0 unidades)</p>
      </div>

      <button class="volver" @click="volverInicio">← Volver al inicio</button>
    </header>

    <main class="contenido">
      <p v-if="errorCompra" class="mensaje-error" role="alert">{{ errorCompra }}</p>
      <p v-if="confirmacionCompra" class="mensaje-exito" role="status">{{ confirmacionCompra }}</p>
      <div v-if="listaParaElSuper.length === 0" class="sin-productos">
        <div class="icono-feliz">🎉</div>
        <h3>¡Todo en orden!</h3>
        <p>No hay productos agotados en este momento.</p>
      </div>

      <div v-else class="lista-card">
        <div class="lista-header">
          <h2>Elementos pendientes de compra</h2>
          <span class="badge-alerta">{{ listaParaElSuper.length }} producto(s) agotados</span>
        </div>

        <!-- Filtros Rápidos de Descarte por Presupuesto -->
        <div class="filtros-contenedor">
          <span>Filtrar por prioridad:</span>
          <div class="botones-filtro">
            <button 
              :class="{ activo: filtroPrioridad === 'Todos' }" 
              @click="filtroPrioridad = 'Todos'"
            >
              Todos ({{ listaParaElSuper.length }})
            </button>
            <button 
              :class="{ activo: filtroPrioridad === 'Indispensable' }" 
              @click="filtroPrioridad = 'Indispensable'"
              class="btn-filtro-indispensable"
            >
              Indispensables
            </button>
            <button 
              :class="{ activo: filtroPrioridad === 'Secundario' }" 
              @click="filtroPrioridad = 'Secundario'"
              class="btn-filtro-secundario"
            >
              Secundarios
            </button>
          </div>
        </div>

        <div class="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Stock Actual</th>
                <th>Precio unitario estimado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in listaFiltrada" :key="item.id">
                <td><strong>{{ item.nombre }}</strong></td>
                <td>{{ item.categoria }}</td>

                <!-- Columna de Prioridad interactiva -->
                <td>
                  <button 
                    class="btn-prioridad"
                    :class="item.prioridad === 'Indispensable' ? 'p-indispensable' : 'p-secundario'"
                    @click="cambiarPrioridad(item)"
                    title="Haz clic para cambiar la prioridad"
                  >
                    {{ item.prioridad }}
                  </button>
                </td>

                <td>
                  <span class="stock-cero">0 unidades</span>
                </td>

                <td>
                  <div class="input-costo">
                    <span>$</span>
                    <input
                      v-model.number="item.costo"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      @change="actualizarCosto(item)"
                    />
                  </div>
                </td>

                <td class="acciones-celda">
                  <label class="cantidad-compra">
                    <span>Unidades</span>
                    <input v-model.number="cantidadesCompra[item.id]" type="number" min="1" step="1" :aria-label="'Cantidad a comprar de ' + item.nombre" />
                  </label>
                  <button class="btn-comprar" @click="marcarComprado(item.id)">
                    ✓ Comprado
                  </button>

                  <button
                    class="btn-stock"
                    @click="incrementarStock(item)"
                    title="Sumar 1"
                  >
                    +
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.super-page { min-height: 100vh; background: #f4f6f5; color: #374151; }
.encabezado { background: white; padding: 20px 8%; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06); }
.encabezado h1 { margin: 0; color: #2f6b4f; font-size: 24px; }
.encabezado p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
.volver { background: transparent; border: 1px solid #2f6b4f; color: #2f6b4f; padding: 9px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; }
.volver:hover { background: #eef6f1; }
.contenido { max-width: 900px; margin: auto; padding: 40px 20px; }
.lista-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.lista-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.lista-header h2 { margin: 0; color: #1f2937; font-size: 19px; }
.badge-alerta { background: #d97706; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }

/* Estilos de los Filtros de Prioridad */
.filtros-contenedor { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; font-size: 13px; color: #4b5563; }
.botones-filtro { display: flex; gap: 8px; }
.botones-filtro button { border: 1px solid #d1d5db; background: #f9fafb; padding: 5px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
.botones-filtro button.activo { background: #1f2937; color: white; border-color: #1f2937; font-weight: bold; }
.btn-filtro-indispensable.activo { background: #dc2626 !important; border-color: #dc2626 !important; }
.btn-filtro-secundario.activo { background: #6b7280 !important; border-color: #6b7280 !important; }

/* Botones / Badges de Prioridad en la tabla */
.btn-prioridad { border: none; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
.btn-prioridad:active { transform: scale(0.95); }
.p-indispensable { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
.p-secundario { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }

.tabla-contenedor { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
th { color: #4b5563; font-size: 13px; background: #f9fafb; }
.stock-cero { background: #fee2e2; color: #b91c1c; padding: 4px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; }
.acciones-celda { display: flex; gap: 8px; align-items: center; min-width: 220px; }
.cantidad-compra { display: flex; gap: 4px; flex-direction: column; font-size: 11px; }
.cantidad-compra input { border: 1px solid #d1d5db; border-radius: 6px; padding: 5px; width: 62px; }
.mensaje-error { color: #991b1b; background: #fee2e2; padding: 12px; border-radius: 8px; }
.mensaje-exito { color: #166534; background: #dcfce7; padding: 12px; border-radius: 8px; }
.btn-comprar { background: #2f6b4f; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px; }
.btn-comprar:hover { background: #24543e; }
.btn-stock { background: #e2e8f0; border: none; width: 28px; height: 28px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.btn-stock:hover { background: #cbd5e1; }
.sin-productos { text-align: center; padding: 50px 20px; background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
.icono-feliz { font-size: 45px; margin-bottom: 10px; }
.sin-productos h3 { margin: 0 0 6px; color: #1f2937; }
.sin-productos p { color: #6b7280; margin: 0; font-size: 14px; }
.input-costo { display: flex; align-items: center; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; max-width: 120px; }
.input-costo span { padding-left: 8px; color: #6b7280; }
.input-costo input { width: 90px; border: none; padding: 7px; outline: none; font-size: 13px; }
@media (max-width: 700px) {
  .encabezado { padding: 18px; flex-direction: column; align-items: flex-start; gap: 12px; }
  .contenido { padding: 20px 12px; }
  .lista-card { padding: 15px 10px; }
  .lista-header, .filtros-contenedor { flex-direction: column; align-items: flex-start; gap: 10px; }
  .botones-filtro { flex-wrap: wrap; }
  table { min-width: 760px; }
  .tabla-contenedor { -webkit-overflow-scrolling: touch; }
}
</style>