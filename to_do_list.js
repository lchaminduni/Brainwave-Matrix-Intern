let tasks = {};
let chart;

// Function to add a new task
function addTask() {
  const taskInput = document.getElementById('taskInput').value;
  const taskDate = document.getElementById('taskDate').value;
  const taskPriority = document.getElementById('taskPriority').value;
  const taskReminder = document.getElementById('taskReminder').value;

  if (taskInput.trim() === "" || taskDate === "") {
    alert("Please fill in the task details.");
    return;
  }

  // Parse the date correctly, adjusting for time zone issues
  const selectedDate = new Date(taskDate); // Convert input string to Date object
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Set current date to midnight to ignore time

  if (selectedDate < currentDate) {
    alert("Please select a future date.");
    return;
  }

  // Fix for time zone issues: Set time to midnight to avoid time zone shifts
  selectedDate.setHours(0, 0, 0, 0);

  // Ensure the task date is stored as a string in the correct format without time adjustments
  const formattedDate = formatDate(selectedDate); // Use the formatted date

  if (!tasks[formattedDate]) {
    tasks[formattedDate] = [];
  }

  const task = {
    text: taskInput,
    completed: false,
    priority: taskPriority,
    reminder: taskReminder
  };

  tasks[formattedDate].push(task);

  updateTaskList();
  updateChart();

  // Clear inputs
  document.getElementById('taskInput').value = "";
  document.getElementById('taskDate').value = "";
  document.getElementById('taskPriority').value = "Low";
  document.getElementById('taskReminder').value = "";
}

// Function to update the task list display
function updateTaskList() {
  const taskListContainer = document.getElementById('taskListContainer');
  taskListContainer.innerHTML = '';

  for (const date in tasks) {
    const dateSection = document.createElement('div');
    dateSection.className = "mb-4";

    // Format the date consistently
    const dateTitle = document.createElement('h2');
    dateTitle.textContent = date; // Display the date directly
    dateTitle.className = "text-lg font-semibold text-gray-700 mb-2";

    const ul = document.createElement('ul');
    ul.className = "list-none";

    tasks[date].forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `flex justify-between items-center p-2 mb-2 rounded shadow ${getPriorityColor(task.priority)}`;

      // Checkbox for completion
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.onchange = () => toggleTaskCompletion(date, index);

      // Task text with priority and reminder label
      const taskText = document.createElement('span');
      let reminderText = task.reminder ? ` - Reminder set for ${formatDate(new Date(task.reminder))}` : '';
      taskText.innerHTML = `${task.text} <span class="text-xs font-semibold">(${task.priority} Priority)</span>${reminderText}`;
      if (task.completed) {
        taskText.className = "line-through text-gray-500";
      }

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "text-red-500";
      deleteBtn.onclick = () => deleteTask(date, index);

      li.appendChild(checkbox);
      li.appendChild(taskText);
      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });

    dateSection.appendChild(dateTitle);
    dateSection.appendChild(ul);
    taskListContainer.appendChild(dateSection);
  }
}

// Function to format the date as MM/DD/YYYY
function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Function to toggle task completion
function toggleTaskCompletion(date, index) {
  tasks[date][index].completed = !tasks[date][index].completed;
  updateTaskList();
  updateChart();
}

// Function to delete a task
function deleteTask(date, index) {
  tasks[date].splice(index, 1);
  if (tasks[date].length === 0) {
    delete tasks[date];
  }
  updateTaskList();
  updateChart();
}

// Function to check and alert reminders
function checkReminders() {
  const now = new Date().toISOString();

  for (const date in tasks) {
    tasks[date].forEach(task => {
      if (task.reminder && task.reminder <= now && !task.completed) {
        alert(`Reminder: ${task.text} is due now!`);
        task.reminder = ""; // Clear the reminder after alerting
      }
    });
  }
}

// Call checkReminders every minute
setInterval(checkReminders, 60000);

// Function to calculate the completion percentage
function calculateCompletionPercentage() {
  let totalTasks = 0;
  let completedTasks = 0;

  for (const date in tasks) {
    tasks[date].forEach(task => {
      totalTasks += 1;
      if (task.completed) completedTasks += 1;
    });
  }

  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
}

// Function to update the pie chart
function updateChart() {
  const completionPercentage = calculateCompletionPercentage();

  if (chart) {
    chart.destroy(); // Destroy previous chart before re-rendering
  }

  const ctx = document.getElementById('completionChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Incomplete'],
      datasets: [{
        label: 'Task Completion',
        data: [completionPercentage, 100 - completionPercentage],
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
}

// Function to return a color based on priority
function getPriorityColor(priority) {
  switch (priority) {
    case 'High':
      return 'bg-red-100 border-l-4 border-red-500';
    case 'Medium':
      return 'bg-yellow-100 border-l-4 border-yellow-500';
    case 'Low':
      return 'bg-green-100 border-l-4 border-green-500';
    default:
      return '';
  }
}
