console.log("hello world");

function showDiv(divId) {
  // Hide all divs
  document.querySelector("#date").style.display = "none";
  document.querySelector("#repeat-options").style.display = "none";

  // Show the selected div
  document.getElementById(divId).style.display = "block";
}

// modal functionalities
function closeModal() {
  document.querySelector(".createTaskModal").style.display = "none";
  document.querySelector(".homepage").style.display = "flex";
  //   document.querySelector(".overlay").style.display = "none";
}

//create task button (opens the create-task modal)
function openCreateTask() {
  document.querySelector(".createTaskModal").style.display = "flex";
  document.querySelector(".homepage").style.display = "none";
  //   document.querySelector(".overlay").style.display = "block";
}
