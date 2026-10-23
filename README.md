# Aqeel Umar — Graphic Designer Portfolio

A responsive, static portfolio built with HTML, CSS and vanilla JavaScript. It uses the Marvel typeface with a metallic-grey background and brown typography. It runs locally and on GitHub Pages without package installation, a backend or a build step.

## Open locally

Open `index.html` in a current web browser. The artwork and website assets use relative paths, so the site also works when hosted inside a repository subdirectory. No artwork files need to be renamed or moved.

## Category covers and artwork

`projects.js` contains two editable data lists:

- `PORTFOLIO_CATEGORIES` defines the three category cards, their order, numbers, cover artwork, alt text and the logo cover's presentation surface.
- `PORTFOLIO_PROJECTS` defines each artwork group, category, title, description and ordered image list.

To change a category cover, edit its `cover` path and `alt` text in `PORTFOLIO_CATEGORIES`. Keep paths relative to the site root, match filename capitalization and encode spaces as `%20`.

To add artwork, place the original image in the appropriate existing folder and add an image entry to a project in `PORTFOLIO_PROJECTS`:

```js
{
  title: "A neutral project title",
  category: "Carousels",
  description: "A short description based on the actual artwork.",
  images: [
    { src: "./carousel/new-slide-1.jpg", alt: "Descriptive artwork alt text" },
    { src: "./carousel/new-slide-2.jpg", alt: "Descriptive artwork alt text" }
  ]
}
```

Images within a project appear together in their listed order. Keep related carousel slides in one project's `images` array, ordered from the cover through the final slide. The image viewer moves through that project in order before continuing through the selected category. Carousel images are treated as square; logo image dimensions are listed in `logoDimensions` in `script.js` to reserve their natural proportions before they load.

The category gallery is one horizontal row. Visitors can scroll or swipe, drag with a mouse, use the arrow buttons, or open any image for a larger preview. The strip moves at `AUTO_SCROLL_SPEED` pixels per second near the top of `script.js` (currently 16). Hover, keyboard focus, dragging, an open artwork preview, and an off-screen gallery pause its movement. Visitors can also pause or resume it with the gallery control. Reduced-motion preferences disable automatic movement while keeping manual browsing available.

Categories are fixed to Carousels, Ad Creatives and Logos. Add new projects to one of those categories; the three category cards are intentionally kept as the only entry points.

## Edit text, colours and type

Edit page copy, experience, education and skills in `index.html`. Main colour values are CSS custom properties at the beginning of `styles.css`: `--background`, `--section`, `--surface`, `--border`, `--text`, `--secondary` and `--accent`. The Marvel typeface loads from Google Fonts; system sans-serif fallbacks are included. Responsive rules and focus states are in the same stylesheet.

## Recently added advertising artwork

The `ads static` folder contains additional ad creative images, including travel package offers and Umrah promotions. These are listed in `PORTFOLIO_PROJECTS` and included in the Ad Creatives gallery. The category cover uses `Travezy 6.jpg` from that folder. Keep the folder and filenames unchanged; the manifest paths encode spaces as `%20`.

## Contact details and CV

The contact details shown on the page are configured near the top of `script.js`:

```js
const PROFILE = {
  email: "aqr59277@gmail.com",
  phone: "03242395085",
  whatsapp: "",
  behance: "",
  linkedin: "https://www.linkedin.com/in/aqeel-umar-7ba55a418/?isSelfProfile=true",
  instagram: ""
};
```

The contact section links directly to email, phone and LinkedIn; it does not use a contact form. Update these values only when the details change. A CV PDF was not present in the project, so no download button is included; add a CV file before adding a link to it.

## Publish with GitHub Pages

1. Push the static files and artwork folders to your GitHub repository.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, select the branch and root (`/`) folder, then save.
4. Wait for GitHub Pages to publish the website.

After deployment, update the title and description in `index.html` if needed. Add an `og:url` or an absolute social preview image URL only once the final public site URL is known.
