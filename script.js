document.addEventListener("DOMContentLoaded", async function() {
  const addTaskBtn = document.getElementById("addTaskBtn");

  const db = await openDB();

  addTaskBtn.addEventListener("click", function() {
    addTask(db);
  });
});

function addTask(db) {
  const taskList = document.getElementById("taskList");
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();

  if (taskText) {
    const checkbox = addTaskInList(taskList, taskText)

    checkbox.addEventListener("change", function() {
      handleTaskCheckbox(db, taskText, this);
    });

    createTaskInDB(db, taskText);
  }
};

function addTaskInList(taskList, taskText) {
  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  const span = document.createElement("span");

  checkbox.type = "checkbox";
  span.textContent = taskText;

  li.appendChild(checkbox);
  li.appendChild(span);
  
  taskList.appendChild(li);
  taskInput.value = "";

  return checkbox;
}

function handleTaskCheckbox(db, taskText, checkbox) {
  const span = checkbox.nextElementSibling;
  const completed = checkbox.checked;

  span.classList.remove("task-complete");
  if (checkbox.checked) {
    span.classList.add("task-complete");
  } 

  updateTaskInDB(db, taskText, completed);
}

async function openDB() {
  return new Promise((resolve, _reject) => {
    const request = window.indexedDB.open("todoDB", 2);

    request.onsuccess = function(event) {
      const db = event.target.result;

      resolve(db);
    };

    request.onupgradeneeded = function(event) {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("tasks")) {
        const objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });

        objectStore.createIndex("text", "text", { unique: false });
        objectStore.createIndex("completed", "completed", { unique: false });
      }
    };
  })
}

async function createTaskInDB(db, taskText) {
  const transaction = db.transaction("tasks", "readwrite");
  const objectStore = transaction.objectStore("tasks");

  const task = {
    text: taskText,
    completed: false
  };

  objectStore.add(task);

  transaction.oncomplete = function() {
    console.log("Tarefa salva no banco de dados.");
  };
}

async function updateTaskInDB(db, taskText, completed) {
  const transaction = db.transaction("tasks", "readwrite");
  const objectStore = transaction.objectStore("tasks");
  const request = objectStore.index("text").getKey(taskText);

  request.onsuccess = function(event) {
    const key = event.target.result;
    const getRequest = objectStore.get(key);

    getRequest.onsuccess = function(event) {
      const task = event.target.result;
      task.completed = completed;
      const updateRequest = objectStore.put(task);
    }
  }
}