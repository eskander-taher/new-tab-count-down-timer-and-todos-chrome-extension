document.addEventListener("DOMContentLoaded", function () {
	const todosForm = document.getElementById("todosForm");
	const todoList = document.getElementById("todoItems");
	const newTodoInput = document.getElementById("newTodo");
	const addTodoButton = document.getElementById("addTodo");
	const counterDisplay = document.getElementById("counterDisplay");
	const editDateButton = document.getElementById("editDateButton");
	const dateInputContainer = document.getElementById("dateInputContainer");
	const newDateInput = document.getElementById("newDate");
	const saveDateButton = document.getElementById("saveDateButton");

	let targetDate = new Date("1990-01-01T00:00:00"); // Default date at midnight

	// preventing page refresh
	todosForm.addEventListener("submit", (e) => {
		e.preventDefault();
	});

	// Load todos from storage
	chrome.storage.sync.get(["todos", "targetDate"], function (result) {
		const todos = result.todos || [];
		todos.forEach((todo) => {
			addTodoItem(todo);
		});
		if (result.targetDate) {
			targetDate = new Date(result.targetDate);
			targetDate.setHours(0, 0, 0, 0); // Ensure the time is set to midnight
		}
		updateCounter();
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

		// Create text span
		const todoText = document.createElement("span");
		todoText.classList.add("todo-text");
		todoText.textContent = text;

		// Create delete button
		const deleteBtn = document.createElement("button");
		deleteBtn.textContent = "✕";
		deleteBtn.classList.add("delete-btn");

		// Add delete functionality
		deleteBtn.addEventListener("click", function () {
			todoList.removeChild(li);
			saveTodos();
		});

		// Append elements
		li.appendChild(todoText);
		li.appendChild(deleteBtn);
		todoList.appendChild(li);
	}

	// Save todos to storage
	function saveTodos() {
		const todos = Array.from(todoList.children).map(
			(li) => li.querySelector("span").textContent
		);
		chrome.storage.sync.set({ todos: todos });
	}

	// Show date input when edit button is clicked
	editDateButton.addEventListener("click", function () {
		dateInputContainer.style.display = "block";
		// Set the value of the input to the current target date
		newDateInput.value = targetDate.toISOString().slice(0, 10); // Format: YYYY-MM-DD
	});

	// Save the new date when save button is clicked
	saveDateButton.addEventListener("click", function () {
		const dateValue = newDateInput.value;
		targetDate = new Date(dateValue + "T00:00:00"); // Ensure the time is set to midnight
		chrome.storage.sync.set({ targetDate: targetDate.toISOString() });
		dateInputContainer.style.display = "none";
		updateCounter();
	});

	// Update the counter display
	function updateCounter() {
		const now = new Date();
		const timeDiff = targetDate - now;

		if (timeDiff > 0) {
			const months = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30));
			const days = Math.floor(
				(timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
			);
			const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
			counterDisplay.innerHTML = `	
				<p>${months} Months</p>
				<p>${days} Days</p>
				<p>${hours} Hours</p>
				<p>${minutes} Minutes</p>
			`;
		} else {
			counterDisplay.textContent = "Date has passed!";
		}
	}

	// Update the counter every second
	setInterval(updateCounter,  10000);
});
