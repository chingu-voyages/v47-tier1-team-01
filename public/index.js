function showDiv(divId) {
  // Hide all divs
  document.querySelector("#date").style.display = "none";
  document.querySelector("#repeat-options").style.display = "none";


    // Show the selected div
    document.getElementById(divId).style.display = 'block';
}

submit.addEventListener('click', saveTask)

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
const submit = document.querySelector('button[type=submit]')



function getRepeatDays() {
    let daysArray = [];
    [...repeatOptions.children].forEach(day => {
        if (day.firstElementChild.checked) daysArray.push(day.firstElementChild.value)
    });
    return daysArray
}

function saveTask(e) {
    e.preventDefault()

    const object = {
        id: new Date().getTime(),
        taskName: taskName.value,
        description: description.value,
        category: categoryText,
        activity: activityText,
        priority: priority.checked
    }
    if (dueDate.checked) {
        object.deadline = date.value;
    } else if (repeat.checked) {
        object.deadline = getRepeatDays()
    }
    existingTasks.push(object);
    localStorage.setItem("tasks", JSON.stringify(existingTasks));
}

//retrieves a task and updates it. Not yet in use
function getTaskById(taskId) {
    const foundTask = existingTasks.find(task => task.id === taskId);
    return foundTask;
}


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

