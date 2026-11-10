// 📝 FUNCTION: Initialize AJAX submission of the booking form after jQuery and the page are ready.
$(document).ready(function () {
  // Cache the form, confirmation message, and submit button for the handlers below.
  const $bookingForm = $("#bookingForm");
  const $bookingSuccess = $("#bookingSuccess");
  const $submitButton = $bookingForm.find('[type="submit"]');

  // Triggers when the visitor attempts to submit the booking form.
  // 📝 FUNCTION: Validate and submit the booking form without navigating away.
  $bookingForm.on("submit", function (event) {
    // Keep the browser on this page and validate required fields before sending.
    event.preventDefault();
    // 👉 Let the browser display its normal required-field messages and skip invalid submissions.
    if (!this.reportValidity()) return;

    // Prevent duplicate submissions while Formspree is processing the request.
    // 👉 Disable the submit control until the request succeeds or fails.
    $submitButton.prop("disabled", true);
    // 👉 Expose the pending state to assistive technology.
    $bookingForm.attr("aria-busy", "true");

    // ← REPLACE WITH YOUR FORMSPREE LINK
    // Send all named form fields to the configured Formspree endpoint as an AJAX request.
    $.ajax({
      // 👉 Read the configured Formspree destination from the form's action attribute.
      url: $bookingForm.attr("action"),
      // 👉 Use the form's configured HTTP method (POST).
      method: $bookingForm.attr("method"),
      // 👉 Serialize every named form field into request data.
      data: $bookingForm.serialize(),
      // 👉 Request a JSON response so Formspree success/error can be handled by jQuery.
      dataType: "json",
      // 👉 Ask Formspree to return its JSON response format.
      headers: { Accept: "application/json" }
    })
      // Triggers when Formspree accepts the booking submission.
      // 📝 FUNCTION: Hide the submitted form and reveal the existing success message.
      .done(function () {
        // On success, replace the form with its existing confirmation message.
        // 👉 Fade out the form before revealing the existing confirmation.
        // 📝 FUNCTION: Hide the form after its fade-out animation completes.
        $bookingForm.stop(true, true).fadeOut(200, function () {
          // 👉 Keep the submitted form hidden after its fade completes.
          $bookingForm.addClass("d-none");
          // 👉 Reveal the confirmation and move keyboard focus to it.
          // 📝 FUNCTION: Move keyboard focus to the success message after it has faded in.
          $bookingSuccess.removeClass("d-none").hide().fadeIn(350, function () {
            $bookingSuccess.trigger("focus");
          });
        });
      })
      // Triggers when the network request fails or Formspree reports an error.
      // 📝 FUNCTION: Restore the submit control and alert the visitor after a failed request.
      .fail(function () {
        // On failure, let the user retry and explain that the request was not sent.
        // 👉 Re-enable the submit button so the visitor can try again.
        $submitButton.prop("disabled", false);
        // 👉 Clear the pending indicator after the failed request.
        $bookingForm.removeAttr("aria-busy");
        // 👉 Explain the failure without removing or replacing the user's entered values.
        window.alert("Sorry, we couldn't send your booking just now. Please try again in a moment.");
      });
  });
});
