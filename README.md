# American Pizza & Grill: website concept

A concept website for American Pizza & Grill, 4081 Beach Road, Garapan, Saipan. It was made to show the owner. It is not the restaurant's official site.

**Live preview:** https://paxusai.github.io/american-pizza-grill-preview/

## What's in it

- Cinematic opening, story section and a "Made to order" kitchen strip
- Editorial menu where each dish is shown in live 3D (WebGL, no plugins)
- Build-your-pizza preview, day-to-night hours, and an order and reserve finale

## Photos

- The burger, chicken, steak, nachos and drink photos are the restaurant's own.
- The pizza, wings, pasta, salad, dessert and espresso martini photos are free Unsplash samples. They are marked "Sample photo" on the page and should be replaced with real shots before launch.

## Files

Plain HTML, CSS and JavaScript. There is no build step.

- `index.html`: the page
- `css/style.css`: styles
- `js/data.js`: menu, prices and copy
- `js/main.js`: scroll animations and interactions
- `js/dish3d.js`: 3D dish renderer
- `js/menu-media.js`: built-in copies of the menu photos, so the 3D works when `index.html` is opened directly from disk
- `img/`: photos

Every page is set to `noindex`, so search engines leave the preview out.
