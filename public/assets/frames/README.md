# Frames

Carpeta reservada para overlays o marcos finales exportados.

Si luego deseas usar un frame PNG exacto en lugar de dibujarlo por Canvas,
colocalo aqui y se puede conectar al flujo de composicion.

Para mostrar una imagen real en la primera tarjeta del selector de marcos,
coloca el archivo en:

- `public/assets/frames/finisher-selector.png`

Para mostrar una imagen real en la tarjeta `SOPLA Team`, coloca el archivo en:

- `public/assets/frames/team-selector.jpg`

Para mostrar una imagen real en la tarjeta `Guayaquil`, coloca el archivo en:

- `public/assets/frames/guayaquil-selector.jpg`

Para mostrar una imagen real en la tarjeta `Aliados que impulsan`, coloca el archivo en:

- `public/assets/frames/imparable-selector.jpg`

Para que `Aliados que impulsan` use un marco final distinto en camara y review,
coloca tambien:

- `public/assets/frames/imparable-overlay.png`

La descripcion inferior de la tarjeta se mantiene visible.

Para que `review` y la imagen final usen un marco PNG real por encima de la foto,
coloca tambien:

- `public/assets/frames/finisher-overlay.png`

Ese archivo debe tener transparencia en el area donde debe verse la foto.
La composicion sera:

1. foto abajo
2. overlay PNG arriba

Si ese archivo no existe, el sistema seguira usando el marco dibujado por Canvas.
