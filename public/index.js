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



//Add new task START

const form = document.querySelector('form')
const taskName = document.querySelector('#task-name')
const description = document.querySelector('#description')
const category = document.querySelector('#category')
const categoryText = category.options[category.selectedIndex].text
const activity = document.querySelector('#activity')
const activityText = activity.options[activity.selectedIndex].text
const dueDate = document.querySelector('#due-date')
const date = document.querySelector('#date')
const repeat = document.querySelector('#repeat')
const repeatOptions = document.querySelector('#repeat-options')
const priority = document.querySelector('#switch')
const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
const submit = document.querySelector('#save-task')

submit.addEventListener('click', saveTask)
console.log(submit)
console.log(localStorage.tasks)



function saveTask(e) {
  e.preventDefault()
  const category = document.querySelector('#category')
  const categoryText = category.options[category.selectedIndex].text
  const activity = document.querySelector('#activity')
  const activityText = activity.options[activity.selectedIndex].text
  const object = {
    id: new Date().getTime(),
    taskName: taskName.value,
    description: description.value,
    category: categoryText,
    activity: activityText,
    priority: priority.checked
  }
  if (dueDate.checked) {
    object.deadline = date.value.split('-').reverse().join('/');
  } else if (repeat.checked) {
    object.deadline = getRepeatDays()
  }
  existingTasks.push(object);
  localStorage.setItem("tasks", JSON.stringify(existingTasks));
  console.log(object)
  form.reset();
  closeModal();
  populateTasks()
}

function getRepeatDays() {
  let daysArray = [];
  [...repeatOptions.children].forEach(day => {
    if (day.firstElementChild.checked) daysArray.push(day.firstElementChild.id)
  });
  return daysArray
}

//retrieves a task and updates it. Not yet in use
function getTaskById(taskId) {
  const foundTask = existingTasks.find(task => task.id === taskId);
  return foundTask;
}
//Add new task END



//dinamically display tasks START

function getTasksFromLocalStorage() {
  const tasksJson = localStorage.getItem('tasks');
  return tasksJson ? JSON.parse(tasksJson) : [];
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.classList.add('results__container');

  const para = document.createElement('p');
  para.classList.add('results__result');
  para.textContent = JSON.stringify(task);

  div.appendChild(para);
  return div;
}


function populateTasks() {
  const tasks = getTasksFromLocalStorage();
  const resultsContainer = document.querySelector('.results');

  tasks.forEach(task => {
    const taskElement = createTaskElement(task);
    resultsContainer.appendChild(taskElement);
  });

  if (tasks.length === 0) {
    const noTasksPara = document.createElement('p');
    noTasksPara.textContent = 'No tasks at this time';
    resultsContainer.appendChild(noTasksPara);
  }
}
populateTasks()



//check functionality...a bit faulty...
//check with no tasks 


console.log(getTasksFromLocalStorage());

//dinamically display tasks END