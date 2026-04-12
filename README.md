# Portfolio Content Workflow

This portfolio now renders project cards from YAML data instead of hardcoded
HTML.

## Where To Edit

- Main data file: `data/projects.yaml`
- Copy-ready template entry: `data/project-template.yaml`

You do not need to edit `index.html` to add or modify projects.

## Project Schema

Each project entry lives under the top-level `projects:` list.

Required fields:

- `id`
- `category`
- `title`
- `description`

Optional fields:

- `media` (array)
- `links` (array)

### Media Items

Each media item supports:

- `type`: `image` or `video`
- `src`: relative path to media file
- `alt`: accessibility text
- `poster`: optional image for video preview thumbnails

If you provide multiple media items, the page shows a thumbnail strip and lets
the user switch the primary media per project card.

### Link Items

Each link item supports:

- `label`: text shown in the UI
- `type`: free label such as `code`, `paper`, `demo`, `docs`
- `url`: full URL

All links are optional. A project can have zero, one, or many links.

## Add A New Project

1. Copy a block from `data/project-template.yaml`.
2. Paste it into the `projects:` list in `data/projects.yaml`.
3. Update fields and media paths.
4. Save and refresh the page.

## Local Preview

Use a local HTTP server so YAML `fetch()` works in the browser:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Notes

- Broken or missing media files are handled gracefully with a placeholder.
- Isotope filtering still works after dynamic rendering.
