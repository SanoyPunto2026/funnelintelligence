# Framework Estándar: Creación de Guiones para Reels / TikTok

Este es un framework parametrizado diseñado para ser duplicado y adaptado a cualquier nicho, cuenta o formato de video corto. Utiliza variables entre llaves dobles `{{VARIABLE}}` para que cualquier creador de contenido pueda estandarizar sus propios formatos.

---

## 1. Definición del Formato y Concepto

- **Nombre del Formato:** `{{NOMBRE_DEL_FORMATO}}` *(Ej: Súper Alimentos para, Finanzas en 30s, El Error que cometes al...)*
- **Objetivo de Contenido:** `{{OBJETIVO_DE_MARKETING}}` *(Ej: Posicionar autoridad, educar al cliente, conversión a compra, etc.)*
- **Nicho / Audiencia:** `{{NICHO_Y_AUDIENCIA}}` *(Ej: Nutrición saludable, Emprendedores digitales, Cuidado de la piel)*
- **Tono de Comunicación:** `{{TONO}}` *(Ej: Divertido e informal, Científico y serio, Inspirador y energético)*

---

## 2. Estilo Visual e Identidad (IA y Edición)

Para asegurar que todos los videos de este formato tengan una identidad visual idéntica:

- **Estilo Visual Base:** `{{ESTILO_VISUAL}}` *(Ej: Render 3D Pixar, Cinematic 4K realista, Estilo Vlog con cámara en mano, Captura de pantalla con mockup de App).*
- **Sujeto/Personaje Principal:** `{{PERSONAJE_O_SUJETO}}` *(Ej: Un órgano animado, un avatar de IA, el presentador de cara a la cámara, una fruta flotante).*
- **Prompt IA General (para generación de imágenes/video):**

```
"{{PROMPT_BASE_EN_INGLES}}, Unreal Engine 5 style, highly detailed, realistic textures, no text, no letters, no watermark."
```

- **Prohibiciones Visuales:** `{{PROHIBICIONES}}` *(Ej: No usar colores oscuros, evitar textos superpuestos en la imagen base, sin marcas de agua).*

---

## 3. Estructura de Escenas (Plantilla de Guion)

**Duración típica sugerida:** 30 a 60 segundos.

### Escena 0: Hook (Gancho)

Debe durar entre **1 y 3 segundos** para retener al usuario.

| Campo | Valor |
|---|---|
| **Concepto Visual** | `{{DESCRIPCION_VISUAL_DEL_GANCHO}}` *(Ej: El personaje principal estresado frente a un problema común).* |
| **Prompt IA (si aplica)** | `{{PROMPT_GANCHO_EN_INGLES}}` |
| **Movimiento de Cámara** | `{{MOVIMIENTO_CAMARA}}` *(Ej: Zoom rápido al personaje, paneo de arriba a abajo).* |
| **Audio / ASMR** | `{{EFECTOS_SONIDO}}` *(Ej: Suspiro cansado 😮‍💨, Efecto dramático de violines 🎻).* |
| **Locución (Voz en Off / Presentador)** | `"{{PREGUNTA_O_AFIRMACION_SHOCKEANTE}}"` |
| **📹 Control de Video** | `{{INSTRUCCIONES_DE_EDICION}}` *(Ej: Mantener la cámara enfocada al centro, cortar al segundo 3 exactamente).* |

### Escena 1 a N: Cuerpo (Los Puntos de Valor)

Se repite por cada elemento, tip o paso de valor que se muestre en el video.

| Campo | Valor |
|---|---|
| **Concepto Visual** | `{{DESCRIPCION_INTERACCION}}` *(Ej: Entra la mano entregando la solución {{VALOR_X}} y el personaje reacciona feliz).* |
| **Prompt IA** | `{{PROMPT_VALOR_EN_INGLES_CON_VARIABLES}}` *(Ej: A cute character interacting with {{VALOR_X}}, Disney style, no text).* |
| **Movimiento de Cámara** | `{{MOVIMIENTO_CAMARA}}` *(Ej: Toma macro de detalle, paneo lateral fluido).* |
| **Audio / ASMR** | `{{EFECTOS_SONIDO}}` *(Ej: Sonido de éxito: ¡Ding! ✨, Mordisco: Crunch 🍎).* |
| **Locución** | `"{{EXPLICACION_CORTA_DEL_VALOR_X}}"` *(Máximo 15-20 palabras por punto).* |
| **📹 Control de Video** | `{{INSTRUCCIONES_DE_EDICION}}` *(Ej: El personaje no debe deformarse, asegurar que el objeto de valor sea el protagonista).* |

### Escena Final: Outro / Call to Action (CTA)

| Campo | Valor |
|---|---|
| **Concepto Visual** | `{{CARRUSEL_O_CIERRE_VISUAL}}` *(Ej: El personaje feliz y sano señalando hacia abajo o mostrando la pantalla de una App).* |
| **Prompt IA** | `{{PROMPT_CIERRE_EN_INGLES}}` |
| **Movimiento de Cámara** | `{{MOVIMIENTO_CAMARA}}` *(Ej: Zoom out lento alejando la toma).* |
| **Audio / ASMR** | `{{EFECTOS_SONIDO}}` *(Ej: Brillo mágico ✨, Sonido de click o descarga 📲).* |
| **Locución** | `"{{LLAMADO_A_LA_ACCION_EXPLICITO}}"` *(Ej: "Guarda este video para tu próxima compra y descarga la app para ver tu plan personalizado").* |

---

## 4. Estructura del Caption (Copy para Redes)

El copy que acompaña al video en redes sociales debe estructurarse con las siguientes variables:

- **Gancho Textual (Hook):** Pregunta o afirmación llamativa con emojis para captar la atención del usuario en su feed. *(Ej: "{{PREGUNTA_O_AFIRMACION_DEL_TEMA}}").*
- **Texto de Introducción al Valor:** Frase corta que conecta el gancho con la lista de soluciones. *(Ej: "Prueba integrar estos {{N_ELEMENTOS}} {{ELEMENTOS_TIPO}} a tu rutina diaria:").*
- **Desglose / Resumen de Valor:** Lista numerada que resume de forma rápida los elementos mostrados en el video y sus respectivos beneficios:

```
1️⃣ {{ELEMENTO_1}}: {{BENEFICIO_1}}
2️⃣ {{ELEMENTO_2}}: {{BENEFICIO_2}}
...
N️⃣ {{ELEMENTO_N}}: {{BENEFICIO_N}}
```

- **Llamado a la Acción (CTA):** Instrucción final para la audiencia. *(Ej: "👉 Guarda este video para tu próxima compra y comparte con alguien que lo necesite").*
- **Hashtags del Nicho:** Etiquetas relevantes para el alcance. *(Ej: `#{{HASHTAG_NICHO}}` `#{{HASHTAG_TEMA}}` `#{{HASHTAG_MARCA}}`).*

---

## 5. EJEMPLO DE ADAPTACIÓN (Nicho: Cuidado de la Piel / Skincare)

*(Ejemplo de cómo un usuario de Skincare duplicaría este archivo y rellenaría las variables)*

- **Nombre del Formato:** 3 Ingredientes Clave contra el Acné
- **Estilo Visual:** Render 3D estilo Pixar (Un personaje "Poro de la Piel" con carita).
- **Escena Hook:** El "Poro" está triste y rojo, con un volcán de acné a punto de estallar.
- **Locución:** *"¿Cansada de que los granitos aparezcan en el peor momento? Tu piel te está pidiendo estos 3 ingredientes."*
- **Escena 1 (Valor 1):** Ácido Salicílico. La mano aplica una gota y el poro se desinflama sonriendo.
- **Locución:** *"1. Ácido Salicílico: Limpia el poro desde adentro y reduce la inflamación."*

### Caption de ejemplo:

> ¿Granitos rebeldes? 🌋👇 Usa estos 3 ingredientes activos:
>
> 1️⃣ **Ácido Salicílico:** Limpieza profunda.
> 2️⃣ **Niacinamida:** Reduce rojeces.
> 3️⃣ **Árbol de Té:** Antibacteriano natural.
>
> 👉 Comparte este reel con tu amiga obsesionada con el skincare y síguenos para más tips. 🧴✨

---

*Framework creado por Alejandro — Parche de IA #5 Medellín*
