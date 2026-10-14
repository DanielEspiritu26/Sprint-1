import test from 'node:test'
import assert from 'node:assert/strict'
import {
  guardarProductos, obtenerProductos, guardarCompras,
  obtenerCompras, guardarPresupuesto, obtenerPresupuesto,
} from '../src/services/db.js'
import { crearCompra, gastosDelMes, resumenDespensa } from '../src/services/operaciones.js'

const data = new Map()
globalThis.localStorage = {
  getItem(clave) { return data.has(clave) ? data.get(clave) : null },
  setItem(clave, valor) { data.set(clave, String(valor)) },
  removeItem(clave) { data.delete(clave) },
}

test('integración: producto agotado -> lista -> compra -> presupuesto -> inicio', () => {
  data.clear()
  guardarProductos([{ id: 'p1', nombre: 'Arroz', categoria: 'Enlatados', cantidad: 1, precio: 30 }])
  guardarPresupuesto(200)
  // Una unidad consumida: aparece en la lista de agotados.
  const productos = obtenerProductos()
  productos[0].cantidad -= 1
  guardarProductos(productos)
  assert.equal(obtenerProductos().filter((p) => p.cantidad === 0).length, 1)
  assert.equal(gastosDelMes(obtenerCompras(), '2026-10'), 0)

  // La compra registra dos unidades y actualiza el stock; no cinco.
  const fecha = new Date(2026, 9, 14, 12)
  const compra = crearCompra({ ...obtenerProductos()[0], costo: 33.5 }, 2, fecha)
  guardarCompras([...obtenerCompras(), compra])
  const actualizados = obtenerProductos()
  actualizados[0].cantidad += compra.cantidad
  actualizados[0].vecesComprado = (actualizados[0].vecesComprado || 0) + 1
  guardarProductos(actualizados)

  assert.equal(obtenerProductos()[0].cantidad, 2)
  assert.equal(obtenerProductos()[0].vecesComprado, 1)
  assert.equal(obtenerCompras().length, 1)
  assert.equal(gastosDelMes(obtenerCompras(), '2026-10'), 67)
  assert.deepEqual(resumenDespensa(obtenerProductos(), obtenerPresupuesto(), obtenerCompras(), '2026-10'), {
    productosRegistrados: 1, productosAgotados: 0, presupuestoMensual: 200, gastosRegistrados: 67,
  })
  // Cambiar las existencias no debe alterar el historial de compras.
  actualizados[0].cantidad = 0
  guardarProductos(actualizados)
  assert.equal(gastosDelMes(obtenerCompras(), '2026-10'), 67)
})

test('integración: almacenamiento corrupto no interrumpe la lectura', () => {
  data.clear()
  data.set('despensa_productos', '{JSON roto')
  assert.deepEqual(obtenerProductos(), [])
})
