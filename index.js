// === DOM Elements ===
const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const remainingCount = document.getElementById("remainingCount");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggle = document.getElementById("themeToggle");

// === State ===
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let filter = "all";
let editId = null;

// === Functions ===
function saveToStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm);
    if (filter === "active") return !todo.completed && matchesSearch;
    if (filter === "completed") return todo.completed && matchesSearch;
    return matchesSearch;
  });

  todoList.innerHTML = "";
  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filteredTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `todo-item ${todo.completed ? "completed" : ""}`;
      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${
          todo.completed ? "checked" : ""
        } data-id="${todo.id}">
        <span class="todo-text">${todo.text}</span>
        <div class="todo-actions">
          <button class="edit-btn" data-id="${todo.id}">✎</button>
          <button class="delete-btn" data-id="${todo.id}">🗑</button>
        </div>
      `;
      todoList.appendChild(li);
    });
  }

  // Обновить счётчик
  remainingCount.textContent = todos.filter((t) => !t.completed).length;
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  if (editId !== null) {
    // Редактирование
    const todo = todos.find((t) => t.id === editId);
    if (todo) {
      todo.text = text;
    }
    editId = null;
    addBtn.textContent = "Добавить";
  } else {
    // Новая задача
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };
    todos.unshift(newTodo); // В начало списка
  }

  todoInput.value = "";
  saveToStorage();
  renderTodos();
}

function toggleComplete(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveToStorage();
    renderTodos();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  if (editId === id) {
    todoInput.value = "";
    editId = null;
    addBtn.textContent = "Добавить";
  }
  saveToStorage();
  renderTodos();
}

function startEdit(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todoInput.value = todo.text;
    todoInput.focus();
    editId = id;
    addBtn.textContent = "Сохранить";
  }
}

// === Event Listeners ===
addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTodo();
});

todoList.addEventListener("click", (e) => {
  const id = Number(e.target.dataset.id);
  if (e.target.classList.contains("todo-checkbox")) {
    toggleComplete(id);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTodo(id);
  } else if (e.target.classList.contains("edit-btn")) {
    startEdit(id);
  }
});

todoList.addEventListener("dblclick", (e) => {
  if (e.target.classList.contains("todo-text")) {
    const li = e.target.closest(".todo-item");
    const id = Number(li.querySelector(".todo-checkbox").dataset.id);
    startEdit(id);
  }
});

searchInput.addEventListener("input", renderTodos);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    renderTodos();
  });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀ Светлая тема"
    : "🌙 Темная тема";

  // Сохранение темы
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDark);
});

// === Инициализация ===
renderTodos();

// Проверка сохранённой темы при загрузке
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
  themeToggle.textContent = "☀ Светлая тема";
}
