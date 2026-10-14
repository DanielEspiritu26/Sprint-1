<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gastosDelMes, formatearMXN, mesDeFecha } from '@/services/operaciones.js'
import {
  obtenerProductos,
  obtenerCompras,
  obtenerPresupuesto,
  guardarPresupuesto as guardarPresupuestoDB,
} from '@/services/db.js'

const router = useRouter()

const presupuesto = ref(0)
const productos = ref([])
const compras = ref([])
const nuevoPresupuesto = ref('')
const mensaje = ref('')

onMounted(() => {
  presupuesto.value = obtenerPresupuesto()
  compras.value = obtenerCompras()

  // Mantenemos la estructura e inicializamos el contador de rotación en 0 si no existe
  const productosBD = obtenerProductos()
  productos.value = productosBD.map((p) => ({
    ...p,
    vecesComprado: p.vecesComprado || 0,
  }))
})

const guardarPresupuesto = () => {
  const cantidad = Number(nuevoPresupuesto.value)

  if (!nuevoPresupuesto.value || !Number.isFinite(cantidad) || cantidad <= 0) {
    mensaje.value = 'Ingresa un presupuesto válido mayor a $0.'
    return
  }

  presupuesto.value = cantidad
  guardarPresupuestoDB(cantidad)
  nuevoPresupuesto.value = ''
  mensaje.value = 'Presupuesto guardado correctamente.'
}

const presupuestoFormateado = computed(() => formatearMXN(presupuesto.value))

// HU-10: únicamente compras efectivamente registradas durante el mes en curso.
// Los productos agotados representan una compra pendiente, no un gasto realizado.
const gastosRegistrados = computed(() => gastosDelMes(compras.value))
const comprasDelMes = computed(() => compras.value
  .filter((compra) => {
    try { return mesDeFecha(compra.fecha) === mesDeFecha() } catch { return false }
  })
  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)))
const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-MX')

// Calcula cuánto dinero queda disponible
const disponible = computed(() => {
  return presupuesto.value - gastosRegistrados.value
})

// Formato de moneda para los gastos
const gastosFormateados = computed(() => formatearMXN(gastosRegistrados.value))

// Formato de moneda para el dinero disponible
const disponibleFormateado = computed(() => formatearMXN(disponible.value))

// Calcula qué porcentaje del presupuesto se ha utilizado
const porcentajePresupuesto = computed(() => {
  if (presupuesto.value <= 0) return 0

  return Math.min((gastosRegistrados.value / presupuesto.value) * 100, 100)
})

// Detecta si los gastos superan el presupuesto
const presupuestoExcedido = computed(() => {
  return presupuesto.value > 0 && gastosRegistrados.value > presupuesto.value
})

// HU-10: Resumen gráfico de presupuesto planeado vs. gasto real acumulado
const maximoGrafica = computed(() => {
  return Math.max(presupuesto.value, gastosRegistrados.value, 1)
})

const alturaPresupuesto = computed(() => {
  return (presupuesto.value / maximoGrafica.value) * 100
})

const alturaGastos = computed(() => {
  return (gastosRegistrados.value / maximoGrafica.value) * 100
})

// LÓGICA DE MAYOR ROTACIÓN: Ordena descendentemente según el número de compras/reabastecimientos
const productosMayorRotacion = computed(() => {
  return [...productos.value]
    .filter((p) => (p.vecesComprado || 0) > 0)
    .sort((a, b) => (b.vecesComprado || 0) - (a.vecesComprado || 0))
    .slice(0, 5) // Muestra el Top 5
})

const volverInicio = () => {
  router.push('/inicio')
}
</script>

<template>
  <div class="presupuesto-page">
    <header class="encabezado">
      <div>
        <h1>💰 Presupuesto mensual</h1>
        <p>Administra el presupuesto destinado a las compras del hogar</p>
      </div>

      <button class="volver" @click="volverInicio">← Volver al inicio</button>
    </header>

    <main class="contenido">
      <section class="resumen">
        <p>Presupuesto actual</p>
        <h2>{{ presupuestoFormateado }}</h2>
        <span>MXN</span>
      </section>

      <section class="formulario-card">
        <h2>Establecer presupuesto</h2>

        <p class="descripcion">
          Ingresa la cantidad que deseas destinar a las compras de tu despensa durante este mes.
        </p>

        <form @submit.prevent="guardarPresupuesto">
          <label for="presupuesto">Presupuesto mensual</label>

          <div class="input-dinero">
            <span>$</span>
            <input
              id="presupuesto"
              v-model="nuevoPresupuesto"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <p
            v-if="mensaje"
            :class="mensaje.includes('correctamente') ? 'mensaje-exito' : 'mensaje-error'"
          >
            {{ mensaje }}
          </p>

          <button class="guardar" type="submit">Guardar presupuesto</button>
        </form>
      </section>

      <section class="informacion">
        <h3>Resumen del mes (compras confirmadas)</h3>

        <div class="datos">
          <div>
            <p>Presupuesto</p>
            <strong>{{ presupuestoFormateado }}</strong>
          </div>

          <div>
            <p>Gastos registrados</p>
            <strong>{{ gastosFormateados }}</strong>
          </div>

          <div>
            <p>Disponible</p>
            <strong>{{ disponibleFormateado }}</strong>
          </div>
        </div>

        <div class="presupuesto-progreso">
          <div class="barra-fondo">
            <div
              class="barra-progreso"
              :class="{ excedido: presupuestoExcedido }"
              :style="{ width: porcentajePresupuesto + '%' }"
            ></div>
          </div>

          <p class="porcentaje">
            {{ porcentajePresupuesto.toFixed(0) }}% del presupuesto utilizado
          </p>

          <p v-if="presupuestoExcedido" class="alerta-presupuesto">
            ⚠️ Has excedido el presupuesto establecido.
          </p>
        </div>
      </section>

      <section class="historial-card">
        <h3>Compras registradas este mes</h3>
        <p class="subtexto">Únicamente se incluyen compras confirmadas desde la lista del súper.</p>
        <p v-if="comprasDelMes.length === 0" class="subtexto">Todavía no hay compras registradas este mes.</p>
        <div v-else class="historial-scroll">
          <table class="historial-tabla">
            <thead><tr><th>Fecha</th><th>Producto</th><th>Unidades</th><th>Importe</th></tr></thead>
            <tbody>
              <tr v-for="compra in comprasDelMes" :key="compra.id">
                <td>{{ formatearFecha(compra.fecha) }}</td>
                <td>{{ compra.nombre }}</td>
                <td>{{ compra.cantidad }}</td>
                <td>{{ formatearMXN(compra.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- HU-10: Resumen gráfico de consumo -->
      <section class="grafica-card">
        <div class="grafica-header">
          <h3>Resumen gráfico de consumo</h3>
          <p class="subtexto">
            Comparación entre el presupuesto planeado y las compras registradas durante el mes actual.
          </p>
        </div>

        <div v-if="presupuesto <= 0" class="sin-datos-grafica">
          <p>Establece un presupuesto para visualizar la comparación.</p>
        </div>

        <div v-else class="grafica-contenedor">
          <div class="grafica-barras">
            <div class="columna-grafica">
              <span class="valor-grafica">{{ presupuestoFormateado }}</span>

              <div class="barra-vertical-fondo">
                <div
                  class="barra-vertical presupuesto-barra"
                  :style="{ height: alturaPresupuesto + '%' }"
                ></div>
              </div>

              <strong>Presupuesto planeado</strong>
            </div>

            <div class="columna-grafica">
              <span class="valor-grafica">{{ gastosFormateados }}</span>

              <div class="barra-vertical-fondo">
                <div
                  class="barra-vertical gasto-barra"
                  :class="{ excedido: presupuestoExcedido }"
                  :style="{ height: alturaGastos + '%' }"
                ></div>
              </div>

              <strong>Gasto real acumulado</strong>
            </div>
          </div>

          <p class="interpretacion-grafica">
            {{
              gastosRegistrados > presupuesto
                ? 'El gasto real acumulado supera el presupuesto planeado.'
                : gastosRegistrados === presupuesto
                  ? 'El gasto real acumulado ha alcanzado el total del presupuesto planeado.'
                  : 'El gasto real acumulado se mantiene dentro del presupuesto planeado.'
            }}
          </p>
        </div>
      </section>

      <section class="rotacion-card">
        <div class="rotacion-header">
          <h3>Productos de mayor consumo rápido</h3>
          <p class="subtexto">Artículos que más se consumen y reabastecen en el hogar</p>
        </div>

        <div v-if="productosMayorRotacion.length === 0" class="sin-rotacion">
          <p>Aún no hay compras registradas para calcular la rotación de productos.</p>
        </div>

        <div v-else class="lista-rotacion">
          <div v-for="(item, index) in productosMayorRotacion" :key="item.id" class="item-rotacion">
            <div class="info-producto">
              <span class="ranking">#{{ index + 1 }}</span>
              <div>
                <strong>{{ item.nombre }}</strong>
                <span class="categoria-badge">{{ item.categoria }}</span>
              </div>
            </div>

            <div class="indicador-rotacion">
              <span
                class="badge-consumo"
                :class="{ 'consumo-rapido': (item.vecesComprado || 0) >= 3 }"
              >
                {{ (item.vecesComprado || 0) >= 3 ? '⚡ Consumo rápido' : '🔄 Rotación habitual' }}
              </span>
              <small>{{ item.vecesComprado }} reabastecimiento(s)</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.presupuesto-page {
  min-height: 100vh;
  background: #f4f6f5;
  color: #374151;
}

.encabezado {
  background: white;
  padding: 22px 8%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.encabezado h1 {
  margin: 0;
  color: #2f6b4f;
  font-size: 25px;
}

.encabezado p {
  margin: 6px 0 0;
  color: #6b7280;
}

.volver {
  background: transparent;
  border: 1px solid #2f6b4f;
  color: #2f6b4f;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.contenido {
  max-width: 850px;
  margin: auto;
  padding: 40px 20px;
}

.resumen {
  background: #2f6b4f;
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 25px;
}

.resumen p {
  margin: 0;
  opacity: 0.9;
}

.resumen h2 {
  font-size: 38px;
  margin: 8px 0 2px;
}

.resumen span {
  font-size: 13px;
  opacity: 0.8;
}

.formulario-card,
.informacion,
.rotacion-card,
.historial-card {
  background: white;
  padding: 28px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.formulario-card h2,
.informacion h3,
.rotacion-header h3 {
  margin-top: 0;
  color: #1f2937;
}

.descripcion,
.subtexto {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.input-dinero {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  overflow: hidden;
}

.input-dinero span {
  padding: 12px 0 12px 14px;
  color: #6b7280;
}

input {
  width: 100%;
  border: none;
  padding: 12px;
  font-size: 16px;
  outline: none;
}

.guardar {
  margin-top: 18px;
  width: 100%;
  background: #2f6b4f;
  color: white;
  border: none;
  padding: 13px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.guardar:hover {
  background: #24543e;
}

.mensaje-error {
  color: #b42318;
  font-size: 14px;
}

.mensaje-exito {
  color: #2f6b4f;
  font-size: 14px;
  font-weight: 600;
}

.datos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.datos div {
  background: #f7f8f7;
  padding: 18px;
  border-radius: 10px;
}

.datos p {
  color: #6b7280;
  font-size: 13px;
  margin: 0 0 7px;
}

.datos strong {
  color: #2f6b4f;
  font-size: 18px;
}

.presupuesto-progreso {
  margin-top: 25px;
}

.barra-fondo {
  width: 100%;
  height: 18px;
  background: #e5e7eb;
  border-radius: 20px;
  overflow: hidden;
}

.barra-progreso {
  height: 100%;
  background: #2f6b4f;
  border-radius: 20px;
  transition: width 0.3s ease;
}

.barra-progreso.excedido {
  background: #dc2626;
}

.porcentaje {
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
}

.alerta-presupuesto {
  margin-top: 10px;
  color: #b91c1c;
  font-weight: 600;
}

/* Compras confirmadas */
.historial-card h3 { margin-top: 0; color: #1f2937; }
.historial-scroll { overflow-x: auto; }
.historial-tabla { border-collapse: collapse; width: 100%; min-width: 490px; }
.historial-tabla th, .historial-tabla td { padding: 12px 9px; border-bottom: 1px solid #e5e7eb; text-align: left; }
.historial-tabla th { color: #4b5563; font-size: 13px; }

/* HU-10: RESUMEN GRÁFICO DE CONSUMO */

.grafica-card {
  background: white;
  padding: 28px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.grafica-header h3 {
  margin-top: 0;
  color: #1f2937;
}

.sin-datos-grafica {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 25px 0;
}

.grafica-contenedor {
  margin-top: 25px;
}

.grafica-barras {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 70px;
  padding: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.columna-grafica {
  height: 100%;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.barra-vertical-fondo {
  width: 85px;
  height: 200px;
  background: #f3f4f6;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.barra-vertical {
  width: 100%;
  min-height: 3px;
  transition: height 0.4s ease;
}

.presupuesto-barra {
  background: #2f6b4f;
}

.gasto-barra {
  background: #60a5fa;
}

.gasto-barra.excedido {
  background: #dc2626;
}

.valor-grafica {
  font-weight: 700;
  color: #374151;
  font-size: 14px;
}

.columna-grafica strong {
  text-align: center;
  color: #4b5563;
  font-size: 13px;
}

.interpretacion-grafica {
  margin-top: 20px;
  padding: 12px;
  background: #f7f8f7;
  border-radius: 8px;
  color: #4b5563;
  font-size: 14px;
  text-align: center;
}

/* ESTILOS DE MAYOR ROTACIÓN */
.sin-rotacion {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 15px 0;
}

.lista-rotacion {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-rotacion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #f3f4f6;
}

.info-producto {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking {
  font-weight: bold;
  color: #2f6b4f;
  font-size: 15px;
}

.categoria-badge {
  display: inline-block;
  margin-left: 8px;
  font-size: 11px;
  background: #e5e7eb;
  color: #4b5563;
  padding: 2px 7px;
  border-radius: 12px;
}

.indicador-rotacion {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.badge-consumo {
  font-size: 11px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
  background: #e5e7eb;
  color: #374151;
}

.badge-consumo.consumo-rapido {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
}

.indicador-rotacion small {
  font-size: 11px;
  color: #6b7280;
}

@media (max-width: 650px) {
  .encabezado {
    padding: 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .datos {
    grid-template-columns: 1fr;
  }
  .contenido { padding: 20px 12px; }
  .formulario-card, .informacion, .grafica-card, .rotacion-card, .historial-card { padding: 18px 14px; }
  .resumen h2 { font-size: 29px; overflow-wrap: anywhere; }
  .grafica-barras { gap: 10px; padding: 12px 4px; height: 280px; }
  .columna-grafica { min-width: 0; width: 48%; }
  .barra-vertical-fondo { width: min(75px, 90%); }
  .valor-grafica { font-size: 12px; overflow-wrap: anywhere; text-align: center; }
  .datos strong { overflow-wrap: anywhere; }

  .item-rotacion {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .indicador-rotacion {
    align-items: flex-start;
  }
}
</style>
