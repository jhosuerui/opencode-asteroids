# Asteroids

Clon del clásico arcade **Asteroids** implementado en canvas HTML5 puro, sin dependencias ni bundler.

## Descripción

Nave espacial en un campo de asteroides con envolvimiento de bordes (el espacio es toroidal). Destruye asteroides para sumar puntos: los grandes se parten en medianos, los medianos en pequeños. Al destruir asteroides pueden soltar power-ups de velocidad (duplican el movimiento de la nave durante 5 segundos) o de escudo (un campo protector que destruye asteroides y estrellas fugaces al contacto durante 5 segundos).

## Tecnologías

- **HTML5 Canvas** — renderizado 2D
- **JavaScript (ES6+)** — lógica del juego en un solo archivo `game.js`
- Sin frameworks, sin bundler, sin dependencias

## Cómo correr

Abre `index.html` directamente en el navegador (doble clic), o usa un servidor local:

```bash
npx serve .
```

Luego visita `http://localhost:3000`.

## Controles

| Tecla     | Acción     |
| --------- | ---------- |
| `←` `→`   | Rotar nave |
| `↑`       | Propulsar  |
| `Espacio` | Disparar   |
| `S`       | Cambiar skin de la nave (funciona en cualquier momento; se recuerda entre sesiones) |

## Puntuación

| Asteroide | Puntos |
| --------- | ------ |
| Grande    | 20     |
| Mediano   | 50     |
| Pequeño   | 100    |
| Estrella fugaz | 250 |

## Características

- 3 vidas con invencibilidad temporal al reaparecer (parpadeo)
- Asteroides se parten en fragmentos más pequeños al ser destruidos
- Partículas de explosión al destruir asteroides
- Power-up de **velocidad**: 12% de probabilidad al destruir un asteroide; duplica empuje y rotación por 5 s, con tinte cian en la nave y barra de tiempo en el HUD
- Power-up de **escudo**: ~9% de probabilidad al destruir un asteroide; activa un campo verde de 24 px alrededor de la nave por 5 s que destruye al contacto asteroides (con puntos y fragmentos, igual que una bala) y estrellas fugaces, con barra de tiempo en el HUD
- **Estrella fugaz**: aparece aleatoriamente cada 10–16 s, cruza la pantalla a gran velocidad y se desvanece a los 6 s; destruirla vale 250 puntos, pero choca contra la nave como un asteroide
- Niveles progresivos: más asteroides en cada nivel
- **Skins de nave**: 5 siluetas con colores propios (Clásica, Dardo, Ígnea, Esmeralda y Dorada); se ciclan con `S` en cualquier momento y la elección se guarda en `localStorage`
