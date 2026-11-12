---
description: Crea un git worktree en .worktrees/<nombre>, normalizado a kebab-case
---

Crea un worktree siguiendo estos pasos:

1. Normaliza el nombre del worktree a partir de `$1` (que puede contener espacios y mayúsculas):
   - Convierte a minúsculas.
   - Quita acentos/diacríticos (á → a, ñ → n).
   - Reemplaza cada secuencia de espacios o guiones bajos por un solo guion `-`.
   - Elimina cualquier carácter que no sea letra minúscula, dígito o guion, y colapsa guiones consecutivos.
   - Si el nombre normalizado queda vacío, pide al usuario un nombre válido antes de continuar.
2. Crea el worktree ejecutando exactamente este comando con la herramienta shell desde la raíz del proyecto:

git worktree add ".worktrees/<nombre-normalizado>"

No hagas ningún otro cambio. Al terminar, reporta el resultado (éxito o error), el nombre original tal como lo escribió el usuario, el nombre normalizado usado y la ruta absoluta del worktree creado.
