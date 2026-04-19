# NextPark

Landing page para un sistema de gestion de parqueaderos urbanos. La experiencia se centra en un hero con video, transiciones suaves y secciones informativas sobre la propuesta de valor.

## Contenido

- [Tecnologias](#tecnologias)
- [Requisitos](#requisitos)
- [Instalacion](#instalacion)
- [Scripts](#scripts)
- [Estructura](#estructura)
- [Personalizacion](#personalizacion)

## Tecnologias

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS

## Requisitos

- Node.js 18 o superior
- npm (o tu gestor de paquetes preferido)

## Instalacion

```bash
npm install
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estructura

```text
app/
  layout.tsx
  page.tsx
  components/
	Navbar.tsx
	VideoCarousel.tsx
	VideoCarousel.module.css
public/
  videos/
```

## Personalizacion

- Edita los textos y secciones en `app/page.tsx`.
- Ajusta el carrusel en `app/components/VideoCarousel.tsx`.
- Reemplaza los videos en `public/videos/` manteniendo los nombres o actualiza la lista en `app/page.tsx`.
