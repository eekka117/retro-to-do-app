const addWindow = document.getElementById("addWindow");
const editWindow = document.getElementById("editWindow");
const removeWindow = document.getElementById("removeWindow");
const clearAllWindow = document.getElementById("clearAllWindow");
const markAllCompletedWindow = document.getElementById("markAllCompletedWindow");

const notifyContainer = document.getElementById("notifyContainer");
const taskCounter = document.getElementById("taskCounter");

const taskList = document.getElementById("taskList");
const addInput = document.getElementById("addInput");
const editInput = document.getElementById("editInput");

let currentEditId = null;
let currentRemoveId = null;

const currentYear = new Date().getFullYear();
document.getElementById("footerDateSpan").textContent = currentYear;

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function setTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

const windows = {
  add: addWindow,
  edit: editWindow,
  remove: removeWindow,
  clearAll: clearAllWindow,
  markAllCompleted: markAllCompletedWindow,
};

function closeAllWindows() {
  Object.values(windows).forEach((win) => win.classList.add("hidden"));
}

function openWindow(name) {
  closeAllWindows();
  windows[name].classList.remove("hidden");
}

function closeAddWindow() {
  windows.add.classList.add("hidden");
}

function closeEditWindow() {
  windows.edit.classList.add("hidden");
}

function closeRemoveWindow() {
  windows.remove.classList.add("hidden");
}

function closeClearAllWindow() {
  windows.clearAll.classList.add("hidden");
}

function closeMarkAllCompletedWindow() {
  windows.markAllCompleted.classList.add("hidden");
}

function openAddWindow() {
  openWindow("add");
}

function openEditWindow(id) {
  currentEditId = id;
  const task = getTasks().find((t) => t.id === id);
  editInput.value = task.text;
  openWindow("edit");
}

function openRemoveWindow(id) {
  currentRemoveId = id;
  openWindow("remove");
}

function openClearAllWindow() {
  openWindow("clearAll");
}

function openMarkAllCompletedWindow() {
  openWindow("markAllCompleted");
}

function updateTaskListPlaceholder() {
  if (taskList.children.length === 0) {
    const li = document.createElement("li");
    li.className = "placeholder";
    li.textContent = "You currently have no tasks.";
    taskList.appendChild(li);
  } else {
    const placeholder = taskList.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
  }
}

function notifyPopup(text) {
  const box = document.createElement("div");
  box.className = "notify";
  box.innerHTML = `
    <div class="top-row">
      <span>${text}</span>
      <button>x</button>
    </div>
    <div class="bar"></div>
  `;
  notifyContainer.appendChild(box);
  box.querySelector("button").addEventListener("click", () => {
    box.remove();
  });
  setTimeout(() => box.remove(), 3000);
}

function updateTaskCounter() {
  const tasks = getTasks();
  const remaining = tasks.filter((task) => !task.completed).length;

  if (tasks.length === 0) {
    taskCounter.textContent = "";
  } else if (remaining === 1) {
    taskCounter.textContent = "1 task remaining";
  } else if (remaining === 0) {
    taskCounter.textContent = "All tasks completed!";
  } else {
    taskCounter.textContent = `${remaining} tasks remaining`;
  }
}

function addTask() {
  const taskText = addInput.value.trim();
  if (taskText !== "") {
    const task = { id: Date.now(), text: taskText, completed: false };
    addTaskElement(task);
    saveTask(task);
    notifyPopup("Added task");
    updateTaskCounter();
  }
  closeAddWindow();
  addInput.value = "";
}

function addTaskElement(task) {
  const li = document.createElement("li");
  li.setAttribute("task-id", task.id);
  const checkboxId = `task-${task.id}`;
  li.innerHTML = `
    <input type="checkbox" id="${checkboxId}">
    <label for="${checkboxId}">${task.text}</label>
    <div class="task-btns">
        <button class="edit-btn">Edit</button>
        <button class="remove-btn">Remove</button>
    </div>
  `;

  const checkbox = li.querySelector("input[type='checkbox']");
  const label = li.querySelector("label");
  const editBtn = li.querySelector(".edit-btn");
  const removeBtn = li.querySelector(".remove-btn");

  checkbox.checked = task.completed;
  if (task.completed) label.style.textDecoration = "line-through";

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    label.style.textDecoration = checkbox.checked ? "line-through" : "none";
    updateTaskInLocalStorage(task.id, task);
    updateTaskCounter();
  });

  editBtn.addEventListener("click", () => openEditWindow(task.id));
  removeBtn.addEventListener("click", () => openRemoveWindow(task.id));

  taskList.appendChild(li);
  updateTaskListPlaceholder();
}

function editTask() {
  if (!currentEditId) return;
  const li = document.querySelector(`li[task-id="${currentEditId}"]`);
  li.querySelector("label").textContent = editInput.value;
  closeEditWindow();
  notifyPopup("Edited task");
  updateTaskInLocalStorage(currentEditId, { text: editInput.value });
}

function removeTask() {
  if (!currentRemoveId) return;
  const li = document.querySelector(`li[task-id="${currentRemoveId}"]`);
  if (li) li.remove();
  removeTaskFromLocalStorage(currentRemoveId);
  notifyPopup("Removed task");
  updateTaskListPlaceholder();
  updateTaskCounter();
  currentRemoveId = null;
  closeRemoveWindow();
}

function updateTaskInLocalStorage(id, updatedFields) {
  let tasks = getTasks();
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, ...updatedFields } : task
  );
  setTasks(tasks);
}

function removeTaskFromLocalStorage(id) {
  let tasks = getTasks();
  tasks = tasks.filter((task) => task.id !== id);
  setTasks(tasks);
}

function saveTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  setTasks(tasks);
}

function clearAllTasks() {
  const tasks = getTasks();
  if (tasks.length === 0) {
    closeClearAllWindow();
    return;
  }
  localStorage.removeItem("tasks");
  taskList.innerHTML = "";
  notifyPopup("Cleared all tasks");
  closeAllWindows();
  updateTaskListPlaceholder();
  updateTaskCounter();
}

function markAllCompleted() {
  const tasks = getTasks();
  if (tasks.length === 0) {
    closeMarkAllCompletedWindow();
    return;
  }
  tasks.forEach((task) => (task.completed = true));
  setTasks(tasks);
  taskList.querySelectorAll("li").forEach((li) => {
    const checkbox = li.querySelector("input[type='checkbox']");
    const label = li.querySelector("label");
    checkbox.checked = true;
    label.style.textDecoration = "line-through";
  });
  notifyPopup("All tasks marked as completed");
  updateTaskCounter();
  closeMarkAllCompletedWindow();
}

function renderTasks() {
  const tasks = getTasks();
  taskList.innerHTML = "";

  tasks.forEach((task) => addTaskElement(task));

  updateTaskCounter();
  updateTaskListPlaceholder();
}

window.addEventListener("load", () => {
  renderTasks();
});

addInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});
