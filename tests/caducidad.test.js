import test from 'node:test'
import assert from 'node:assert/strict'
import { estadoCaducidad } from '../src/services/operaciones.js'

// Fecha utilizada para comprobar los resultados
const hoy = new Date(2026, 9, 21)

test('producto sin fecha de caducidad', () => {
  assert.equal(estadoCaducidad(null, hoy), 'Sin fecha')
})

test('producto con fecha vencida', () => {
  assert.equal(estadoCaducidad('2026-10-18', hoy), 'Caducado')
})

test('producto que vence hoy', () => {
  assert.equal(estadoCaducidad('2026-10-21', hoy), 'Próximo a vencer')
})

test('producto que vence en 7 días', () => {
  assert.equal(estadoCaducidad('2026-10-28', hoy), 'Próximo a vencer')
})

test('producto que vence en más de 7 días', () => {
  assert.equal(estadoCaducidad('2026-10-29', hoy), 'Vigente')
})
