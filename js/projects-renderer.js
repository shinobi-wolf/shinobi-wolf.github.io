(function () {
  "use strict";

  var DEFAULT_MEDIA = {
    type: "image",
    src: "images/tmp.jpg",
    alt: "Project media placeholder"
  };

  function toClassToken(value, fallback) {
    var token = String(value || fallback || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return token || String(fallback || "item");
  }

  function normalizeMediaItems(project) {
    if (!project || !Array.isArray(project.media) || !project.media.length) {
      return [DEFAULT_MEDIA];
    }

    return project.media
      .filter(function (item) {
        return item && typeof item === "object" && item.src;
      })
      .map(function (item) {
        return {
          type: item.type === "video" ? "video" : "image",
          src: item.src,
          alt: item.alt || "Project media",
          poster: item.poster || ""
        };
      });
  }

  function normalizeLinks(project) {
    if (!project || !Array.isArray(project.links)) {
      return [];
    }

    return project.links
      .filter(function (link) {
        return link && link.url && link.label;
      })
      .map(function (link) {
        return {
          label: String(link.label),
          url: String(link.url),
          type: String(link.type || "external")
        };
      });
  }

  function normalizeProject(project, index) {
    var safeProject = project && typeof project === "object" ? project : {};

    return {
      id: safeProject.id || "project-" + (index + 1),
      category: toClassToken(safeProject.category || "publication", "publication"),
      title: safeProject.title || "Untitled Project",
      description: safeProject.description || "",
      media: normalizeMediaItems(safeProject),
      links: normalizeLinks(safeProject)
    };
  }

  function createMediaContainer(mediaItems) {
    var container = document.createElement("div");
    container.className = "thumbnail-container";
    container.dataset.mediaItems = encodeURIComponent(JSON.stringify(mediaItems));

    var stage = document.createElement("div");
    stage.className = "thumbnail-stage";
    stage.dataset.currentIndex = "0";

    if (typeof window.renderPrimaryMediaElement === "function") {
      stage.appendChild(window.renderPrimaryMediaElement(mediaItems[0]));
    }

    container.appendChild(stage);

    if (mediaItems.length > 1) {
      var strip = document.createElement("div");
      strip.className = "media-strip";

      if (typeof window.renderMediaStripThumb === "function") {
        mediaItems.forEach(function (media, index) {
          strip.appendChild(window.renderMediaStripThumb(media, index, index === 0));
        });
      }

      container.appendChild(strip);
    }

    return container;
  }

  function createLinksRow(links) {
    if (!links.length) {
      return null;
    }

    var wrapper = document.createElement("div");
    wrapper.className = "project-links";

    links.forEach(function (link) {
      var anchor = document.createElement("a");
      anchor.className = "project-link project-link-" + toClassToken(link.type, "external");
      anchor.href = link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = link.label;
      wrapper.appendChild(anchor);
    });

    return wrapper;
  }

  function createProjectCard(project) {
    var card = document.createElement("article");
    card.className = "list-item " + toClassToken(project.category, "publication");
    card.dataset.category = project.category;
    card.dataset.projectId = project.id;

    var mediaContainer = createMediaContainer(project.media);
    card.appendChild(mediaContainer);

    var description = document.createElement("div");
    description.className = "project-description";

    var title = document.createElement("h3");
    title.textContent = project.title;

    var text = document.createElement("p");
    text.textContent = project.description;

    description.appendChild(title);
    description.appendChild(text);

    var linksRow = createLinksRow(project.links);
    if (linksRow) {
      description.appendChild(linksRow);
    }

    card.appendChild(description);

    return card;
  }

  function renderError(container, message) {
    container.innerHTML = "";
    var errorMessage = document.createElement("p");
    errorMessage.className = "projects-load-error";
    errorMessage.textContent = message;
    container.appendChild(errorMessage);
  }

  async function loadProjectsFromYaml(path) {
    if (!window.jsyaml || typeof window.jsyaml.load !== "function") {
      throw new Error("YAML parser is not available");
    }

    var response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load project file: " + response.status);
    }

    var yamlText = await response.text();
    var parsed = window.jsyaml.load(yamlText);

    if (!parsed || !Array.isArray(parsed.projects)) {
      throw new Error("Invalid project data format. Expected a top-level projects list.");
    }

    return parsed.projects;
  }

  async function loadAndRenderProjects() {
    var grid = document.querySelector(".grid");
    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    try {
      var rawProjects = await loadProjectsFromYaml("data/projects.yaml");
      var projects = rawProjects.map(normalizeProject);

      projects.forEach(function (project) {
        grid.appendChild(createProjectCard(project));
      });

      if (typeof window.initializeMediaStrips === "function") {
        window.initializeMediaStrips(grid);
      }

      if (typeof window.initializeIsotopeGrid === "function") {
        window.initializeIsotopeGrid(grid);
      }
    } catch (error) {
      console.error(error);
      renderError(grid, "Unable to load project data. Please verify data/projects.yaml.");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadAndRenderProjects();
  });

  window.loadAndRenderProjects = loadAndRenderProjects;
})();
