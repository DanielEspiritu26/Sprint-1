# Guía para integrar el Sprint 4 corregido

## 1. Abrir la rama sin afectar `main`

En la Mac, abre Terminal y entra al repositorio clonado previamente:

```bash
cd ~/sprint-1
git status
git fetch origin
git branch -a
```

Si existen cambios sin confirmar, **detente y consérvalos** antes de continuar. Si la rama `rama-sprint4` existe localmente, usa `git switch rama-sprint4`. Si solo existe en remoto, usa `git switch -c rama-sprint4 --track origin/rama-sprint4`. Si no existe ninguna de ellas, consulten con el equipo antes de crearla.

## 2. Copiar el código corregido

Descomprime `Sprint4_Corregido_Entrega.zip` en Descargas. Si quedó la carpeta `~/Downloads/Sprint-1-rama-sprint4`, estando en la raíz de tu repositorio clonado ejecuta:

```bash
rsync -av --exclude='.git' --exclude='node_modules' ~/Downloads/Sprint-1-rama-sprint4/ ./
git status
git diff --stat
```

**Importante:** revisa el resumen de cambios antes de confirmar. Si alguien modificó la rama desde que se preparó el ZIP, compara los archivos y no sobrescribas su trabajo sin acuerdo.

## 3. Instalar, probar y compilar

Con Node compatible con `package.json`:

```bash
npm ci
npm test
npm run build
npm run dev
```

Las pruebas automatizadas deben dar **7 aprobadas**. `npm run build` debe terminar sin errores. Abre la URL local que muestre Vite y completa la tabla del archivo `EVIDENCIAS_SPRINT4.md`, tomando capturas. **La compilación y la revisión visual deben realizarse en la Mac:** el entorno que generó el ZIP no pudo instalar todas las dependencias y no confirmó el build.

## 4. Guardar cambios en la rama

```bash
git add .
git commit -m "Sprint 4: corregir gastos, validaciones, responsivo y pruebas"
git push -u origin rama-sprint4
```

Confirma que la rama se ve en GitHub. Cuando el equipo lo apruebe, crea un pull request **rama-sprint4 → main** y revisa que las pruebas sigan funcionando después de integrarlo.

## 5. Publicar la aplicación

Si GitHub Pages usa la rama `gh-pages`, no se actualiza automáticamente por hacer push a `main`. Publica el build actualizado con el procedimiento que utiliza el equipo para `gh-pages`, y verifica en una ventana privada:

https://melvga.github.io/Sprint-1/

## 6. Terminar el Word

Usa `Reporte_Sprint_4_para_completar.docx` como base. Completa portada, roles, fecha, acta/captura de retrospectiva, pruebas manuales y pantallas móvil/escritorio. El reporte no debe afirmar mejoras de tiempo de carga sin una medición real. La portada y el enlace de GitHub son exigidos por la actividad.
