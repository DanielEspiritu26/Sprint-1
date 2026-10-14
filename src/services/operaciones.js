// Reglas del negocio independientes de Vue y del navegador (testeables con Node).
export const redondearDinero = (importe) => Math.round((Number(importe) + Number.EPSILON) * 100) / 100

export const mesDeFecha = (fecha = new Date()) => {
  const valor = fecha instanceof Date ? fecha : new Date(fecha)
  if (Number.isNaN(valor.getTime())) throw new Error('Fecha inválida.')
  return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}`
}

export const validarProducto = ({ nombre, categoria, cantidad, precio }) => {
  if (!String(nombre ?? '').trim() || !String(categoria ?? '').trim()) return 'Completa el nombre y la categoría.'
  if (!Number.isInteger(Number(cantidad)) || Number(cantidad) < 1 || cantidad === '') return 'La cantidad debe ser un número entero mayor que cero.'
  if (precio === '' || !Number.isFinite(Number(precio)) || Number(precio) < 0) return 'El precio debe ser un número válido, igual o mayor que cero.'
  return ''
}

export const crearCompra = (producto, cantidad, fecha = new Date()) => {
  const unidades = Number(cantidad)
  const precioUnitario = Number(producto.costo ?? producto.precio ?? 0)
  if (!Number.isSafeInteger(unidades) || unidades < 1) throw new Error('Ingresa una cantidad entera mayor que cero.')
  if (!Number.isFinite(precioUnitario) || precioUnitario < 0) throw new Error('El precio unitario debe ser válido.')
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    productoId: producto.id,
    nombre: producto.nombre,
    cantidad: unidades,
    precioUnitario: redondearDinero(precioUnitario),
    total: redondearDinero(unidades * precioUnitario),
    fecha: (fecha instanceof Date ? fecha : new Date(fecha)).toISOString(),
  }
}

export const gastosDelMes = (compras, mes = mesDeFecha()) => {
  return redondearDinero((Array.isArray(compras) ? compras : [])
    .filter((compra) => {
      try { return mesDeFecha(compra.fecha) === mes } catch { return false }
    })
    .reduce((suma, compra) => suma + (Number(compra.total) || 0), 0))
}

export const resumenDespensa = (productos, presupuesto, compras, mes = mesDeFecha()) => ({
  productosRegistrados: (Array.isArray(productos) ? productos : []).length,
  productosAgotados: (Array.isArray(productos) ? productos : []).filter((p) => Number(p.cantidad) === 0).length,
  presupuestoMensual: Number(presupuesto) || 0,
  gastosRegistrados: gastosDelMes(compras, mes),
})

export const formatearMXN = (valor) => Number(valor || 0).toLocaleString('es-MX', {
  style: 'currency', currency: 'MXN',
})
