document.addEventListener("DOMContentLoaded", function () {
    // Nounce for the request
    const NOUNCE = document.getElementById("wp_rest_nonce").value;
    // Input field
    const todoName = document.getElementById("todo-name");
    const todoDesc = document.getElementById("todo-desc");
    // Add Button
    const addTaskBtn = document.getElementById("add-task");
    // The DOM which display the result
    let listItems = [...document.querySelectorAll(".list-item")];
    // Error message
    const errorMessage = document.getElementById("error-message");

    // Listeners
    if (addTaskBtn) {
        addTaskBtn.addEventListener("click", addTask);
    }
    if (listItems.length > 0) {
        listItems.map((item) => {
            item.children[1].addEventListener("click", toggleItem);
        });
        listItems.map((item) => {
            item.children[0].addEventListener("click", deleteTask);
        });
    }

    // Functions
    function toggleItem(e) {
        let itemId;
        if (e.target.tagName === "DIV") {
            e.target.classList.toggle("checked");
            itemId = e.target.id.split("-")[1];
        } else if (e.target.tagName === "H5" || e.target.tagName === "P") {
            e.target.parentNode.classList.toggle("checked");
            itemId = e.target.parentNode.id.split("-")[1];
        }
        // Send request to update the data
        fetch(`http://doamin.name/wp-json/todo/v1/toggle/${itemId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": NOUNCE,
            },
        })
            .then((response) => response.json())
            .then((_) => {
                window.location.reload();
            })
            .catch((error) => {
                errorMessage.innerHTML = error;
            });
    }

    function addTask() {
        // Check if the input field is empty, if not send request to add new column
        if (
            todoName.value.trim().length === 0 ||
            todoDesc.value.trim().length === 0
        ) {
            alert("Task name and task description must be fill!");
        } else {
            // Only execute if the result is success
            errorMessage.innerHTML = "";
            fetch("http://doamin.name/wp-json/todo/v1/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-WP-Nonce": NOUNCE,
                },
                body: JSON.stringify({
                    todo: todoName.value,
                    description: todoDesc.value,
                }),
            })
                .then((response) => response.json())
                .then((_) => {
                    window.location.reload();
                })
                .catch((error) => {
                    errorMessage.innerHTML = error;
                });
        }
    }

    function deleteTask(e) {
        const itemId = e.target.id.split("-")[1];
        // Send request to delete the data
        // If response is success, refresh the page
        fetch(`http://doamin.name/wp-json/todo/v1/delete/${itemId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-WP-Nonce": NOUNCE,
            },
        })
            .then((response) => response.json())
            .then((_) => {
                window.location.reload();
            })
            .catch((error) => {
                errorMessage.innerHTML = error;
            });
    }
});
