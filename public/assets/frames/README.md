# Frames

Carpeta reservada para overlays o marcos finales exportados.

Si luego deseas usar un frame PNG exacto en lugar de dibujarlo por Canvas,
colocalo aqui y se puede conectar al flujo de composicion.

Para mostrar una imagen real en la primera tarjeta del selector de marcos,
coloca el archivo en:

- `public/assets/frames/finisher-selector.png`

La descripcion inferior de la tarjeta se mantiene visible.

Para que `review` y la imagen final usen un marco PNG real por encima de la foto,
coloca tambien:

- `public/assets/frames/finisher-overlay.png`

Ese archivo debe tener transparencia en el area donde debe verse la foto.
La composicion sera:

1. foto abajo
2. overlay PNG arriba

Si ese archivo no existe, el sistema seguira usando el marco dibujado por Canvas.
