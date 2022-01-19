// Bead Gallery
////////////////////////////////////////////////////////////////////

const goalImages = document.querySelectorAll(".bead-img");
const currentGoalImage = document.getElementById("goal-image");
const goalImageModal = document.getElementById("beadGallery");
const goalImageContainer = document.getElementById("beadGalleryContainer");

let goalDirectory = "loom/bl-";
let goalImageTotal = 8;

goalImages.forEach((el) =>
  el.addEventListener("click", (e) => {
    currentGoal = e.target.getAttribute("src");
    currentGoalImage.src = currentGoal;
    $(goalImageModal).modal("hide");
  })
);

function createBeadGallery() {
  // Current number of images available for the gallery
  let numOfImages = 8;
  for (let i = 0; i < goalImageTotal; i++) {
    // DOM element creation
    let parentContainer = goalImageContainer;
    let childContainer = document.createElement("div");
    let image = document.createElement("img");

    // Assigning all the classes and attributes
    childContainer.classList.add("col-md-4", "col-sm-1");
    image.classList.add("img-fluid", "mb-1", "mt-1", "braid-img");
    image.setAttribute(
      "src",
      `${isAppHomepage ? currentLocation : ""}img/${goalDirectory}${i + 1}.png`
    );

    // Appending the child to the parent container (image to gallery)
    childContainer.appendChild(image);
    parentContainer.appendChild(childContainer);

    // Add event handler to each image
    $(childContainer).on("click", (e) => {
      $(currentGoalImage).attr("src", e.target.getAttribute("src"));
      $(goalImageModal).modal("hide");
    });
  }
}

export { createBeadGallery };
