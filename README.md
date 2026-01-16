# Studio Labut' website template (static)

This is a **static** (no-backend) website template inspired by the layout you shared:

- centered brand name + nav under it
- big hero headline on the left + hero image on the right
- 3-column product grid
- split image/text section on a soft accent background
- 3-column "values" row
- journal teaser layout
- footer with newsletter form and link column

## Edit the content

Open `index.html` and change text directly. The main sections are:

- Hero
- Shop grid
- About split section
- Values row
- Journal teaser
- Footer

## Replace images

All images are local SVG placeholders in `assets/`. Replace them with your own photos (JPG/PNG/WebP) and update the `<img src="...">` paths in `index.html`.

Tip: keep similar aspect ratios for the layout:

- Hero: wide
- Products: tall-ish (portrait)
- Split feature: square
- Journal posts: landscape
- Footer image: landscape

## Slovak course tab

The nav has a **Learn Slovak** link pointing to `slovak/`.

- If you already have your Slovak course website, copy its files into the `slovak/` folder (so `slovak/index.html` exists).
- If you want the course to live somewhere else, change the link in the header nav: `href="slovak/"`.

## Running locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

- http://localhost:8080

## Deploying to GitHub Pages

1. Create a repo (commonly: `bjs247.github.io`)
2. Upload these files to the repo root
3. In the repo: **Settings → Pages → Deploy from branch → main /(root)**

