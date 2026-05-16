---
name: blog-status
description: Reporte completo del pipeline editorial. Tabla con todos los blogs y su fase actual. Marca los estancados (>7 días sin avance). Read-only — no modifica state.
---

# /blog-status — radiografía del pipeline

## Uso

```
/blog-status
```

Sin argumentos.

## Qué hace

1. Invoca al agente `iriatalan-blog-conductor`.
2. Lee `sanity/seeds/blog-pipeline-state.json`.
3. Imprime tabla:
   ```
   | slug | phase | últ. cambio | día actual | estancado? |
   ```
4. Sección "Estancados" — blogs >7 días sin tocar (con phase ≠ done/archived).
5. Sección "Esta semana" — transiciones recientes.
6. Sugiere próxima acción concreta para cada estancado.

## Qué NO hace

- NO transiciona fases.
- NO modifica nada.

## Prompt que dispara

> Usa el agente `iriatalan-blog-conductor` con el comando `/blog-status`. Reporte completo del pipeline sin modificaciones.
