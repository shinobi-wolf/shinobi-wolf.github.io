(function () {
  "use strict";

  var hasGlobalClickHandler = false;

  function createPlaceholder(label) {
    var placeholder = document.createElement("div");
    placeholder.className = "thumbnail-placeholder";
    placeholder.textContent = label || "No media";
    return placeholder;
  }

  function createPrimaryImage(media) {
    var image = document.createElement("img");
    image.className = "primary-media";
    image.src = media.src || "";
    image.alt = media.alt || "Project media";
    image.loading = "lazy";
    image.addEventListener("error", function () {
      var stage = image.closest(".thumbnail-stage");
      if (stage) {
        stage.replaceChildren(createPlaceholder("Image unavailable"));
      }
    });
    return image;
  }

  function createPrimaryVideo(media) {
    var video = document.createElement("video");
    video.className = "primary-media";
    video.playsInline = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.preload = "metadata";

    if (media.poster) {
      video.poster = media.poster;
    }

    var source = document.createElement("source");
    source.src = media.src || "";
    source.type = "video/mp4";
    video.appendChild(source);

    video.addEventListener("error", function () {
      var stage = video.closest(".thumbnail-stage");
      if (stage) {
        stage.replaceChildren(createPlaceholder("Video unavailable"));
      }
    });

    return video;
  }

  function renderPrimaryMediaElement(media) {
    if (!media || !media.type) {
      return createPlaceholder("No media");
    }

    if (media.type === "video") {
      return createPrimaryVideo(media);
    }

    return createPrimaryImage(media);
  }

  function renderMediaStripThumb(media, index, active) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "media-thumb" + (active ? " is-active" : "");
    button.setAttribute("aria-label", "Show media item " + (index + 1));
    button.dataset.index = String(index);

    if (media.type === "video") {
      if (media.poster) {
        var poster = document.createElement("img");
        poster.src = media.poster;
        poster.alt = media.alt || "Video poster";
        poster.loading = "lazy";
        poster.addEventListener("error", function () {
          button.replaceChildren();
          var fallback = document.createElement("span");
          fallback.className = "media-thumb-video-label";
          fallback.textContent = "Video";
          button.appendChild(fallback);
        });
        button.appendChild(poster);
      } else {
        var text = document.createElement("span");
        text.className = "media-thumb-video-label";
        text.textContent = "Video";
        button.appendChild(text);
      }
    } else {
      var thumb = document.createElement("img");
      thumb.src = media.src || "";
      thumb.alt = media.alt || "Project image";
      thumb.loading = "lazy";
      thumb.addEventListener("error", function () {
        button.replaceChildren();
        var missing = document.createElement("span");
        missing.className = "media-thumb-video-label";
        missing.textContent = "Image";
        button.appendChild(missing);
      });
      button.appendChild(thumb);
    }

    return button;
  }

  function parseMediaItems(container) {
    if (!container || !container.dataset.mediaItems) {
      return [];
    }

    try {
      return JSON.parse(decodeURIComponent(container.dataset.mediaItems));
    } catch (error) {
      console.error("Invalid media data on project card", error);
      return [];
    }
  }

  function setActiveThumb(container, mediaIndex) {
    var thumbs = container.querySelectorAll(".media-thumb");
    thumbs.forEach(function (thumb, index) {
      thumb.classList.toggle("is-active", index === mediaIndex);
      thumb.setAttribute("aria-pressed", index === mediaIndex ? "true" : "false");
    });
  }

  function swapPrimaryMedia(container, mediaIndex) {
    var mediaItems = parseMediaItems(container);
    var stage = container.querySelector(".thumbnail-stage");

    if (!stage || !mediaItems.length || !mediaItems[mediaIndex]) {
      return;
    }

    stage.replaceChildren(renderPrimaryMediaElement(mediaItems[mediaIndex]));
    stage.dataset.currentIndex = String(mediaIndex);
    setActiveThumb(container, mediaIndex);
  }

  function onMediaStripClick(event) {
    var button = event.target.closest(".media-thumb");
    if (!button) {
      return;
    }

    var container = button.closest(".thumbnail-container");
    if (!container) {
      return;
    }

    var mediaIndex = Number(button.dataset.index);
    if (Number.isNaN(mediaIndex)) {
      return;
    }

    swapPrimaryMedia(container, mediaIndex);
  }

  function initializeMediaStrips(rootElement) {
    var root = rootElement || document;
    var containers = root.querySelectorAll(".thumbnail-container[data-media-items]");

    containers.forEach(function (container) {
      var mediaItems = parseMediaItems(container);
      if (!mediaItems.length) {
        return;
      }

      var stage = container.querySelector(".thumbnail-stage");
      if (stage && !stage.firstChild) {
        stage.appendChild(renderPrimaryMediaElement(mediaItems[0]));
      }

      var strip = container.querySelector(".media-strip");
      if (strip && !strip.hasChildNodes()) {
        mediaItems.forEach(function (media, index) {
          strip.appendChild(renderMediaStripThumb(media, index, index === 0));
        });
      }

      setActiveThumb(container, Number(stage && stage.dataset.currentIndex ? stage.dataset.currentIndex : 0));
    });

    if (!hasGlobalClickHandler) {
      document.addEventListener("click", onMediaStripClick);
      hasGlobalClickHandler = true;
    }
  }

  window.initializeMediaStrips = initializeMediaStrips;
  window.renderPrimaryMediaElement = renderPrimaryMediaElement;
  window.renderMediaStripThumb = renderMediaStripThumb;
})();
