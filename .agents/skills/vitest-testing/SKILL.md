---
name: vitest-testing
description: Crear, ejecutar y depurar pruebas con Vitest para la app plan-estudio. Úsala cuando se pidan pruebas, cobertura o investigar un fallo reproducible en este proyecto.
---

# Testing con Vitest en plan-estudio

Trabaja desde la raíz de `plan-estudio`. Antes de cambiar archivos, revisa `package.json`, la configuración de Vitest si ya existe y las pruebas cercanas al código que vas a comprobar. Respeta las convenciones encontradas.

## Preparar el entorno cuando falte

Este proyecto usa npm, React, TypeScript, Vite y Vinext. En el estado inicial no incluye Vitest, un script `test` ni pruebas. Si la tarea requiere escribir o ejecutar pruebas y siguen faltando, añade las dependencias y la configuración mínimas para la prueba solicitada; actualiza también `package-lock.json`. No configures cobertura, navegador real o CI salvo que el trabajo lo necesite.

- Para lógica sin DOM, usa el entorno `node`.
- Para componentes React, usa `jsdom` y React Testing Library. Añade `@testing-library/user-event` para interacciones y `@testing-library/jest-dom` si sus matchers aportan claridad.
- Vitest carga `vite.config.ts` por defecto. Aquí ese archivo inicia plugins de Vinext, Cloudflare y Sites. Prefiere un `vitest.config.ts` independiente con la resolución del alias `@/` y solo los plugins imprescindibles para la prueba. Evita iniciar Worker, D1 o R2 para pruebas de componentes que no los usan.
- Añade un script de ejecución única, por ejemplo `"test": "vitest run"`. Ejecuta pruebas concretas durante el desarrollo y la suite completa al terminar. Usa el comando del proyecto si ya existe.

## Diseñar las pruebas

Prueba el comportamiento observable y las regresiones que motivaron la petición. Coloca `*.test.ts` o `*.test.tsx` cerca del módulo, o sigue la estructura de pruebas existente. Para la página `app/page.tsx`, prioriza flujos como crear y editar tareas, marcar completadas, moverlas de fecha, recuperar y guardar datos en `localStorage`, y validar entradas de `modelContext` cuando esa integración sea el objeto del cambio. No intentes cubrir todos esos flujos en cada tarea.

Usa consultas por rol, nombre accesible y texto visible para la interfaz. Aísla `localStorage`, reloj, `crypto.randomUUID` y registros de herramientas entre casos cuando afecten al resultado. Controla la fecha en las pruebas del calendario para evitar resultados distintos según el día o la zona horaria. Simula solo los límites externos necesarios; deja que el código bajo prueba ejecute la lógica real. Evita snapshots amplios y aserciones que repitan la implementación.

## Verificar y entregar

Ejecuta la prueba cambiada, luego la suite completa y las comprobaciones existentes que el cambio pueda afectar. Si falla algo, distingue un error del producto, un supuesto incorrecto de la prueba y un problema de entorno antes de modificar código. En el resumen indica qué comportamiento quedó cubierto, qué comandos corriste y cualquier fallo que permanezca.
