# Sprint 4 — Registro de pruebas y evidencias

**HU-12: calidad, optimización y pruebas.** Proyecto: Control de Despensa y Presupuesto del Hogar.

## Cambios incluidos en la versión corregida

1. Reparación de indicadores de la pantalla de inicio para reflejar los datos guardados.
2. Separación de productos agotados (compras pendientes) y compras confirmadas (gastos reales).
3. Registro de cantidad comprada, costo unitario y fecha; actualización del stock con la cantidad real.
4. Cálculo de los gastos del mes a partir del historial de compras y mantenimiento de la gráfica y alerta de presupuesto.
5. Validación adicional de productos, compras y presupuesto.
6. Cierre de sesión que elimina la sesión local y protección básica de rutas en el prototipo.
7. Corrección del CSS global y ajustes de adaptación móvil en las pantallas principales.
8. Pruebas automatizadas nativas de Node.js sin nuevas dependencias; actualización del README.

## Evidencias automatizadas (adjuntar resultado REAL)

Desde la raíz del proyecto:

```bash
npm ci
npm test
npm run build
```

- Captura A: terminal con los tests y su resultado.
- Captura B: terminal con `npm run build` exitoso.
- Captura C: GitHub, rama `rama-sprint4`, mostrando archivos nuevos y commits.

**No afirmar que el build o las pruebas de interfaz se ejecutaron hasta que la consola lo confirme.**

## Casos manuales para verificar desde el navegador

| ID | Acción | Resultado esperado | Resultado real (equipo) |
|---|---|---|---|
| M01 | Crear cuenta de prueba e iniciar sesión | Acceso a Inicio | Pendiente |
| M02 | Registrar Leche, cantidad 1, precio 25 | Aparece en Mi Despensa; resumen indica 1 producto | Pendiente |
| M03 | Disminuir stock de Leche de 1 a 0 | Se elimina de la vista de productos disponibles y aparece en Lista del Súper | Pendiente |
| M04 | Consultar Presupuesto antes de comprar | Gastos del mes = $0.00 (datos nuevos) | Pendiente |
| M05 | Elegir 3 unidades de Leche a $25 y pulsar Comprado | Stock sube a 3; gastos del mes = $75.00 | Pendiente |
| M06 | Configurar presupuesto $50 | Alerta por excedente y gráfica con gastos $75 | Pendiente |
| M07 | Volver a Inicio | Resumen con 1 producto, presupuesto $50, gastos $75 | Pendiente |
| M08 | Cerrar sesión, escribir /productos en la barra | Redirige a la pantalla de iniciar sesión | Pendiente |
| M09 | Abrir las vistas en una ventana de ~375 px y ~1280 px | No hay corte de botones ni del formulario; tablas desplazables | Pendiente |
| M10 | Recargar el navegador | Productos, presupuesto y compras persisten en el mismo navegador | Pendiente |

**Consejo:** usar un perfil o ventana nueva del navegador para que datos anteriores no alteren las cantidades esperadas.

## Retrospectiva Scrum (debe ser real)

- Fecha, horario y medio de la reunión: [completar].
- Participantes y roles: [completar].
- Qué funcionó bien: [acuerdo auténtico del equipo].
- Qué debe mejorar: [acuerdo auténtico del equipo].
- Acciones y responsables: [completar].
- Evidencia: [captura o acta real de la reunión].

## Optimización del rendimiento

Se optimizó la estructura CSS general y se corrigieron errores de renderizado. **No se hicieron mediciones comparativas de rendimiento** dentro de este registro. Si el documento académico afirma mejoras de tiempo de carga, anexar mediciones antes/después (por ejemplo, Lighthouse) o reformular el resultado como optimización de estilos y validaciones.

## Limitaciones

Autenticación y datos almacenados únicamente en el navegador (prototipo académico). La seguridad de producción, la sincronización multiusuario y la base de datos son futuras mejoras.
