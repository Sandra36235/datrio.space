# Datrio maximalista — diseño

## Intención

Sandra quiere que datrio.space se sienta como **entrar a su cabeza**: una experiencia viva, animada de punta a punta, maximalista y sin reglas, con su personalidad creativa, un poco cínica e irreverente. Hoy el sitio se ve correcto pero quieto, y la paleta crema y pastel se siente deslavada. Ella no la ama. Su referencia es la identidad de "Puff Coffee": colores llenos, rayas de toldo, bloques de color a pantalla completa, una firma cursiva con una sans fuerte y objetos que caen.

**Éxito:** quien entra dice "wow" en los primeros 3 segundos, recorre todo bajando la página como en una película, y sale sabiendo quién es Sandra: datos, docencia, café, música y Puyol.

## Metas

- La portada se convierte en un **recorrido cinematográfico guiado por el scroll**: la cámara viaja por el salón 3D, cruza un portal al estudio y termina en un collage.
- Paleta nueva **en todo**: la web, el salón y el estudio 3D, y las 5 páginas interiores.
- **Actitud maximalista**: rayas, cuadros, ondas, stickers, garabatos, cintas de texto corriendo, objetos que caen y microanimaciones en cada interacción.
- Mantener todo lo que ya existe y funciona: Puyol caminando, las actividades (café, ajedrez, ukelele y Kindle), los "+" y los rincones.

## No metas

- Escribir contenido nuevo. Los textos de los rincones se quedan; solo cambia cómo se presentan.
- Crear páginas nuevas.
- Rehacer los modelos 3D desde cero. Se re-pintan y se agregan detalles; la geometría se reutiliza.

## Anti-metas (sería un fracaso aunque funcione)

- **Caos que esconde el contenido**: si no se lee el texto o no se encuentra cómo entrar a un rincón, falló.
- **Lento o trabado en el celular**: si el recorrido va a tirones en un teléfono de gama media, falló.
- **Perder el tono del homenaje a Puyol**: su página se queda serena y respetuosa, con la paleta nueva pero sin stickers saltones ni objetos cayendo encima del poema.
- **Tocar los cuadros originales de Sandra** (las pinturas de mascotas y sus marcos): prohibido.
- **Quitar detallitos** del salón o del estudio: prohibido. Se re-pintan, no se borran.

## Restricciones

- Sitio estático en GitHub Pages: HTML, CSS y JS sin build. Three.js está en `vendor/`.
- Todo funciona con `prefers-reduced-motion`: versión quieta, sin caídas ni giros.
- `node scripts/check-living-room.mjs` debe seguir pasando.
- En el celular no puede haber scroll horizontal.
- Las versiones de caché (`?v=`) se suben en cada entrega.

## Enfoques considerados

| Enfoque | Qué es | Por qué sí o por qué no |
|---|---|---|
| A · Movimiento sobre lo existente | Misma estructura, con animaciones agregadas | Rápido, pero sigue siendo "una web con secciones"; no da el wow que pide |
| **B · Película con scroll** ✅ | La portada es un recorrido; la cámara 3D avanza con el scroll por capítulos | **Elegido** por Sandra |
| C · Collage irreverente | Romper la cuadrícula con stickers, cintas y caos gráfico | Su **actitud** se suma a B (elegido: B + C) |

**Elegido: B con la actitud de C.**

## Lenguaje visual (decidido con Sandra)

### Paleta

| Token | Color | Uso |
|---|---|---|
| `--cherry` | `#8E1825` | Color principal: fondos de bloque, sofá, toldos y títulos |
| `--columbia` | `#C8D9EC` | Segundo fondo, rayas, paredes del 3D |
| `--butter` | `#FFEDAD` | Acentos, botones y texto sobre cereza |
| `--chocolate` | `#3D2722` | Texto principal, madera oscura y fondos nocturnos |
| `--paper` | `#FFF8EE` | Respiro neutro, en poca cantidad |

El maximalismo viene de **los patrones** (rayas, cuadros, ondas, festones), no de agregar más colores. No hay degradados crema.

### Tipografía

- **Titulares:** Bricolage Grotesque 800, en mayúsculas y con interletra ajustada. Ya se carga para el logo.
- **Firma:** Fraunces itálica, como en "*mi cabeza.*". Es el gesto cursivo.
- **Texto:** DM Sans.

### Motivos

Rayas de toldo cereza y columbia · damero cereza y mantequilla · bordes de festón ondulado · stickers que giran (estrellas, "¡hola!", "+1 café") · garabatos a mano (flechas, círculos, subrayados) · cintas de texto que corren ("datos · café · puyol · música · ideas") · objetos del universo de Sandra que caen y rebotan (tazas, discos, libros, la pelota de Puyol).

## La portada: un recorrido por capítulos

El canvas 3D queda **fijo** detrás mientras se baja. Cada capítulo mueve la cámara y muestra una tarjeta-historia encima.

| # | Capítulo | En pantalla | Cámara |
|---|---|---|---|
| 0 | **Intro** | El toldo de rayas se levanta, aparece "PASA, ESTÁS EN *mi cabeza.*", caen objetos y corre una cinta | Vista general del salón, de noche; las lámparas se prenden |
| 1 | **Salón: café** | Tarjeta "Café & matcha" con sticker; enlace al rincón | Se acerca a la barra de café |
| 2 | **Salón: música** | Tarjeta "Mi música" con un disco girando | Al tocadiscos |
| 3 | **Salón: biblioteca y setup** | Tarjetas "Biblioteca" y "Setup tech" | Estante y escritorio gamer |
| 4 | **Salón: Puyol** | Tarjeta serena, sin stickers; enlace a su rincón | Su camita guinda |
| 5 | **Portal** | Barrido de rayas a pantalla completa; el salón se disuelve | Corte al estudio |
| 6 | **Estudio** | "Lo que hago": dashboard, pizarra y diplomas | Recorre escritorio → pizarra → diplomas |
| 7 | **Otros retazos** | Collage de las ilustraciones de Sandra flotando con parallax y stickers | El canvas se aparta |
| 8 | **Final** | Gran bloque cereza con contacto y la cinta | — |

**"Explorar a mi aire":** un botón visible en todo el recorrido suelta la cámara y vuelve al modo actual (girar, zoom, los "+", pasear a Puyol y las actividades). Así no se pierde nada de lo interactivo.

## Interacción y animación en todo el sitio

- Cursor propio: un punto cereza que crece sobre lo clickeable. Easter egg: activar un rastro de mini Puyols.
- Botones magnéticos y stickers que se mueven al pasar el mouse.
- Titulares que aparecen letra por letra al entrar en pantalla.
- Transiciones entre páginas con un barrido de rayas.
- Microrrebotes al hacer clic.

## El 3D con la paleta nueva

- **Salón:** paredes columbia con zócalo blanco; toldo de rayas cereza y columbia sobre la barra de café y una cenefa en la ventana; damero cereza y mantequilla en la alfombra; sofá cereza `#8E1825`; madera más chocolate en los muebles oscuros; de noche en la intro, con las lámparas encendidas.
- **Estudio:** el mismo trato. La alfombra ondulada pasa a columbia y mantequilla, las paredes a columbia, y se suman acentos cereza.
- **Se quedan intactos:** los cuadros de mascotas, la galería de Puyol y todos los objetos. Solo cambian los materiales y colores de paredes, piso y muebles, y se agregan toldos.

## Páginas interiores

`datrio-pages.css` se re-tematiza:
- secciones como bloques de color a lo ancho, alternando cereza, columbia y mantequilla;
- encabezado con una franja de rayas;
- tarjetas como bloques planos de color con borde de festón;
- stickers y garabatos decorativos;
- cintas de texto entre secciones.

**El rincón de Puyol** usa la paleta pero con un tono sereno: sin stickers ni caídas cerca del poema.

## Técnica (decisiones de Claude)

- **Sin librerías nuevas:** el recorrido y las animaciones se hacen con JS y CSS propios (progreso del scroll, `IntersectionObserver`, keyframes). Así no hay que descargar dependencias y el sitio sigue sin build. Se mantiene el scroll nativo, que es más estable en el celular.
- **Cámara:** cada capítulo define una posición y un objetivo. El scroll interpola entre ellos y alimenta la cámara de `universe.js`, que deja de dibujar cuadros cuando no hay movimiento.
- **Celular:** los mismos capítulos, con menos objetos cayendo, menor resolución del 3D y tarjetas a todo el ancho abajo.
- **`prefers-reduced-motion`:** los capítulos se convierten en secciones quietas con capturas del 3D, sin caídas ni toldo animado.

## Entregas por fases

Cada fase se publica después de que Sandra la vea.

1. **Paleta, tipografía e intro + capítulos del salón (0–4)**, sobre el salón actual. Es lo primero que ella "siente".
2. **Portal, estudio y collage (5–8)**, más el botón "Explorar a mi aire" completo.
3. **Re-pintar el salón y el estudio 3D** con la paleta y los toldos.
4. **Páginas interiores**, cursor, stickers, transiciones y pulido final.

## Decisiones de Claude (para que Sandra las revise)

- **Recorrido y modo libre:** durante el recorrido, Puyol camina solo y los "+" se esconden. "Explorar a mi aire" devuelve la cámara libre, los "+", el paseo de Puyol y las actividades.
- **Salón y estudio** siguen siendo dos escenas; el portal cambia cuál se ve.
- **Menú de arriba:** "Mi universo", "Lo que hago" y "Mis retazos" saltan a sus capítulos (1, 6 y 7). Los enlaces `#salon` y `#estudio` de las páginas interiores siguen funcionando y llevan a esos capítulos.
- **Luz:** la intro es de noche, con las lámparas encendiéndose; desde el capítulo 1 se hace de día de a poco.

## Lo que queda a criterio del constructor

- Posiciones exactas de la cámara en cada capítulo.
- El diseño concreto de cada sticker y garabato.
- Los textos cortos de las tarjetas-historia. Se toman de los textos existentes de cada rincón; si falta uno, se escribe con la voz de Sandra (informal, un poco irreverente) y se le muestra antes de publicar.
- Las curvas y tiempos de animación.

## Cambio de rumbo (23-11-2026, pedido por Sandra)

No más animaciones guiadas por el scroll. La portada abre con una **intro tipo video** de unos 17 segundos que se reproduce sola: toldo, título, objetos que caen y la cámara recorriendo el café, la música, la biblioteca y la camita de Puyol, con una leyenda por parada. Termina en el botón **"Recorrer el espacio"**, que devuelve lo central: jugar con Puyol en los espacios. Se puede saltar desde el primer segundo y repetir con "Ver intro". Se ve una vez por visita; quien vuelve desde una página interior entra directo al salón. Los botones de Puyol cortan la intro si se tocan.
