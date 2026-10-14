// Persistencia local para el prototipo: los datos NO se sincronizan entre dispositivos.
const CLAVE_PRODUCTOS = 'despensa_productos'
const CLAVE_LISTA_SUPER = 'lista_super_productos' // Compatibilidad con versiones anteriores
const CLAVE_PRESUPUESTO = 'despensa_presupuesto'
const CLAVE_COMPRAS = 'despensa_compras'

const leerArreglo = (clave) => {
  try {
    const valor = JSON.parse(localStorage.getItem(clave) || '[]')
    return Array.isArray(valor) ? valor : []
  } catch {
    return [] // Un dato antiguo dañado no debe romper toda la aplicación.
  }
}

export const obtenerProductos = () => leerArreglo(CLAVE_PRODUCTOS)
export const guardarProductos = (productos) => {
  if (!Array.isArray(productos)) throw new TypeError('Los productos deben formar un arreglo.')
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos))
}

export const obtenerListaSuper = () => leerArreglo(CLAVE_LISTA_SUPER)
export const guardarListaSuper = (lista) => localStorage.setItem(CLAVE_LISTA_SUPER, JSON.stringify(lista))

export const obtenerPresupuesto = () => {
  const valor = Number(localStorage.getItem(CLAVE_PRESUPUESTO))
  return Number.isFinite(valor) && valor >= 0 ? valor : 0
}
export const guardarPresupuesto = (presupuesto) => {
  const valor = Number(presupuesto)
  if (!Number.isFinite(valor) || valor <= 0) throw new Error('Presupuesto inválido.')
  localStorage.setItem(CLAVE_PRESUPUESTO, String(valor))
}

export const obtenerCompras = () => leerArreglo(CLAVE_COMPRAS)
export const guardarCompras = (compras) => {
  if (!Array.isArray(compras)) throw new TypeError('Las compras deben formar un arreglo.')
  localStorage.setItem(CLAVE_COMPRAS, JSON.stringify(compras))
}
