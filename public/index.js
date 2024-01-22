function showDiv(divId) {
    // Hide all divs
    document.querySelector('#date').style.display = 'none';
    document.querySelector('#repeat-options').style.display = 'none';

    // Show the selected div
    document.getElementById(divId).style.display = 'block';
}


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


const submit = document.querySelector('button[type=submit]')
submit.addEventListener('click', fun)

function getRepeatDays() {
    let daysArray = [];
    [...repeatOptions.children].forEach(day => {
        if (day.firstElementChild.checked) daysArray.push(day.firstElementChild.value)
    });
    return daysArray
}

function fun(e) {
    e.preventDefault()
    // getRepeatDays()
    // console.log(taskName.value, description.value, categoryText, activityText, date.value, getRepeatDays(), priority.checked)


    const object = {
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


}


