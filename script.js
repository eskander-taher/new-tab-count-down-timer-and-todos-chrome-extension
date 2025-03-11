document.addEventListener("DOMContentLoaded", function () {
	const todoList = document.getElementById("todoItems");
	const newTodoInput = document.getElementById("newTodo");
	const addTodoButton = document.getElementById("addTodo");
	const counterDisplay = document.getElementById("counterDisplay");

	// Load todos from storage
	chrome.storage.sync.get(["todos"], function (result) {
		const todos = result.todos || [];
		todos.forEach((todo) => {
			addTodoItem(todo);
		});
	});

	// Add new todo item
	addTodoButton.addEventListener("click", function () {
		const todoText = newTodoInput.value.trim();
		if (todoText) {
			addTodoItem(todoText);
			newTodoInput.value = "";
			saveTodos();
		}
	});

	// Add todo item to the list
	function addTodoItem(text) {
		const li = document.createElement("li");
		li.textContent = text;
		todoList.appendChild(li);
	}

	// Save todos to storage
	function saveTodos() {
		const todos = Array.from(todoList.children).map((li) => li.textContent);
		chrome.storage.sync.set({ todos: todos });
	}

	// Update the counter display
	function updateCounter() {
		const birthDate = new Date("1990-01-01"); // Replace with user's birthdate
		const now = new Date();
		const ageInMs = now - birthDate;
		const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
		counterDisplay.textContent = `You are ${ageInYears} years old.`;
	}

	// Update the counter every second
	updateCounter();
	setInterval(updateCounter, 1000);
});
