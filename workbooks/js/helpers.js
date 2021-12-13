function createLessonLinks(workbook) {
  let myself = workbook;
  let lessonCounter = 0;

  let lessonCollapse = document.createElement("DIV");
  lessonCollapse.classList.add("accordion");
  lessonCollapse.id = "workbookNav";

  document.getElementById("wb-lesson-links").appendChild(lessonCollapse);

  for (let i = 0; i < myself.sections.length; i++) {
    let sectionHeader = document.createElement("DIV");
    sectionHeader.classList.add("section-header", "d-inline-flex", "w-100");

    let sectionHeaderTitle = document.createElement("H4");
    sectionHeaderTitle.classList.add(
      "px-2",
      "py-2",
      "mb-0",
      "align-self-center"
    );
    sectionHeaderTitle.setAttribute("data-toggle", "collapse");
    sectionHeaderTitle.setAttribute("data-target", `#section-${i}`);
    sectionHeaderTitle.setAttribute("aria-expanded", "false");
    sectionHeaderTitle.setAttribute("aria-controls", `#section-${i}`);
    sectionHeaderTitle.classList.add("workbook-header");

    sectionHeaderTitle.innerHTML = `${myself.sections[i].name}`;

    lessonCollapse.appendChild(sectionHeader);
    let sectionContainer = document.createElement("DIV");
    sectionContainer.classList.add("collapse", "workbook-collapse", "shadow");
    sectionContainer.setAttribute("data-parent", "#workbookNav");
    sectionContainer.id = `section-${i}`;

    let sectionStatus = document.createElement("DIV");
    // sectionStatus.classList.add('float-right');
    // sectionStatus.innerHTML = "0%";
    sectionStatus.id = `status-${i}`;
    sectionStatus.setAttribute(
      "data-lessons",
      Object.keys(myself.sections[i].lessons).length
    );
    sectionStatus.setAttribute("role", "circularprogress");
    sectionStatus.setAttribute("aria-valuenow", "0");
    sectionStatus.setAttribute("aria-valuemin", "0");
    sectionStatus.setAttribute("aria-valuemax", "100");
    sectionStatus.setAttribute("style", "--value:0");
    sectionStatus.classList.add("workbook-subheader", "align-self-center");
    sectionHeader.appendChild(sectionStatus);
    sectionHeader.appendChild(sectionHeaderTitle);

    let chevron = document.createElement("I");
    // chevron.src = "/static/workbooks/img/chevon.svg";
    chevron.classList.add("fas", "fa-chevron-right");
    chevron.id = `chevron-${i}`;
    sectionHeader.appendChild(chevron);

    // sectionHeader.addEventListener("click", () => {
    //   sectionContainer.classList.contains("down")
    //     ? chevron.classList.remove("down")
    //     : chevron.classList.add("down");
    // });

    // document
    //   .getElementById(`section-${i}`)
    //   .addEventListener("shown.bs.collapse", () => {
    //     console.log("test");
    //   });


    // $(`#section-${i}`).bind("hidden.bs.collapse", function () {
    //   chevron.classList.remove("down");
    // });
    // if (sectionContainer.classList.contains("show"))
    //   chevron.classList.toggle("down");

    for (const property in myself.sections[i].lessons) {
      let cl = lessonCounter;
      // let title = `Lesson ${lessonCounter + 1}: ${
      //   myself.sections[i].lessons[property].title
      // }`;
      let title = `${myself.sections[i].lessons[property].title}`;
      let lessonContainer = document.createElement("DIV");

      lessonContainer.classList.add(
        "row",
        "workbook-collapse-row",
        "justify-content-center",
        "mb-3"
      );

      let leftSide = document.createElement("DIV");
      let rightSide = document.createElement("DIV");

      leftSide.classList.add("col-1", "align-self-center");
      rightSide.classList.add("col-10");

      // Add something that reads from user file to assign proper status
      let status = document.createElement("DIV");
      status.classList.add(
        "mx-auto",
        lessonCounter === myself.currentLesson ? "w-link" : "w-pending"
      );
      if (lessonCounter === myself.currentLesson) {
        // chevron.classList.add("show");
        // sectionContainer.classList.add("show");
        // sectionHeaderTitle.setAttribute("aria-expanded", true);
      }
      let lessonName = document.createElement("P");
      lessonName.classList.add("workbook-lesson");
      lessonName.innerHTML = title;

      leftSide.appendChild(status);
      rightSide.appendChild(lessonName);

      // lessonContainer.appendChild(leftSide);
      lessonContainer.appendChild(rightSide);

      lessonContainer.id = `l-${cl}`;

      lessonContainer.addEventListener("click", () => {
        myself.loadLesson(cl);
      });

      sectionContainer.appendChild(lessonContainer);
      lessonCounter++;
    }

    lessonCollapse.appendChild(sectionContainer);
  }
}
