// pull the data in json file
const jsonFile = './public/assets/tasks-example.json'
let jsonData

fetch(jsonFile)
  .then((res) => res.json())
  .then((data) => {
    jsonData = data
  })
  .catch((e) => {
    console.log(e)
  })

const categoriesArr = [
  'Select Category',
  'ROUTINE ACTIVITIES',
  'STUDYING',
  'DAILY TASKS PROJECT',
  'CHINGU'
]

const daysOfTheWeekArr = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
const daysOfTheWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthsArr = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const numOfRepeatedWeeks = 4

let defaultRepeatOptionsContent = ''
daysOfTheWeekArr.forEach((day) => {
  defaultRepeatOptionsContent += `
        <label for=${day} class="hidden__checkbox">
          <input
            type="checkbox"
            id=${day}
            name=${day}
            class="hidden__main-checkbox"
           />
          <div class="hidden__custom-checkbox"></div>
          ${day}
        </label>`
})

let selectedDay = new Date()

//Add new task START
const formEl = document.querySelector('form')
const formModalEl = document.querySelector('.formModal')
const taskNameEl = document.querySelector('#task-name')
const taskNameErrorEl = taskNameEl.nextElementSibling
const descriptionEl = document.querySelector('#description')
const taskDescriptionErrorEl = descriptionEl.nextElementSibling

const categoryEl = document.querySelector('#category')
const activityEl = document.querySelector('#activity')
const dueDateEl = document.querySelector('#due-date')
const dateEl = document.querySelector('#date')
const repeatEl = document.querySelector('#repeat')
const repeatOptionsEl = document.querySelector('#repeat-options')
const dueDateErrorEl = dateEl.nextElementSibling
const repeatOptionsErrorEl = repeatOptionsEl.nextElementSibling
const priorityEl = document.querySelector('#switch')

const submitBtn = document.querySelector('#submit-task')
const cancelBtn = document.querySelector('#cancel-btn')
const taskIdInputEl = document.querySelector('#taskId')

const todoSummaryEl = document.querySelector('#todo-tasks__summary')
const doneTaskSummaryEl = document.querySelector('#done-tasks__summary')

function submitHandler(event) {
  event.preventDefault()
  const formHasError = formValidation()
  if (formHasError) return

  const taskObj = {
    id: taskIdInputEl.value
      ? taskIdInputEl.value
      : new Date().getTime().toString(),
    taskName: DOMPurify.sanitize(taskNameEl.value),
    taskDescription: DOMPurify.sanitize(descriptionEl.value),
    category: categoryEl.value,
    activity: activityEl.value,
    priority: priorityEl.checked
  }

  const existingTasks = getTasksFromLocalStorage()

  if (dueDateEl.checked) {
    taskObj.dueDates = [dateEl.value]
    taskObj.isCompleted = false
  } else if (repeatEl.checked) {
    taskObj.selectedDaysIndex = getRepeatDays()
    taskObj.dueDates = generateActualDates(taskObj.selectedDaysIndex)
    taskObj.completedDates = []
  }

  if (submitBtn.textContent === 'Save Task') {
    saveTask(taskObj, existingTasks)
  } else if (submitBtn.textContent === 'Update Task') {
    updateTask(taskObj, existingTasks)
  }

  localStorage.setItem('tasks', JSON.stringify(existingTasks))
  renderDesktopCalendar()
  formEl.reset()
  populateTasks(selectedDay)
  closeModal()
  renderSummary(selectedDay)
}

// create task button element
const createTaskBtn = document.querySelector('#createBtn')

// feedback container
const taskFb = document.querySelector('.new-task')
const updateFb = document.querySelector('.update-task')

function saveTask(taskObj, existingTasks) {
  existingTasks.push(taskObj)
  document.querySelector('#date').style.display = 'none'
  document.querySelector('#repeat-options').style.display = 'none'
  showFeedback('save')
}

function updateTask(taskObj, existingTasks) {
  const taskIndex = existingTasks.findIndex((task) => {
    return task.id === taskObj.id
  })
  existingTasks[taskIndex] = taskObj
  createTaskBtn.style.display = 'flex'
  showFeedback('edit')
}

function deleteTask(id) {
  const tasks = getTasksFromLocalStorage()
  const updatedTasks = tasks.filter((task) => task.id !== id)
  localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  populateTasks(selectedDay)
  renderDesktopCalendar()
  renderSummary(selectedDay)
}

function getRepeatDays() {
  let daysArray = []
  ;[...repeatOptionsEl.children].forEach((day) => {
    if (day.firstElementChild.checked) daysArray.push(day.firstElementChild.id)
  })
  const selectedDaysIndex = daysArray.map((day) =>
    daysOfTheWeekArr.indexOf(day)
  )
  return selectedDaysIndex
}

//retrieves a task and updates it. Not yet in use
function getTaskById(taskId) {
  const foundTask = existingTasks.find((task) => task.id === taskId)
  return foundTask
}
//Add new task END

function toggleDueDateAndRepeat(event) {
  if (event.target.id === 'due-date') {
    repeatOptionsErrorEl.classList.add('hidden')
    dateEl.style.display = 'block'
    repeatOptionsEl.innerHTML = defaultRepeatOptionsContent
    repeatOptionsEl.style.display = 'none'
  } else if (event.target.id === 'repeat') {
    dueDateErrorEl.classList.add('hidden')
    repeatOptionsEl.style.display = 'flex'
    dateEl.value = ''
    dateEl.style.display = 'none'
  }
}

// modal functionalities
function closeModal() {
  formEl.reset()
  dateEl.style.display = 'none'
  repeatOptionsEl.style.display = 'none'
  dueDateErrorEl.classList.add('hidden')
  repeatOptionsErrorEl.classList.add('hidden')
  formModalEl.style.display = 'none'
  document.querySelector('.homepage').classList.toggle('display')
  document.querySelector('.overlay').style.display = 'none'
}

//Dynamically render the form modal based on mode
function openForm(mode, taskId) {
  formModalEl.style.display = 'flex'
  document.querySelector('.homepage').classList.toggle('display')
  document.querySelector('.overlay').style.display = 'block'

  if (mode === 'create') {
    categoryEl.innerHTML = '<option disabled selected>Select Category</option>'
    addCategories()
    activityEl.innerHTML = '<option disabled selected>Select Activity</option>'
    repeatOptionsEl.innerHTML = defaultRepeatOptionsContent
    submitBtn.textContent = 'Save Task'
  }

  if (mode === 'edit') {
    taskIdInputEl.value = taskId
    const tasks = getTasksFromLocalStorage()
    const taskObj = tasks.find((task) => task.id === taskId)
    taskNameEl.value = taskObj.taskName
    descriptionEl.value = taskObj.taskDescription

    //Render category
    let categoryOptionsContent = ''
    categoriesArr.forEach((category) => {
      categoryOptionsContent += `

        <option ${category === 'Select Category' ? 'disabled' : ''} ${
        category === taskObj.category ? 'selected' : ''
      }>${category}</option>`
    })
    categoryEl.innerHTML = categoryOptionsContent

    //Render activity
    let activityOptionsContent = `<option disabled selected>Select Activity</option>`
    if (taskObj.category !== 'Select Category') {
      const availableActivityOptions = jsonData
        .find((categoryObj) => categoryObj.categoryName === taskObj.category)
        .activityTypes.map((activityType) => activityType.activityName)

      availableActivityOptions.forEach((activity) => {
        activityOptionsContent += `<option ${
          activity === taskObj.activity ? 'selected' : ''
        }>${activity}</option>`
      })
    }
    activityEl.innerHTML = activityOptionsContent

    //Render selected days
    if (!taskObj.selectedDaysIndex) {
      dueDateEl.checked = true
      dateEl.value = taskObj.dueDates[0]
      dateEl.style.display = 'block'
      repeatOptionsEl.innerHTML = defaultRepeatOptionsContent
    } else {
      repeatEl.checked = true
      repeatOptionsEl.style.display = 'flex'
      let repeatOptionsContent = ''
      daysOfTheWeekArr.forEach((day, index) => {
        repeatOptionsContent += `
        <label for=${day} class="hidden__checkbox">
          <input
            type="checkbox"
            id=${day}
            name=${day}
            class="hidden__main-checkbox"
            ${taskObj.selectedDaysIndex?.includes(index) ? 'checked' : ''}/>
          <div class="hidden__custom-checkbox"></div>
          ${day}
        </label>`
      })

      repeatOptionsEl.innerHTML = repeatOptionsContent
    }

    //Render priority
    priorityEl.checked = taskObj.priority

    submitBtn.textContent = 'Update Task'
    cancelBtn.style.display = 'block'
  }
}

// function to add the categories on the dropdown selection
function addCategories() {
  const categorySelection = document.querySelector('#category')
  jsonData.forEach((category) => {
    const option = document.createElement('option')
    option.value = category.categoryName
    option.innerText = category.categoryName
    categorySelection.appendChild(option)
  })
}

// function to update the activity selection based on the chosen category
function updateActivitySelection() {
  const categorySelection = document.querySelector('#category')
  const currentCategory = categorySelection.value
  const activitySelection = document.querySelector('#activity')

  const selectedCategory = jsonData.filter(
    (category) => category.categoryName === currentCategory
  )

  const activities = selectedCategory[0].activityTypes.map(
    (act) => act.activityName
  )

  activitySelection.innerHTML = `<option disabled selected>Select Activity</option>`

  activities.forEach((activity) => {
    const option = document.createElement('option')
    option.value = activity
    option.text = activity

    activitySelection.append(option)
  })
}

//dinamically display tasks START
function getTasksFromLocalStorage() {
  const tasksJson = localStorage.getItem('tasks')
  return tasksJson ? JSON.parse(tasksJson) : []
}

function createTaskElement(task, date) {
  let completed = false
  if (task.selectedDaysIndex) {
    if (task.completedDates.includes(date)) {
      completed = true
    } else {
      completed = false
    }
  } else {
    completed = task.isCompleted
  }
  const div = `
  <div class="task__container">
    <div class="task__container-top">
      <div class="task__name">
        <button class="task-checkbox ${
          completed ? 'checked' : ''
        }" onclick="toggleCompleted(${task.id}, '${date}')"></button>
        <label class="task-name ${completed ? 'checked' : ''}" for="mockID">${
    task.taskName
  }</label>
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
        <button id="edit-task-btn" onclick="openForm('edit','${
          task.id
        }')">Edit Task <i class="fas fa-edit"></i></button>
        <button id="del-task-btn" onclick="deleteTask('${
          task.id
        }')">Delete Task <i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
    <div class="task__container-bot">

        ${
          task.category === 'Select Category'
            ? ''
            : ` <span class="legend--category">${task.category}</span>`
        }
        ${
          task.activity === 'Select Activity'
            ? ''
            : `<span class="legend--activity">${task.activity}</span>`
        }
        ${
          task.priority ? `<span class="legend--priority">Important</span>` : ''
        }

    </div>
  </div>
  `

  return div
}

function populateTasks(selectedDay) {
  // gets the task that has a due on the selected day
  const tasks = getTasksFromLocalStorage().filter((task) =>
    task.dueDates.includes(getSimpleDate(selectedDay))
  )

  const taskContainer = document.querySelector('.homepage__task')

  //makes sure tasks are not duplicated since this function is called both on page load and when SAVE button is clicked
  while (taskContainer.firstChild) {
    taskContainer.removeChild(taskContainer.firstChild)
  }

  if (tasks.length === 0) {
    const noTaskContainerEl = document.createElement('div')
    noTaskContainerEl.classList.add('task__noTask')
    const noTasksPara = document.createElement('p')
    noTasksPara.innerHTML = `
    <i class="fa-solid fa-ban"></i> There are no tasks for today
    `
    noTaskContainerEl.appendChild(noTasksPara)
    taskContainer.appendChild(noTaskContainerEl)
  }

  tasks.forEach((task) => {
    if (task.dueDates.includes(getSimpleDate(selectedDay))) {
      const date = getSimpleDate(selectedDay)
      const taskElement = createTaskElement(task, date)
      taskContainer.innerHTML += taskElement
    }
  })
}

//dinamically display tasks END

//Task name and description,and due date VALIDATION function
function formValidation() {
  let formHasError = false
  const taskName = DOMPurify.sanitize(taskNameEl.value)
  const taskDescription = DOMPurify.sanitize(descriptionEl.value)

  if (taskName.trim() === '') {
    formHasError = showError(taskNameErrorEl, 'Task Name cannot be empty')
  } else if (taskName.trim().length > 40) {
    formHasError = showError(
      taskNameErrorEl,
      'Task Name must be under 40 characters'
    )
  } else {
    taskNameErrorEl.classList.add('hidden')
  }

  if (taskDescription.trim().length > 100) {
    formHasError = showError(
      taskDescriptionErrorEl,
      'Description must be under 100 characters'
    )
  } else {
    taskDescriptionErrorEl.classList.add('hidden')
  }

  dueDateErrorEl.classList.add('hidden')
  repeatOptionsErrorEl.classList.add('hidden')
  if (!dueDateEl.checked && !repeatEl.checked) {
    formHasError = showError(
      repeatOptionsErrorEl,
      'Please select an option (Due date or Repeat)'
    )
  } else if (dueDateEl.checked) {
    if (!dateEl.value) {
      formHasError = showError(dueDateErrorEl, 'Please select a due date')
    } else if (new Date(dateEl.value) < new Date()) {
      formHasError = showError(dueDateErrorEl, 'Please select a future date')
    }
  } else if (repeatEl.checked && getRepeatDays().length === 0) {
    formHasError = showError(
      repeatOptionsErrorEl,
      'Please select at least one day of the week'
    )
  }

  return formHasError
}

//helper function for validation
function showError(element, message) {
  element.textContent = message
  element.classList.remove('hidden')
  return true // Return true to indicate that an error occurred
}

// function to toggle the task checkbox
function toggleCompleted(taskId, date) {
  const tasks = getTasksFromLocalStorage()
  const taskIndex = tasks.findIndex((task) => task.id === String(taskId))
  if (taskIndex !== -1) {
    const selectedTask = tasks[taskIndex]
    if (!selectedTask.selectedDaysIndex) {
      selectedTask.isCompleted = !selectedTask.isCompleted
    } else {
      const dateIndex = selectedTask.completedDates.indexOf(date)

      if (dateIndex !== -1) {
        selectedTask.completedDates.splice(dateIndex, 1)
      } else {
        selectedTask.completedDates.push(date)
      }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }
  populateTasks(selectedDay)
  renderSummary(selectedDay)
}

// function for show button on task-card
function showButton(e) {
  const button = e.currentTarget
  const currentContainerEl = button.closest('.task__container')
  const midContainerEl = currentContainerEl.querySelector(
    '.task__container-mid'
  )

  midContainerEl.classList.toggle('show')
  button.classList.toggle('fa-angle-down')
  button.classList.toggle('fa-angle-up')
}

// show feedback function
function showFeedback(mode) {
  if (mode === 'save') {
    taskFb.style.display = 'flex'
    setTimeout(() => {
      taskFb.style.display = 'none'
    }, 3000)
  } else {
    updateFb.style.display = 'flex'
    setTimeout(() => {
      updateFb.style.display = 'none'
    }, 3000)
  }
}

//calendar carousel START  -----------------------------------
const carouselMonthEl = document.querySelector('.calendar__month')
const carouselCardsContainerEl = document.querySelector(
  '.carousel__cards___container'
)

function formatDate(cardDate, i) {
  const weekday = daysOfTheWeekShort[cardDate.getDay()]
  const date = cardDate.getDate()
  const dayString = cardDate.toLocaleString().split(',')[0]

  return `<div class="carousel__card ${i === 2 ? 'center-day' : ''}" onclick="
  setSelectedDay('${dayString}')">
  <p class="day">${weekday}</p>
  <div class="bar"></div>
  <p class="date">${date}</p>
</div>`
}

function renderCalendarCarousel(selectedDay, numDays = 5) {
  let carouselCardsContent = ''
  // Start from two days before the current day
  const startDay = new Date(
    selectedDay.getFullYear(),
    selectedDay.getMonth(),
    selectedDay.getDate() - 2
  )

  for (let i = 0; i < numDays; i++) {
    const itemDate = new Date(
      startDay.getFullYear(),
      startDay.getMonth(),
      startDay.getDate() + i
    )
    carouselCardsContent += formatDate(itemDate, i)
  }
  carouselCardsContainerEl.innerHTML = carouselCardsContent
  carouselMonthEl.textContent = monthsArr[selectedDay.getMonth()]
}

function forwardHandler() {
  selectedDay = new Date(
    selectedDay.getFullYear(),
    selectedDay.getMonth(),
    selectedDay.getDate() + 1
  )

  const selectedDayString = selectedDay.toLocaleString().split(',')[0]
  setSelectedDay(selectedDayString)
}

function backwardHandler() {
  selectedDay = new Date(
    selectedDay.getFullYear(),
    selectedDay.getMonth(),
    selectedDay.getDate() - 1
  )
  const selectedDayString = selectedDay.toLocaleString().split(',')[0]
  setSelectedDay(selectedDayString)
}

renderCalendarCarousel(selectedDay)
//calendar carousel END -----------------------------------

// calendar desktop
let year = new Date().getFullYear()
let month = new Date().getMonth()

function renderDesktopCalendar() {
  let gridDates = ''

  const monthEl = document.querySelector('#desktopMonth')
  const yearEl = document.querySelector('#desktopYear')
  // containers elements
  const daysContainerEl = document.querySelector('.body__days')
  const gridDatesContainerEl = document.querySelector('.body__grid')

  // current month
  const currentMonthFirstDay = new Date(year, month, 1)
  const currentMonthLastDay = new Date(year, month + 1, 0)
  const currentMonthLastDayIndex = currentMonthLastDay.getDay()
  const currentMonthLastDate = currentMonthLastDay.getDate()

  // previous month
  const prevMonthLastDay = new Date(year, month, 0)

  // next month
  const nextMonthFirstDay = new Date(year, month + 1, 1)
  const nextMonthDays = 7 - currentMonthLastDayIndex - 1

  gridDatesContainerEl.innerHTML = ''
  daysContainerEl.innerHTML = ''

  // render the current year and month
  yearEl.innerText = year
  monthEl.innerText = monthsArr[month]

  // render the days of the week on the header
  daysOfTheWeekShort.forEach((day) => {
    const dayElement = `<p class="body-day">${day.slice(0, 2)}</p>`
    daysContainerEl.innerHTML += dayElement
  })

  // render the PREVIOUS month days
  for (let i = currentMonthFirstDay.getDay(); i > 0; i--) {
    const prevMonthDay = new Date(
      prevMonthLastDay.getFullYear(),
      prevMonthLastDay.getMonth(),
      prevMonthLastDay.getDate() - i + 1
    )

    const prevMonthDayString = prevMonthDay.toLocaleString().split(',')[0]
    const hasTasks = checkDateTask(getSimpleDate(prevMonthDay))

    gridDates += `<div class="grid-date prevMonthDate ${
      hasTasks ? 'due-task' : ''
    }" data-date='${prevMonthDayString}' onclick="
      setSelectedDay('${prevMonthDayString}')">
      ${hasTasks ? "<i class='fa-solid fa-file'></i>" : ''}
      ${prevMonthLastDay.getDate() - i + 1}
      </div>`
  }

  // render the CURRENT month days
  for (let j = 0; j < currentMonthLastDate; j++) {
    const currentMonthDay = new Date(
      currentMonthFirstDay.getFullYear(),
      currentMonthFirstDay.getMonth(),
      currentMonthFirstDay.getDate() + j
    )

    const currentMonthDayString = currentMonthDay.toLocaleString().split(',')[0]
    const hasTasks = checkDateTask(getSimpleDate(currentMonthDay))

    gridDates += `<div class="grid-date ${
      getSimpleDate(currentMonthDay) === getSimpleDate(selectedDay)
        ? 'selected'
        : ''
    } ${
      hasTasks ? 'due-task' : ''
    }" data-date='${currentMonthDayString}' onclick="
    setSelectedDay('${currentMonthDayString}')">
    ${hasTasks ? "<i class='fa-solid fa-file'></i>" : ''}
    ${currentMonthDay.getDate()}
    </div>`
  }

  // render the NEXT month days
  for (let k = 0; k < nextMonthDays; k++) {
    const nextMonthDay = new Date(
      nextMonthFirstDay.getFullYear(),
      nextMonthFirstDay.getMonth(),
      nextMonthFirstDay.getDate() + k
    )
    const nextMonthDayString = nextMonthDay.toLocaleString().split(',')[0]
    const hasTasks = checkDateTask(getSimpleDate(nextMonthDay))

    gridDates += `<div class="grid-date nextMonthDate ${
      hasTasks ? 'due-task' : ''
    }" data-date='${nextMonthDayString}' onclick="
    setSelectedDay('${nextMonthDayString}')">
    ${hasTasks ? "<i class='fa-solid fa-file'></i>" : ''}
    ${nextMonthDay.getDate()}
    </div>`
  }

  gridDatesContainerEl.innerHTML = gridDates
}

function toPrevMonth() {
  if (month === 0) {
    month = 11
    year--
  } else {
    month--
  }
  renderDesktopCalendar()
}

function toNextMonth() {
  if (month === 11) {
    month = 0
    year++
  } else {
    month++
  }
  renderDesktopCalendar()
}

function setSelectedDay(dateString) {
  //Set the global selected day
  selectedDay = new Date(dateString)

  //Re render the DESKTOP calendar
  month = selectedDay.getMonth()
  year = selectedDay.getFullYear()
  renderDesktopCalendar()

  // Add selected class to the clicked date on DESKTOP
  document.querySelectorAll('.grid-date').forEach((element) => {
    element.classList.remove('selected')
    if (element.getAttribute('data-date') === dateString) {
      element.classList.add('selected')
    }
  })

  //Re render the MOBILE calendar
  renderCalendarCarousel(selectedDay)

  //Retrieve tasks from localStorage
  populateTasks(selectedDay)

  // updates the summary
  renderSummary(selectedDay)
}

function getSimpleDate(date) {
  let year = date.getFullYear()
  let month = date.getMonth()
  let day = date.getDate()

  day = day < 10 ? `0${day}` : day
  month = month > 9 ? month + 1 : `0${month + 1}`

  return `${year}-${month}-${day}`
}

function checkDateTask(date) {
  const tasks = getTasksFromLocalStorage()
  return tasks.some((task) => task.dueDates.includes(date))
}

// render summary (tasks lists counter)
// RENDERS THE NUMBER OF ALL TODO AND DONE TASK ON SELECTED DAY
function renderSummary(selectedDay) {
  let remainingTaskCounter = 0
  let doneTaskCounter = 0

  const selectedDayDate = getSimpleDate(selectedDay)

  const tasks = getTasksFromLocalStorage().filter((task) =>
    task.dueDates.includes(selectedDayDate)
  )

  tasks.forEach((task) => {
    if (task.hasOwnProperty('selectedDaysIndex')) {
      if (
        task.completedDates &&
        task.completedDates.includes(selectedDayDate)
      ) {
        doneTaskCounter++
      } else {
        remainingTaskCounter++
      }
    } else {
      if (task.isCompleted) {
        doneTaskCounter++
      } else {
        remainingTaskCounter++
      }
    }
  })
  todoSummaryEl.innerText = `${
    remainingTaskCounter === 0
      ? 'No available task'
      : `${
          remainingTaskCounter === 1
            ? `${remainingTaskCounter} Task Remaining`
            : `${remainingTaskCounter} Tasks Remaining`
        }`
  }`
  doneTaskSummaryEl.innerText = `${
    doneTaskCounter === 0
      ? 'No completed task'
      : `${
          doneTaskCounter === 1
            ? `${doneTaskCounter} Task Completed`
            : `${doneTaskCounter} Tasks Completed`
        }`
  }`
}
// RENDERS THE NUMBER OF ALL TODO AND DONE TASK
// function renderSummary() {
//   const tasks = getTasksFromLocalStorage()
//   let remainingTaskCounter = 0
//   let doneTaskCounter = 0
//   tasks.forEach((task) => {
//     if (task.isChecked) {
//       doneTaskCounter++
//     } else {
//       remainingTaskCounter++
//     }
//   })
//   todoSummaryEl.innerText = `${
//     remainingTaskCounter === 0
//       ? 'No available task'
//       : `${
//           remainingTaskCounter === 1
//             ? `${remainingTaskCounter} Task Remaining`
//             : `${remainingTaskCounter} Tasks Remaining`
//         }`
//   }`
//   doneTaskSummaryEl.innerText = `${
//     doneTaskCounter === 0
//       ? 'No completed task'
//       : `${
//           doneTaskCounter === 1
//             ? `${doneTaskCounter} Task Completed`
//             : `${doneTaskCounter} Tasks Completed`
//         }`
//   }`
// }

function generateActualDates(selectedDaysIndex) {
  const currentDay = new Date()
  const actualDatesArr = []

  const daysToNextMonday =
    currentDay.getDay() !== 0 ? -currentDay.getDay() + 1 + 7 : 1

  const nextMonday = new Date(
    currentDay.getFullYear(),
    currentDay.getMonth(),
    currentDay.getDate() + daysToNextMonday
  )

  for (i = 0; i < numOfRepeatedWeeks; i++) {
    selectedDaysIndex.map((index) => {
      //adjustNumber calculate the gap between the nextMonday and the due dates, if the due date falls on a Sunday, the gap will be 6 + i*7
      const adjustNumber = index !== 0 ? index - 1 + i * 7 : 6 + i * 7
      const dueDate = new Date(
        nextMonday.getFullYear(),
        nextMonday.getMonth(),
        nextMonday.getDate() + adjustNumber
      )

      actualDatesArr.push(getSimpleDate(dueDate))
    })
  }

  return actualDatesArr
}

renderDesktopCalendar()
renderSummary(selectedDay)
populateTasks(selectedDay)
