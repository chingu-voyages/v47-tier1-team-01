console.log('hello world')

function showDiv(divId) {
    // Hide all divs
    document.querySelector('#date').style.display = 'none';
    document.querySelector('#repeat-options').style.display = 'none';

    // Show the selected div
    document.getElementById(divId).style.display = 'block';
}