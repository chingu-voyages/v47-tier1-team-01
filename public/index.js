// Show the selected deadline mode
function showDiv(divId) {
  document.getElementById(divId).style.display = "flex";
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

// pull the data in json file
const jsonFile = "./assets/tasks-example.json";
let jsonData;

fetch(jsonFile)
  .then((res) => res.json())
  .then((data) => {
    // console.log(data);
    jsonData = data;
    addCategories();
  })
  .catch((e) => {
    console.log(e);
  });

// function to add the categories on the dropdown selection
// TO DO: rewrite the logic so that
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

  activitySelection.innerHTML = `<option disabled selected>Select Activity</option>`;

  activities.forEach((activity) => {
    const option = document.createElement("option");
    option.value = activity;
    option.text = activity;

    activitySelection.append(option);
  });
}

//Add new task START
const form = document.querySelector("form");
const taskNameEl = document.querySelector("#task-name");
const descriptionEl = document.querySelector("#description");
const dueDate = document.querySelector("#due-date");
const date = document.querySelector("#date");
const repeat = document.querySelector("#repeat");
const repeatOptions = document.querySelector("#repeat-options");
const priority = document.querySelector("#switch");
const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
const submit = document.querySelector("#save-task");

// create task button element
const createTaskBtn = document.querySelector("#createBtn");

// feedback container
const taskFb = document.querySelector(".new-task");
const updateFb = document.querySelector(".update-task");

submit.addEventListener("click", saveTask);
// console.log(localStorage.tasks)

function saveTask(e) {
  e.preventDefault();
  const category = document.querySelector("#category");
  const categoryText = category.options[category.selectedIndex].text;
  const activity = document.querySelector("#activity");
  const activityText = activity.options[activity.selectedIndex].text;

  //Form Validation
  const formHasError = formValidation();
  if (formHasError) return;

  const object = {
    id: new Date().getTime(),
    taskName: DOMPurify.sanitize(taskNameEl.value),
    taskDescription: DOMPurify.sanitize(descriptionEl.value),
    category: categoryText,
    activity: activityText,
    priority: priority.checked,
  };
  if (dueDate.checked) {
    object.deadline = date.value.split("-").reverse().join("/");
  } else if (repeat.checked) {
    object.deadline = getRepeatDays();
  }
  existingTasks.push(object);
  localStorage.setItem("tasks", JSON.stringify(existingTasks));
  console.log(object);
  form.reset();
  populateTasks();
  closeModal();
  activity.innerHTML = `<option disabled selected>Select Activity</option>`;

  document.querySelector("#date").style.display = "none";
  document.querySelector("#repeat-options").style.display = "none";

  showFeedback("save");
}

function getRepeatDays() {
  let daysArray = [];
  [...repeatOptions.children].forEach((day) => {
    if (day.firstElementChild.checked) daysArray.push(day.firstElementChild.id);
  });
  return daysArray;
}

//retrieves a task and updates it. Not yet in use
function getTaskById(taskId) {
  const foundTask = existingTasks.find((task) => task.id === taskId);
  return foundTask;
}
//Add new task END

//dinamically display tasks START

function getTasksFromLocalStorage() {
  const tasksJson = localStorage.getItem("tasks");
  return tasksJson ? JSON.parse(tasksJson) : [];
}

function createTaskElement(task) {
  // console.log(task, 'test')
  const div = `
  <div class="task__container">
    <div class="task__container-top">
      <div class="task__name">
        <input type="checkbox" name="" id="mockID" />
        <label for="mockID">${task.taskName}</label>
      </div>
      <div>
        <i class="fa-solid fa-angle-down" id="show-btn" onclick="showButton(event)"></i>
      </div>
    </div>
    <div class="task__container-mid">
      <div class="task__description">
        ${task.description || task.taskDescription}
      </div>
      <div class="task__settings">
        <button id="edit-task-btn" onclick="editTask(${
          task.id
        })">Edit Task <i class="fas fa-edit"></i></button>
        <button id="del-task-btn">Delete Task <i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
    <div class="task__container-bot">
        ${
          task.category === "Select Category"
            ? ""
            : ` <span class="legend--category">${task.category}</span>`
        }
        ${
          task.activity === "Select Activity"
            ? ""
            : `<span class="legend--activity">${task.activity}</span>`
        }
        ${
          task.priority ? `<span class="legend--priority">Important</span>` : ""
        }
    </div>
  </div>
  `;

  return div;
}

function populateTasks() {
  const tasks = getTasksFromLocalStorage();

  const taskContainer = document.querySelector(".homepage__task");

  //makes sure tasks are not duplicated since this function is called both on page load and when SAVE button is clicked
  while (taskContainer.firstChild) {
    taskContainer.removeChild(taskContainer.firstChild);
  }

  if (tasks.length === 0) {
    const noTasksPara = document.createElement("p");
    noTasksPara.textContent = "No tasks at this time";
    taskContainer.appendChild(noTasksPara);
  } else {
    tasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      taskContainer.innerHTML += taskElement;
    });
  }
}

populateTasks();

// console.log(getTasksFromLocalStorage())

//dinamically display tasks END

//Task name and description validation function
function formValidation() {
  let formHasError = false;
  const taskName = DOMPurify.sanitize(taskNameEl.value);
  const taskNameErrorEl = taskNameEl.nextElementSibling; //might need to change this to select it independently from the DOM
  taskNameErrorEl.style.visibility = "hidden";
  const taskDescription = DOMPurify.sanitize(descriptionEl.value);
  const taskDescriptionErrorEl = descriptionEl.nextElementSibling;
  taskDescriptionErrorEl.style.visibility = "hidden";

  if (taskName.trim() === "") {
    taskNameErrorEl.textContent = "Task Name cannot be empty";
    taskNameErrorEl.style.visibility = "visible";
    formHasError = true;
  } else if (taskName.trim().length > 40) {
    taskNameErrorEl.textContent = "Task Name must be under 40 characters";
    taskNameErrorEl.style.visibility = "visible";
    formHasError = true;
  }

  if (taskDescription.trim().length > 100) {
    taskDescriptionErrorEl.textContent =
      "Description must be under 100 characters";
    taskDescriptionErrorEl.style.visibility = "visible";
    formHasError = true;
  }
  return formHasError;
}

// function for show button on task-card
function showButton(e) {
  const button = e.currentTarget;
  const currentContainerEl = button.closest(".task__container");
  const midContainerEl = currentContainerEl.querySelector(
    ".task__container-mid"
  );

  midContainerEl.classList.toggle("show");
  button.classList.toggle("fa-angle-down");
  button.classList.toggle("fa-angle-up");
}

// Task edit functionality - Jimmy
const editTaskModalEl = document.querySelector(".editTaskModal");
//These arrays, I think should be added to the localStorage, and can be adjusted when the user add more or remove them.
const categoriesArr = [
  "Select Category",
  "ROUTINE ACTIVITIES",
  "STUDYING",
  "DAILY TASKS PROJECT",
  "CHINGU",
];

const daysOfTheWeekArr = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function editTask(taskId) {
  editTaskModalEl.style.display = "block";
  createTaskBtn.style.display = "none";

  const tasks = getTasksFromLocalStorage();
  const taskObj = tasks.find((task) => task.id === taskId);

  let categoryOptionsContent = "";
  categoriesArr.forEach((category) => {
    categoryOptionsContent += `
  <option ${category === "Select Category" ? "disabled" : ""} ${
      category === taskObj.category ? "selected" : ""
    }>${category}</option>
  `;
  });

  let activityOptionsContent = "";
  if (
    taskObj.category === "Select Category" ||
    taskObj.activity === "Select Activity"
  ) {
    activityOptionsContent = `<option disabled selected>Select Activity</option>`;
  } else {
    const availableActivityOptions = jsonData
      .find((categoryObj) => categoryObj.categoryName === taskObj.category)
      .activityTypes.map((activityType) => activityType.activityName);

    availableActivityOptions.forEach((activity) => {
      activityOptionsContent += `<option ${
        activity === taskObj.activity ? "selected" : ""
      }>${activity}</option>`;
    });
  }

  let repeatOptionsContent = "";
  daysOfTheWeekArr.forEach((day) => {
    repeatOptionsContent += `<label for=${day} class="hidden__checkbox">
  <input
    type="checkbox"
    id=${day}
    name=${day}
    class="hidden__main-checkbox"
    ${taskObj.deadline?.includes(day) ? "checked" : ""}
  />
  <div class="hidden__custom-checkbox"></div>
  ${day}
</label>`;
  });

  const editTaskModalContent = `
  <form id='editForm' class='editForm' onsubmit="updateTask(event,${taskId})">
  <label for="task-name"
    >Task Name<input
    name='taskName'
      type="text"
      id="task-name"
      placeholder="Enter Task Name..."
      value="${taskObj.taskName}"
    /><span class="error">Error Message</span>
  </label>
  <label for="description"
    >Description
    <input
      id="description"
      name='taskDescription'
      type="text"
      placeholder="Enter Description..."
      value="${taskObj.taskDescription ? taskObj.taskDescription : ""}"
    />
    <span class="error">Error Message</span>
  </label>
  <label for="category"
    >Select category
    <div class="select__container">
      <select
        id="category"
        name="category"
        class="selection"
        onchange="updateActivitySelection()"
      >
        ${categoryOptionsContent}
      </select>
      <div class="select__icon-container">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  </label>
  <label for="activity"
    >Select Activity Type
    <div class="select__container">
      <select id="activity" class="selection" name="activity"
      >
        ${activityOptionsContent}
      </select>
      <div class="select__icon-container">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  </label>

  <label class="frequency" for="due-date">
    <div class="custom-radio-btn">
      <input
        onclick="showDiv('date')"
        type="radio"
        name="recurrency"
        id="due-date"
        value='dueDate'

      />
      <span class="radio-checker"></span>
    </div>
    Due Date</label
  >
  <input type="date" id="date" class="hidden" name='date' />

  <label class="frequency" for="repeat">
    <div class="custom-radio-btn">
      <input
        onclick="showDiv('repeat-options')"
        type="radio"
        name="recurrency"
        id="repeat"
        value='repeat'
      />
      <span class="radio-checker"></span>
    </div>
    Repeat
  </label>
  <div class="hidden" id="repeat-options">
    ${repeatOptionsContent}
  </div>
  <div class="flex">
    <input type="checkbox" id="switch" name='priority' ${
      taskObj.priority ? "checked" : ""
    }/>
    <label for="switch" id="toggle" class="block">Priority </label>
    <label for="switch">Priority</label>
  </div>
  <button  class="btn-update" type="submit" >Update</button>
  <button  class="btn-cancel" type="button" onclick="cancelEditTask()" >Cancel</button>

</form>
`;

  editTaskModalEl.innerHTML = editTaskModalContent;
}

function updateTask(event, taskId) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const tasks = getTasksFromLocalStorage();

  const newTask = {
    id: taskId,
    taskName: DOMPurify.sanitize(formData.get("taskName")),
    taskDescription: DOMPurify.sanitize(formData.get("taskDescription")),
    category: formData.get("category"),
    activity: formData.get("activity"),
    priority: formData.get("priority") ? true : false,
    deadline: "",
  };

  if (formData.get("recurrency") === "dueDate") {
    newTask.deadline = formData.get("date");
  } else if (formData.get("recurrency") === "repeat") {
    let selectedDays = [];
    daysOfTheWeekArr.map((day) => {
      if (formData.get(day)) {
        selectedDays.push(day);
      }
    });
    newTask.deadline = selectedDays;
  }

  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  tasks[taskIndex] = newTask;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  editTaskModalEl.innerHTML = "";
  editTaskModalEl.style.display = "none";
  populateTasks();
  createTaskBtn.style.display = "flex";
  showFeedback("edit");
}

function cancelEditTask() {
  editTaskModalEl.innerHTML = "";
  editTaskModalEl.style.display = "none";
  createTaskBtn.style.display = "flex";
}

// Task edit functionality end - Jimmy

// show feedback function
function showFeedback(mode) {
  if (mode === "save") {
    taskFb.style.display = "flex";
    setTimeout(() => {
      taskFb.style.display = "none";
    }, 3000);
  } else {
    updateFb.style.display = "flex";
    setTimeout(() => {
      updateFb.style.display = "none";
    }, 3000);
  }
}
