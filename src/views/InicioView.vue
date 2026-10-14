<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { obtenerProductos, obtenerPresupuesto, obtenerCompras } from '@/services/db.js'
import { resumenDespensa, formatearMXN } from '@/services/operaciones.js'

const router = useRouter()
const resumen = ref({ productosRegistrados: 0, productosAgotados: 0, presupuestoMensual: 0, gastosRegistrados: 0 })
onMounted(() => {
  resumen.value = resumenDespensa(obtenerProductos(), obtenerPresupuesto(), obtenerCompras())
})

const irAProductos = () => {
  router.push('/productos')
}

const irAPresupuesto = () => {
  router.push('/presupuesto')
}

const irAListaSuper = () => {
  router.push('/lista-super')
}

const cerrarSesion = () => {
  localStorage.removeItem('usuario_activo')
  router.replace('/')
}
</script>

<template>
  <div class="inicio-page">
    <header class="encabezado">
      <div>
        <h1>🏠 Mi Despensa</h1>
        <p>Control de despensa y presupuesto del hogar</p>
      </div>

      <button class="cerrar-sesion" @click="cerrarSesion">Cerrar sesión</button>
    </header>

    <main class="contenido">
      <section class="bienvenida">
        <h2>¡Bienvenido!</h2>
        <p>
          Administra los productos de tu despensa, lleva un mejor control de tu presupuesto
          mensual y revisa tu lista para el súper.
        </p>
      </section>

      <section class="opciones">
        <div class="tarjeta">
          <h3>Mi despensa</h3>
          <p>Registra, consulta y administra los productos disponibles en tu hogar.</p>
          <button type="button" @click="irAProductos">Ver productos</button>
        </div>

        <div class="tarjeta">
          <h3>Presupuesto mensual</h3>
          <p>Establece tu presupuesto y lleva un control de los gastos realizados.</p>
          <button type="button" @click="irAPresupuesto">Ver presupuesto</button>
        </div>

        <!-- Tarjeta para Lista para el Súper (sin icono, centrada y con botón pegadito) -->
        <div class="tarjeta tarjeta-super">
          <h3>Lista para el Súper</h3>
          <p>Consulta los productos que tienen exactamente cero unidades.</p>
          <button type="button" class="btn-super" @click="irAListaSuper">Ver lista del súper</button>
        </div>
      </section>

      <section class="resumen">
        <h2>Resumen</h2>

        <div class="resumen-grid">
          <div class="resumen-item">
            <span>📦</span>
            <div>
              <strong>{{ resumen.productosRegistrados }}</strong>
              <p>Productos registrados</p>
            </div>
          </div>

          <div class="resumen-item">
            <span>💵</span>
            <div>
              <strong>{{ formatearMXN(resumen.presupuestoMensual) }}</strong>
              <p>Presupuesto mensual</p>
            </div>
          </div>

          <div class="resumen-item">
            <span>🧾</span>
            <div>
              <strong>{{ formatearMXN(resumen.gastosRegistrados) }}</strong>
              <p>Gastos del mes</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.inicio-page {
  min-height: 100vh;
  background: #f4f6f5;
  color: #374151;
}

.encabezado {
  background: white;
  padding: 20px 8%;
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
  margin: 5px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.cerrar-sesion {
  background: transparent;
  border: 1px solid #2f6b4f;
  color: #2f6b4f;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.cerrar-sesion:hover {
  background: #eef6f1;
}

.contenido {
  max-width: 1000px;
  margin: auto;
  padding: 45px 25px;
}

.bienvenida {
  margin-bottom: 35px;
}

.bienvenida h2 {
  color: #1f2937;
  margin-bottom: 8px;
}

.bienvenida p {
  color: #6b7280;
}

.opciones {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.tarjeta {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.tarjeta:hover {
  transform: translateY(-4px);
}

.tarjeta h3 {
  margin: 0 0 8px; /* Ajustado para que empiece limpio arriba sin el icono */
  color: #2f6b4f;
}

.tarjeta p {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 12px; /* Margen corto para acercar el botón */
}

.tarjeta button {
  margin-top: 4px; /* Botón bien pegadito al texto */
  background: #2f6b4f;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.tarjeta button:hover {
  background: #24543e;
}

/* Tarjeta de Súper en ambas columnas */
.tarjeta-super {
  grid-column: span 2;
}

.btn-super {
  background: #d97706 !important;
}

.btn-super:hover {
  background: #b45309 !important;
}

.resumen {
  margin-top: 40px;
}

.resumen h2 {
  color: #1f2937;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.resumen-item {
  background: white;
  padding: 22px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
}

.resumen-item span {
  font-size: 30px;
}

.resumen-item strong {
  font-size: 21px;
  color: #2f6b4f;
}

.resumen-item p {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

@media (max-width: 700px) {
  .opciones,
  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .tarjeta-super {
    grid-column: span 1;
  }

  .encabezado {
    padding: 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .contenido { padding: 24px 15px; }
  .tarjeta { padding: 20px; }
}
</style>