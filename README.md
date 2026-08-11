# ManoAmiga · Frontend

Interfaz de [ManoAmiga](https://github.com/sebastian-barrera-herrera/mano-amiga-back), la
plataforma ciudadana de ayuda ante el terremoto en Colombia: reportar y buscar **personas y
mascotas desaparecidas**, avisar de **hallazgos** y compartir **información útil** (agua,
refugios, medicamentos, voluntarios).

Pensada para funcionar en un teléfono modesto con mala conexión, y para que **cualquiera pueda
publicar sin crear cuenta**.

**React 19 + Vite 6 + React Router 7 + TailwindCSS 3.** API en un repositorio aparte:
[`mano-amiga-back`](https://github.com/sebastian-barrera-herrera/mano-amiga-back).

---

## Puesta en marcha

Requisitos: **Node 20 o superior** y la API corriendo en `http://localhost:3000`.

```bash
npm install
npm run dev
```

La app queda en http://localhost:5173

En desarrollo el frontend llama a `/api` y Vite lo reenvía al backend, así que **no hay que
configurar CORS ni variables de entorno**. Sólo hacen falta en producción:

```bash
cp .env.example .env   # únicamente si vas a apuntar a una API remota
```

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL de la API **incluyendo `/api`**. En desarrollo, vacía. En Netlify: `https://tu-api.onrender.com/api`. |
| `VITE_GOOGLE_CLIENT_ID` | El mismo Client ID que el backend. Vacía = sin botón de Google. |

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Comprueba tipos y compila a `dist/` |
| `npm run preview` | Sirve lo compilado, para revisarlo antes de desplegar |
| `npm run typecheck` | Sólo la comprobación de tipos |

---

## Diseño

### Los colores de la bandera, con un papel cada uno

| Color | Uso |
| --- | --- |
| **Azul** `#003893` | Acciones principales, navegación, enlaces y filtros activos |
| **Amarillo** `#FCD116` | Identidad (franja de la bandera, icono) y **hallazgos**: mascotas y personas encontradas |
| **Rojo** `#CE1126` | Urgencia: **desapariciones**, números de emergencia, errores y acciones destructivas |

Dos detalles que importan:

- El amarillo puro **no tiene contraste suficiente sobre blanco**, así que nunca se usa para
  texto: siempre como fondo con texto oscuro, o como franja decorativa. Todas las
  combinaciones de la app superan el mínimo AA de la WCAG (la más baja está en 6,7:1).
- Rojo para «desaparecida» y amarillo para «encontrada» no es sólo estético: **rojo y verde son
  justo el par que peor distinguen las personas con daltonismo**, mientras que rojo y amarillo
  se separan bien. Además, las insignias siempre llevan texto, no sólo color.

### Pensado para móviles

- **Objetivos táctiles de 44 px o más** en todos los botones y campos.
- **Etiquetas reales** en cada campo, errores con `role="alert"` y `aria-invalid`, y el foco
  salta al primer campo con error al enviar.
- Enlace *«Saltar al contenido»*, foco visible y navegación completa por teclado.
- Los campos usan 16 px para que iOS no haga zoom al escribir.
- **Compresión de imágenes en el propio dispositivo** (máx. 1280 px, JPEG) antes de subirlas,
  con barra de progreso real: una foto de 2 MB acaba pesando unos 25-50 KB.
- La foto va a donde diga la API: al CDN de Cloudinary si está configurado, o a la base de datos
  si no. El formulario es idéntico en los dos casos.
- Cuando vienen de Cloudinary, las fotos llegan optimizadas (`f_auto,q_auto` y ancho según el
  hueco donde se muestran).
- **Carga diferida por pantalla** y `loading="lazy"` en las fotos del listado: la carga inicial
  son ~80 KB comprimidos.
- **Service worker** que guarda el armazón de la app para que abra con red intermitente. Nunca
  cachea `/api`, así que los datos siempre son frescos.
- Los datos de contacto se recuerdan en el dispositivo para no reescribirlos en cada reporte.
- Los filtros y la búsqueda van en la URL: un listado filtrado se puede compartir por WhatsApp.

Sin librerías de componentes, sin librerías de iconos y sin gestor de estado: los iconos son
SVG en línea y el estado se maneja con hooks.

---

## Estructura

```
src/
├── main.tsx                 # arranque y registro del service worker
├── App.tsx                  # rutas
├── index.css                # capas de Tailwind y clases compartidas
├── types.ts                 # tipos que reflejan las respuestas de la API
├── components/              # UI reutilizable
│   ├── AppLayout.tsx        # encabezado con la franja, navegación inferior, pie
│   ├── Button · Field · Badge · Alert · Feedback · FilterChip
│   ├── ReportCard · Pagination · CopyButton · PhotoUpload
│   ├── GoogleSignIn.tsx     # carga Google Identity Services sólo al abrir /cuenta
│   └── Icons.tsx            # todos los iconos, en SVG
├── context/AuthContext.tsx  # sesión opcional
├── lib/
│   ├── api.ts               # cliente HTTP y manejo de errores
│   ├── reportForms.ts       # los cuatro formularios, definidos como datos
│   ├── image.ts             # compresión en el navegador y URLs optimizadas
│   ├── uploads.ts           # subida firmada a Cloudinary con progreso
│   ├── format.ts            # fechas en español, etiquetas, teléfonos
│   ├── clipboard.ts         # copiar con respaldo para navegadores antiguos
│   └── storage.ts           # datos de contacto recordados
└── pages/                   # una por pantalla, con carga diferida
```

Los cuatro formularios (persona/mascota × desaparecida/encontrada) **no son cuatro
componentes**: son cuatro configuraciones en [`lib/reportForms.ts`](src/lib/reportForms.ts) que
`ReportFormPage` renderiza. Añadir un campo o cambiar una etiqueta se hace ahí, en un sitio.

---

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Portada con los seis accesos y las cifras |
| `/reportar/persona-desaparecida` | Formulario |
| `/reportar/mascota-perdida` | Formulario |
| `/reportar/persona-encontrada` | Formulario |
| `/reportar/mascota-encontrada` | Formulario |
| `/reportes` | Listado con buscador, filtros y paginación |
| `/reportes/:id` | Detalle con contacto, botones de copiar, llamar y WhatsApp |
| `/reportes/:id/editar` | Edición (sólo el autor) |
| `/muro` | Mensajes comunitarios |
| `/cuenta` | Inicio de sesión opcional (correo o Google) |
| `/mis-publicaciones` | Administrar lo propio |

---

## Despliegue en Netlify

Sitio en producción: **https://manoamigacolombia.netlify.app**

Con [`netlify.toml`](netlify.toml) casi todo está hecho. Sólo hay que:

1. Conectar el repositorio (**Add new site → Import an existing project**).
2. En **Site configuration → Environment variables**, definir
   `VITE_API_URL` = `https://mano-amiga-back.onrender.com/api` (la URL que da Render, siempre
   terminada en `/api`).
3. Si usas Google, definir también `VITE_GOOGLE_CLIENT_ID`.

> **Ojo:** Vite incrusta las variables `VITE_*` **al compilar**, no al ejecutar. Si cambias
> `VITE_API_URL` hay que lanzar un *redeploy* para que surta efecto; recargar el navegador no
> basta.

En Render, `CORS_ORIGINS` debe llevar el dominio de este sitio.

**Alternativa sin CORS:** en lugar de `VITE_API_URL`, añade un proxy en `netlify.toml` **antes**
de la regla de la SPA. Así el navegador siempre habla con el mismo dominio:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://mano-amiga-back.onrender.com/api/:splat"
  status = 200
  force = true
```

> Tailwind 3 y no 4 a propósito: la versión 4 exige Chrome 111 o superior, y esta app tiene que
> verse bien en teléfonos Android antiguos. Por lo mismo, el `target` de compilación es
> `es2018`.

---

## Licencia

MIT.
