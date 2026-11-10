// 📝 FUNCTION: Initialize navigation, logo, emergency-call, and card-interaction behavior after the document is ready.
$(document).ready(function () {
  // 👉 Cache the collapsible navigation element used by the link handlers.
  const $mainNavigation = $("#mainNavigation");
  // 👉 Cache the hamburger button so its aria-expanded state can distinguish opening from closing.
  const $navigationToggle = $(".navbar-toggler");
  // 👉 Keep the native DOM element for Bootstrap collapse event listeners.
  const navigation = $mainNavigation[0];
  // 👉 Respect the visitor's operating-system preference for reduced motion.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 👉 Find the first brand link that will receive the visual monogram and wordmark.
  const $brand = $(".navbar-brand").first();

  // Triggers during initialization when a brand exists and has not already been decorated.
  if ($brand.length && !$brand.hasClass("sj-brand-ready")) {
    // 👉 Preserve the original brand label for screen readers.
    const brandLabel = $brand.text().trim();
    // 👉 Split the brand label at its dash into the monogram and business name.
    // 📝 FUNCTION: Trim extra whitespace from each piece of the visible brand label.
    const [monogram, ...nameParts] = brandLabel.split("—").map((part) => part.trim());
    // 👉 Rejoin the remaining brand words for the visible wordmark.
    const brandName = nameParts.join(" — ");

    // 👉 Replace visible plain text with styled badge/wordmark spans while retaining the accessible label.
    $brand
      .empty()
      .attr("aria-label", brandLabel)
      .addClass("sj-brand-ready")
      .append(
        $("<span>", { class: "brand-mark", "aria-hidden": "true" }).text(monogram),
        $("<span>", { class: "brand-wordmark", "aria-hidden": "true" }).text(brandName)
      );
  }

  // 📝 FUNCTION: Scroll to a target section while accounting for the fixed navbar and reduced-motion preference.
  function scrollToTarget(target) {
    // 👉 Measure the navbar so the section heading is not obscured after scrolling.
    const navbarHeight = $(".site-nav").outerHeight() || 0;
    // 👉 Convert the target's document position into the correct scroll offset.
    const targetTop = Math.max(0, $(target).offset().top - navbarHeight);

    // 👉 Disable CSS smooth scrolling so it does not conflict with jQuery's animation.
    document.documentElement.style.scrollBehavior = "auto";
    // 👉 Stop any previous in-progress scroll before starting the new one.
    $("html, body").stop(true);
    // 👉 Jump immediately for reduced-motion users; otherwise animate the scroll.
    if (reduceMotion) {
      $(window).scrollTop(targetTop);
    } else {
      $("html, body").animate({ scrollTop: targetTop }, 550);
    }
  }

  // 📝 FUNCTION: Close the mobile menu after link activation, then scroll to the requested target.
  // Triggers when an in-page navigation link is clicked.
  function closeMenuAndScroll(target) {
    // 📝 FUNCTION: Start the target scroll once the collapse animation has finished.
    function finishScroll() {
      scrollToTarget(target);
    }

    // 📝 FUNCTION: Finish opening the menu, then close it and scroll to the selected destination.
    function closeAfterOpening() {
      // 👉 Remove the one-time opening listener to prevent stale callbacks.
      navigation.removeEventListener("shown.bs.collapse", closeAfterOpening);
      // 👉 Wait until the menu finishes closing before calculating the final scroll offset.
      navigation.addEventListener("hidden.bs.collapse", finishScroll, { once: true });
      // 👉 Ask Bootstrap to close the mobile navigation.
      bootstrap.Collapse.getOrCreateInstance(navigation).hide();
    }

    // 👉 Handle a link clicked while the Bootstrap menu is transitioning.
    if ($mainNavigation.hasClass("collapsing")) {
      // 👉 If the hamburger says the menu is opening, wait until opening finishes before closing.
      if ($navigationToggle.attr("aria-expanded") === "true") {
        navigation.addEventListener("shown.bs.collapse", closeAfterOpening, { once: true });
      } else {
        // 👉 If it is already closing, wait for the close transition before scrolling.
        navigation.addEventListener("hidden.bs.collapse", finishScroll, { once: true });
      }
    // 👉 If the mobile menu is fully open, close it before scrolling.
    } else if ($mainNavigation.hasClass("show")) {
      navigation.addEventListener("hidden.bs.collapse", finishScroll, { once: true });
      bootstrap.Collapse.getOrCreateInstance(navigation).hide();
    } else {
      // 👉 On desktop or with the menu already closed, scroll immediately.
      finishScroll();
    }
  }

  // Triggers when an in-page link is clicked; external links are not selected by this href pattern.
  // 📝 FUNCTION: Resolve and handle an in-page link click.
  $('a[href^="#"]').on("click.sjSmoothScroll", function (event) {
    // 👉 Resolve the link's fragment to its matching section element.
    const target = document.querySelector(this.getAttribute("href"));
    // 👉 Leave normal browser behavior unchanged if the fragment has no matching element.
    if (!target) return;

    // 👉 Prevent the default jump so the menu and animated scrolling can be coordinated.
    event.preventDefault();
    // 👉 Delegate menu closing and offset scrolling to the shared handler.
    closeMenuAndScroll(target);
  });

  // Triggers when the emergency service card's toggle button is clicked.
  // 📝 FUNCTION: Toggle the emergency phone number and keep its accessible state and label synchronized.
  $("#emergencyToggle").on("click.sjEmergency", function () {
    // 👉 Cache the clicked control and the associated hidden phone-number region.
    const $toggle = $(this);
    const $call = $("#emergencyCall");
    // 👉 Read the current expanded state to determine whether to show or hide the number.
    const isExpanded = $toggle.attr("aria-expanded") === "true";

    // 👉 Keep the accessible expanded state synchronized with the phone reveal.
    $toggle.attr("aria-expanded", String(!isExpanded));
    // 👉 Update the call-to-action copy to reflect the next available action.
    $("#emergencyAction").text(isExpanded ? "Tap to reveal our number" : "Tap to hide our number");
    // 👉 Stop queued animations so repeated taps do not leave the reveal in an inconsistent state.
    $call.stop(true, true);

    // 👉 Slide the number away when it is already expanded.
    if (isExpanded) {
      // 📝 FUNCTION: Hide the call region from layout and accessibility after the slide animation.
      $call.slideUp(250, function () {
        // 👉 Restore Bootstrap's hidden class after the slide animation finishes.
        $call.addClass("d-none");
      });
    } else {
      // 👉 Remove the hidden class, then animate the phone link into view.
      $call.removeClass("d-none").hide().slideDown(250);
    }
  });

  // Triggers on desktop pointer entry to give service cards a small lift and deeper shadow.
  $(".service-card")
    // 📝 FUNCTION: Apply the raised hover state when a desktop pointer enters a service card.
    .on("mouseenter.sjCard", function () {
      // 👉 Lift the hovered card and increase its shadow.
      $(this).css({
        transform: "translateY(-5px)",
        boxShadow: "0 18px 42px rgba(0, 0, 0, .36)"
      });
    })
    // 📝 FUNCTION: Restore the card's stylesheet appearance when the pointer leaves.
    // Triggers when the pointer leaves a card; restore its stylesheet-defined appearance.
    .on("mouseleave.sjCard", function () {
      $(this).css({ transform: "", boxShadow: "" });
    })
    // 📝 FUNCTION: Apply a brief warm highlight when a touch begins on a service card.
    // Triggers when a touch begins on a card; apply temporary mobile tap feedback.
    .on("touchstart.sjCard", function () {
      // 👉 Cache the touched card and cancel any pending highlight reset.
      const $card = $(this);
      clearTimeout($card.data("touchHighlightTimer"));
      // 👉 Apply a warm highlight, subtle shadow, and slight lift while the card is touched.
      $card.css({
        backgroundColor: "#2b251f",
        boxShadow: "0 14px 36px rgba(0, 0, 0, .3)",
        transform: "translateY(-2px)"
      });
    })
    // 📝 FUNCTION: Remove the temporary touch highlight after a touch ends or is cancelled.
    // Triggers when a touch ends or is cancelled; restore the normal card styles shortly after.
    .on("touchend.sjCard touchcancel.sjCard", function () {
      // 👉 Cache the card so the delayed reset can restore its inline styles.
      const $card = $(this);
      // 👉 Delay reset briefly so the tap feedback remains visible to the user.
      // 📝 FUNCTION: Clear the temporary touch styling after its brief highlight period.
      const timer = setTimeout(function () {
        $card.css({ backgroundColor: "", boxShadow: "", transform: "" });
      }, 160);
      // 👉 Save the timer so another touch can cancel it before it fires.
      $card.data("touchHighlightTimer", timer);
    });
});
