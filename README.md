# Plan de estudio

Frontend para organizar tareas de estudio en un calendario. Permite crear, editar, completar y mover tareas entre días o dejarlas sin fecha. Los datos se guardan en `localStorage` del navegador: por ahora no hay cuentas, sincronización entre dispositivos ni backend para las tareas.

## Requisitos y desarrollo

- Node.js 22.13 o posterior.
- npm y las dependencias del `package-lock.json`.

Desde `plan-estudio/`:

```bash
npm run install:ci
npm run dev
```

El servidor de desarrollo portátil usa `http://localhost:5173`. Para verificar el proyecto:

```bash
npm run lint
npm run build
npm run start
```

`npm run start` ejecuta localmente el Worker generado por el build. La opción de ChatGPT sign-in incluida en el starter es una simulación disponible únicamente en desarrollo local; la aplicación actual no la utiliza para guardar tareas.

## Estructura

- `src/app/`: página, layout, estilos y helpers opcionales de autenticación.
- `src/components/ui/`: componentes de interfaz reutilizables.
- `src/hooks/` y `src/lib/`: hooks y utilidades compartidas.
- `src/db/` y `drizzle/`: soporte opcional de D1 y migraciones; las tareas actuales no usan la base de datos.
- `public/`: archivos estáticos.
- `scripts/`, `build/` y `vendor/`: herramientas y dependencias del starter.

El código de la aplicación está dentro de `src/` para mantener separadas las fuentes de los archivos generados y facilitar un futuro análisis con SonarQube.

## Configuración y publicación segura

El proyecto puede compilarse con `.openai/hosting.example.json`, que no contiene identificadores de despliegue. Si se usa Sites, copia ese archivo a `.openai/hosting.json` y configura allí el proyecto y los bindings necesarios. El archivo local está excluido de Git.

No guardes contraseñas, tokens ni claves en el repositorio o en variables `NEXT_PUBLIC_*`, ya que estas últimas se incorporan al código entregado al navegador. Los archivos `.env*`, el estado local de Wrangler/Sites, las dependencias y los resultados de compilación están excluidos de Git. Revisa los archivos preparados con `git diff --cached` antes de publicar.

## Créditos

Este proyecto fue realizado por **Mixcoatl666** con ayuda de **OpenAI Codex**. Está basado en el [curso gratuito de Codex de MoureDev (Brais Moure)](https://www.youtube.com/watch?v=af1KAQCD7mk&t=3548s). El crédito por el curso y su contenido original corresponde a MoureDev; el desarrollo y las adaptaciones de este repositorio corresponden a su autor con asistencia de Codex.

Los componentes y herramientas de terceros conservan sus licencias en los archivos correspondientes.
