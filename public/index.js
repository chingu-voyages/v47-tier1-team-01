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
  document.querySelector(".homepage").style.display = "block";
  //   document.querySelector(".overlay").style.display = "none";
}

//create task button (opens the create-task modal)
function openCreateTask() {
  document.querySelector(".createTaskModal").style.display = "flex";
  document.querySelector(".homepage").style.display = "none";
  //   document.querySelector(".overlay").style.display = "block";
}

// pull the data in json file
const jsonFile = "./assets/tasks-example.json";
let jsonData;

fetch(jsonFile)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    jsonData = data;
    addCategories();
  })
  .catch((e) => {
    console.log(e);
  });

// function to add the categories on the dropdown selection
function addCategories() {
  const categorySelection = document.querySelector("#category");
  jsonData.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.categoryName;
    option.innerText = category.categoryName;
    categorySelection.appendChild(option);
  });
}

// function to update the activity selection based on the chosen category
function updateActivitySelection() {
  const categorySelection = document.querySelector("#category");
  const currentCategory = categorySelection.value;
  const activitySelection = document.querySelector("#activity");

  const selectedCategory = jsonData.filter(
    (category) => category.categoryName === currentCategory
  );

  const activities = selectedCategory[0].activityTypes.map(
    (act) => act.activityName
  );

  activitySelection.innerHTML = `<option value="">Select Activity</option>`;

  activities.forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity;
    option.text = activity;

    activitySelection.append(option);
  });
}
