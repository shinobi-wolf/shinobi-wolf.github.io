(function () {
  "use strict";

  var gridInstance = null;

  function syncFilterButtons(activeFilter) {
    var buttons = document.getElementsByClassName("button");
    for (var i = 0; i < buttons.length; i += 1) {
      var button = buttons[i];
      if (button.getAttribute("data-filter") === activeFilter) {
        button.classList.add("is-checked");
      } else {
        button.classList.remove("is-checked");
      }
    }
  }

  function bindFilterHandlers($) {
    var filters = $("#filters");
    if (filters.length) {
      filters.off("click.portfolioFilter").on("click.portfolioFilter", "button", function () {
        var filterValue = $(this).attr("data-filter") || ".publication";
        window.localStorage.setItem("filterValue", filterValue);

        if (gridInstance) {
          gridInstance.isotope({ filter: filterValue });
        }

        syncFilterButtons(filterValue);
      });
    }

    $(".button-group").each(function (_, buttonGroup) {
      var group = $(buttonGroup);
      group.off("click.portfolioCheck").on("click.portfolioCheck", "button", function () {
        group.find(".is-checked").removeClass("is-checked");
        $(this).addClass("is-checked");
      });
    });
  }

  function initializeIsotopeGrid(gridElement) {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.isotope) {
      return null;
    }

    var $ = window.jQuery;
    var $grid = $(gridElement || ".grid");
    if (!$grid.length) {
      return null;
    }

    if (gridInstance) {
      try {
        gridInstance.isotope("destroy");
      } catch (error) {
        console.warn("Could not destroy previous Isotope instance", error);
      }
    }

    gridInstance = $grid.isotope({
      itemSelector: ".list-item",
      layoutMode: "fitRows",
      transitionDuration: 0,
      stagger: 10,
      initLayout: false
    });

    var initialFilter = window.localStorage.getItem("filterValue") || ".publication";
    gridInstance.isotope({ filter: initialFilter });
    syncFilterButtons(initialFilter);
    bindFilterHandlers($);

    return gridInstance;
  }

  window.initializeIsotopeGrid = initializeIsotopeGrid;
})();
