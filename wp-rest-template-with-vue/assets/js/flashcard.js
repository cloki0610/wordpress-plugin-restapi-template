(function () {
    document.addEventListener("DOMContentLoaded", onReady);
    function onReady() {
        const NOUNCE = document.getElementById("wp_rest_nonce").value;
        const { createApp } = Vue;
        const app = createApp({
            data() {
                return {
                    flashcards: [],
                    formOpen: false,
                    formType: "Add",
                    selectedItem: {},
                };
            },
            methods: {
                addForm() {
                    this.formType = "Add";
                    this.formOpen = true;
                },
                editForm(flashcard_id) {
                    this.formType = "Edit";
                    this.formOpen = true;
                    this.selectedItem = flashcard_id;
                },
                hideForm() {
                    this.formOpen = false;
                    this.selectedItem = {};
                },
                loadFlashcards() {
                    fetch("http://domain.name/flashcard/v1/list", {
                        headers: {
                            "Content-Type": "application/json",
                            "X-WP-Nonce": NOUNCE,
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            this.flashcards = data;
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                },
                addFlashcard({ flashcard_id, question, answer }) {
                    let results = this.flashcards;
                    let newFlashcard = { flashcard_id, question, answer };
                    results.push(newFlashcard);
                    this.flashcards = results;
                },
                updateFlashcard({ flashcard_id, question, answer }) {
                    let results = this.flashcards;
                    const updatedFlashcard = { flashcard_id, question, answer };
                    const flashcardIndex = results.findIndex(
                        (item) => item.flashcard_id === flashcard_id
                    );
                    results[flashcardIndex] = updatedFlashcard;
                    this.flashcards = results;
                },
                deleteFlashcard(flashcard_id) {
                    let results = this.flashcards;
                    results = results.filter(
                        (item) => item.flashcard_id !== flashcard_id
                    );
                    this.flashcards = results;
                },
            },
            mounted() {
                this.loadFlashcards();
            },
        });
        app.component("base-card", {
            template: `<div class="base-card"><slot></slot></div>`,
        });
        app.component("base-button", {
            template: `<button class="base-button"><slot></slot></button>`,
        });
        app.component("xmark", {
            template: `<svg
            width="25px"
            height="25px"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512">
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
            </svg>`,
        });
        app.component("trash-can", {
            template: `<svg
            width="25px"
            height="25px"
            fill="#ea0909"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512">
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"/>
            </svg>`,
        });
        app.component("pen-to-square", {
            template: `<svg
            width="25px"
            height="25px"
            fill="#073ee2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512">
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
            </svg>`,
        });
        app.component("flashcard-form", {
            template: `<div>
            <div v-if="open" class="backdrop" @click="$emit('close')"></div>
              <form class="base-form" v-if="open" @submit.prevent="submitForm">
              <h2>{{ formtype }} Flashcard</h2>
              <div class="bar-wrapper">
                <span id="error">{{error}}</span><div id="close-btn" @click="$emit('close')"><xmark></xmark></div>
              </div>
              <label for="question">Question:</label>
              <textarea
                class="input"
                id="question"
                name="question"
                v-model="enteredQuestion"
                placeholder="Type the question here..."
                rows="2"
              ></textarea>
              <label for="answer">Answer:</label>
              <textarea
                class="input"
                id="answer"
                name="answer"
                v-model="enteredAnswer"
                rows="4"
                placeholder="Type the answer here..."
              ></textarea>
              <base-button type="submit">Save</base-button>
              </form>
            </div>`,
            props: ["open", "formtype", "selecteditem"],
            emits: ["close", "on-add", "on-update"],
            data() {
                return {
                    enteredQuestion: "",
                    enteredAnswer: "",
                    error: "",
                };
            },
            watch: {
                selecteditem() {
                    this.enteredQuestion = this.selecteditem.question;
                    this.enteredAnswer = this.selecteditem.answer;
                },
            },
            methods: {
                submitForm() {
                    this.error = "";
                    if (
                        this.enteredQuestion === "" ||
                        this.enteredAnswer === ""
                    ) {
                        this.error = "Input fields cannot be empty!";
                        return;
                    }
                    if (this.formtype === "Add") {
                        this.addFlashcard();
                    } else if (this.formtype === "Edit") {
                        this.updateFlashcard();
                    } else {
                        this.error = "Invalid form type!";
                        return;
                    }
                },
                addFlashcard() {
                    fetch("http://doamin.name/wp-json/flashcard/v1/create", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-WP-Nonce": NOUNCE,
                        },
                        body: JSON.stringify({
                            question: this.enteredQuestion,
                            answer: this.enteredAnswer,
                        }),
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            alert(`${data.message}`);
                            this.$emit("on-add", {
                                flashcard_id: data.data.flashcard_id,
                                question: data.data.question,
                                answer: data.data.answer,
                            });
                            this.enteredQuestion = "";
                            this.enteredAnswer = "";
                            this.error = "";
                            this.$emit("close");
                        })
                        .catch((error) => {
                            this.error = error;
                        });
                },
                updateFlashcard() {
                    fetch(
                        `http://doamin.name/wp-json/flashcard/v1/update/${this.selecteditem.flashcard_id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-WP-Nonce": NOUNCE,
                            },
                            body: JSON.stringify({
                                question: this.enteredQuestion,
                                answer: this.enteredAnswer,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            alert(`${data.message}`);
                            this.$emit("on-update", {
                                flashcard_id: data.data.flashcard_id,
                                question: data.data.question,
                                answer: data.data.answer,
                            });
                            this.enteredQuestion = "";
                            this.enteredAnswer = "";
                            this.$emit("close");
                        })
                        .catch((error) => {
                            this.error = error;
                        });
                },
            },
        });

        app.component("flashcard-item", {
            template: `<li :id="flashcard_id"><base-card><div class="card-details">
            <p class="flashcard-q">{{question}}</p>
            <base-button type="button" @click="toggleAnswer">{{showOrHide}}</base-button>
            <p class="flashcard-a" v-if="status">{{answer}}</p>
            <div class="card-button">
            <button class="card-edit" @click="displayUpdateForm(flashcard_id)"><pen-to-square></pen-to-square></button>
            <button class="card-delete" @click="deleteFlashcard(flashcard_id)"><trash-can></trash-can></button>
            </div>
            </div></base-card></li>`,
            props: ["flashcard_id", "question", "answer"],
            emits: ["update-form", "delete-flashcard"],
            data() {
                return {
                    status: false,
                };
            },
            computed: {
                showOrHide() {
                    return this.toggle ? "Hide Answer" : "Show Answer";
                },
            },
            methods: {
                toggleAnswer() {
                    this.status = !this.status;
                },
                displayUpdateForm() {
                    this.$emit("update-form");
                },
                deleteFlashcard(flashcard_id) {
                    fetch(
                        `http://doamin.name/wp-json/flashcard/v1/delete/${flashcard_id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "X-WP-Nonce": NOUNCE,
                            },
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            alert(`${data.message}`);
                            this.$emit("delete-flashcard");
                        })
                        .catch((error) => {
                            alert(error);
                            console.log(error);
                        });
                },
            },
        });

        app.component("flashcard-list", {
            template: `<ul class="flashcard-list">
            <flashcard-item
            v-for="item in list"
            :key="item.flashcard_id"
            :flashcard_id="item.flashcard_id"
            :question="item.question"
            :answer="item.answer"
            @update-form="$emit('update-form', {flashcard_id: item.flashcard_id, question: item.question, answer: item.answer})"
            @delete-flashcard="$emit('delete-flashcard', item.flashcard_id)"><flashcard-item>
            </ul>`,
            props: ["list"],
            emits: ["update-form", "delete-flashcard"],
        });

        app.mount("#flashcard");
    }
})();
