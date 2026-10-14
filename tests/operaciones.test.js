import test from 'node:test'
import assert from 'node:assert/strict'
import {
  redondearDinero, mesDeFecha, validarProducto, crearCompra,
  gastosDelMes, resumenDespensa, formatearMXN,
} from '../src/services/operaciones.js'

test('valida correctamente el registro de productos', () => {
  const base = { nombre: 'Arroz', categoria: 'Enlatados', cantidad: 2, precio: 23.5 }
  assert.equal(validarProducto(base), '')
  assert.match(validarProducto({ ...base, nombre: ' ' }), /nombre/)
  assert.match(validarProducto({ ...base, cantidad: 0 }), /cantidad/)
  assert.match(validarProducto({ ...base, cantidad: 1.5 }), /entero/)
  assert.match(validarProducto({ ...base, precio: -3 }), /precio/)
  assert.match(validarProducto({ ...base, precio: 'aaa' }), /precio/)
})

test('calcula importe de una compra por unidades sin asignar cinco arbitrariamente', () => {
  const compra = crearCompra({ id: 7, nombre: 'Leche', costo: 24.9 }, 3, new Date(2026, 9, 14, 12))
  assert.equal(compra.cantidad, 3)
  assert.equal(compra.total, 74.7)
  assert.equal(compra.productoId, 7)
  assert.throws(() => crearCompra({ nombre: 'Leche', costo: 24 }, 0), /entera/)
  assert.throws(() => crearCompra({ nombre: 'Leche', costo: 24 }, 1.1), /entera/)
  assert.throws(() => crearCompra({ nombre: 'Leche', costo: -24 }, 2), /precio/)
})

test('considera solo compras del mismo mes', () => {
  const octubre = new Date(2026, 9, 15, 12)
  const septiembre = new Date(2026, 8, 15, 12)
  const compras = [
    crearCompra({ nombre: 'Leche', precio: 25 }, 2, octubre),
    crearCompra({ nombre: 'Pan', precio: 30 }, 1, septiembre),
  ]
  assert.equal(mesDeFecha(octubre), '2026-10')
  assert.equal(gastosDelMes(compras, '2026-10'), 50)
  assert.equal(gastosDelMes(compras, '2026-09'), 30)
  assert.equal(gastosDelMes(compras, '2026-11'), 0)
})

test('el inventario agotado no se transforma automáticamente en gasto', () => {
  const resultado = resumenDespensa([{ id: 1, cantidad: 0 }, { id: 2, cantidad: 4 }], 700, [], '2026-10')
  assert.deepEqual(resultado, {
    productosRegistrados: 2, productosAgotados: 1, presupuestoMensual: 700, gastosRegistrados: 0,
  })
})

test('redondea valores monetarios a centavos y formatea MXN', () => {
  assert.equal(redondearDinero(0.1 + 0.2), 0.3)
  assert.match(formatearMXN(150), /150/)
})
