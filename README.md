# Mi Despensa — Sprint 4 (HU-12)

Prototipo académico desarrollado con **Vue 3 + Vite**, siguiendo Scrum. Permite administrar el inventario, una lista automática de productos agotados (stock 0) y un presupuesto mensual.

## Inicio rápido

Requiere Node.js compatible con las versiones indicadas en `package.json` (preferentemente Node 24.12+).

```bash
npm ci
npm run dev
```

Abre la dirección local que muestre Vite. Para compilar:

```bash
npm run build
```

## Pruebas incluidas en Sprint 4

```bash
npm test
```

Las pruebas usan el ejecutor integrado `node:test`, sin instalar bibliotecas de pruebas adicionales. Incluyen **pruebas unitarias** de validación, importes, compras y periodos, y **pruebas de integración** del flujo persistencia → compra → stock → presupuesto. Para pruebas visuales, completar `EVIDENCIAS_SPRINT4.md` con capturas reales.

## Funcionalidades y reglas

- Mi despensa: altas, eliminación y ajuste de unidades; los artículos con stock 0 pasan a la lista del súper.
- Lista para el súper: filtros de prioridad, edición de costo unitario estimado y cantidad de unidades a comprar. El botón **Comprado** registra la transacción y actualiza el stock.
- Presupuesto mensual: total e historial de compras efectuadas en el mes, disponible, porcentaje, alerta de excedente y gráfica presupuestado/gastado.
- Inicio: indicadores basados en datos reales y cierre de sesión funcional.
- La vista se adapta a tamaños móviles; las tablas permiten desplazamiento horizontal.

**Cambio de comportamiento respecto a Sprints anteriores:** un artículo agotado ya no se considera automáticamente un gasto real; el gasto se produce al registrar una compra. Las compras previas a esta actualización no pueden reconstruirse automáticamente, por lo que el historial comienza con las nuevas compras.

## Limitaciones del prototipo

Los datos y cuentas se guardan en `localStorage` del navegador y **no** se sincronizan entre dispositivos ni constituyen un sistema de autenticación segura. **No usar contraseñas reales, datos personales sensibles ni información financiera real**. Para una aplicación productiva se requiere backend, base de datos y autenticación segura. El presupuesto es un importe configurado manualmente que se mantiene hasta cambiarlo; los gastos se filtran por mes calendario.

## Repositorio

- Código: https://github.com/MelVga/Sprint-1
- Sitio: https://melvga.github.io/Sprint-1/

**Importante:** estos enlaces solo reflejarán el Sprint 4 corregido una vez que se suba la rama, se integre y se vuelva a publicar GitHub Pages.

# Sprint 6

## Objetivo

Desarrollar herramientas de análisis para los gastos registrados y continuar las pruebas de integración entre los módulos de la aplicación.

## Actividades realizadas

- Revisión del módulo de presupuesto.
- Verificación de la integración entre despensa y lista para el súper.
- Validación de la navegación entre pantallas.
- Pruebas funcionales de los módulos desarrollados.

## Resultados obtenidos

- Integración correcta de los módulos.
- Funcionamiento estable de la aplicación.
- Identificación de mejoras futuras relacionadas con análisis de gastos y almacenamiento de información.
