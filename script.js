document.addEventListener("DOMContentLoaded", function () {
    const todosForm = document.getElementById("todosForm");
	const todoList = document.getElementById("todoItems");
	const newTodoInput = document.getElementById("newTodo");
	const newTimerInput = document.getElementById("newTimer");
	const addTodoButton = document.getElementById("addTodo");
	const counterDisplay = document.getElementById("counterDisplay");
	const editDateButton = document.getElementById("editDateButton");
	const dateInputContainer = document.getElementById("dateInputContainer");
	const newDateInput = document.getElementById("newDate");
	const saveDateButton = document.getElementById("saveDateButton");
	const timerEndSound = document.getElementById("timerEndSound");

	let targetDate = new Date("1990-01-01T00:00:00"); // Default date at midnight

	// Preventing page refresh
	todosForm.addEventListener("submit", (e) => {
		e.preventDefault();
	});

	// Load todos and history from storage
	chrome.storage.sync.get(["todos", "targetDate"], function (result) {
		todos = result.todos || [];

		console.log(todos);

		todos.forEach((todo) => addTodoItem(todo.text, todo.time, todo.done));

		if (result.targetDate) {
			targetDate = new Date(result.targetDate);
			targetDate.setHours(0, 0, 0, 0);
		}
		updateCounter();
	});

	// Add new todo item
	addTodoButton.addEventListener("click", function () {
		const todoText = newTodoInput.value.trim();
		if (todoText) {
			addTodoItem(todoText, parseInt(newTimerInput.value.trim()) || 0, false);
			newTimerInput.value = "";
			newTodoInput.value = "";
			saveTodos();
		}
	});

	// Add todo item to the list
	function addTodoItem(text, time, done) {
		const li = document.createElement("li");
		li.innerHTML = `
        <div class="todo">
            <p class="todo-p">
                <span class="todo-text">${text} </span><span class="todo-timer">${time} min</span>
            </p>
            <div class="todo-item-actions">
                <button class="start-btn">▶️</button>
                <button class="delete-btn">✕</button>
                <button class="done-btn">✔️</button> <!-- Done Button -->
            </div>
        </div>
    `;

		const startBtn = li.querySelector(".start-btn");
		const deleteBtn = li.querySelector(".delete-btn");
		const doneBtn = li.querySelector(".done-btn"); // Done Button
		const timerSpan = li.querySelector(".todo-timer");

		if (done) {
			li.classList.add("done-todo");
		}

		let countdown;
		let remainingTime = time * 60; // Convert to seconds
		let isPaused = false;

		startBtn.addEventListener("click", () => {
			timerSpan.classList.add("running-timer");
			if (!countdown) {
				countdown = setInterval(() => {
					if (!isPaused) {
						remainingTime--;
						const minutes = Math.floor(remainingTime / 60);
						const seconds = remainingTime % 60;
						timerSpan.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

						if (remainingTime <= 0) {
							clearInterval(countdown);
							timerSpan.textContent = "0:00";
							timerEndSound.play();
						}
					}
				}, 1000);
				startBtn.textContent = "⏸️";
			} else {
				isPaused = !isPaused;
				startBtn.textContent = isPaused ? "▶️" : "⏸️";
			}
		});

		deleteBtn.addEventListener("click", () => {
			clearInterval(countdown);
			todoList.removeChild(li);
			saveTodos();
		});

		// Event listener for the Done button
		doneBtn.addEventListener("click", () => {
			li.classList.toggle("done-todo");
			saveTodos();
		});

		todoList.appendChild(li);
	}

	// Save todos to storage
	function saveTodos() {
		const currentTodos = Array.from(todoList.children).map((li) => ({
			text: li.querySelector(".todo-text").textContent,
			time: parseInt(li.querySelector(".todo-timer").textContent.split(" ")[0]),
			done: li.classList.contains("done-todo"),
		}));
		chrome.storage.sync.set({ todos: currentTodos });
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
            <p>${minutes} Minutes</p>
            <p>${hours} Hours</p>
            <p>${days} Days</p>
            <p>${months} Months</p>
            `;
		} else {
			counterDisplay.textContent = "Date has passed!";
		}
	}

	// Update the counter every second
	setInterval(updateCounter, 10000);
});
