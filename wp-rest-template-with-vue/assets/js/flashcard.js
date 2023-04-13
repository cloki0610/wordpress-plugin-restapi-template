(function () {
    document.addEventListener("DOMContentLoaded", onReady);
    function onReady() {
        const NOUNCE = document.getElementById("wp_rest_nonce").value;
        const { createApp, ref, computed, watch } = Vue;
        const app = createApp({
            setup() {
                const flashcards = ref([]);
                const formOpen = ref(false);
                const formType = ref("Add");
                const selectedItem = ref({});

                const addForm = () => {
                    formType.value = "Add";
                    formOpen.value = true;
                };

                const editForm = (flashcard) => {
                    formType.value = "Edit";
                    formOpen.value = true;
                    selectedItem.value = flashcard;
                };

                const hideForm = () => {
                    formOpen.value = false;
                    selectedItem.value = {};
                };
                const loadFlashcards = () => {
                    fetch("http://scholarly.local/wp-json/flashcard/v1/list", {
                        headers: {
                            "Content-Type": "application/json",
                            "X-WP-Nonce": NOUNCE,
                        },
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            flashcards.value = data;
                        })
                        .catch((err) => {
                            console.error(err);
                        });
                };

                const addFlashcard = ({ flashcard_id, question, answer }) => {
                    let results = flashcards.value;
                    let newFlashcard = { flashcard_id, question, answer };
                    results.push(newFlashcard);
                    flashcards.value = results;
                };

                const updateFlashcard = ({
                    flashcard_id,
                    question,
                    answer,
                }) => {
                    let results = flashcards.value;
                    const updatedFlashcard = { flashcard_id, question, answer };
                    const flashcardIndex = results.findIndex(
                        (item) => item.flashcard_id === flashcard_id
                    );
                    results[flashcardIndex] = updatedFlashcard;
                    flashcards.value = results;
                };

                const deleteFlashcard = (flashcard_id) => {
                    let results = flashcards.value;
                    results = results.filter(
                        (item) => item.flashcard_id !== flashcard_id
                    );
                    flashcards.value = results;
                };

                return {
                    flashcards,
                    formOpen,
                    formType,
                    selectedItem,
                    addForm,
                    editForm,
                    hideForm,
                    loadFlashcards,
                    addFlashcard,
                    updateFlashcard,
                    deleteFlashcard,
                };
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
            setup(props, { emit }) {
                const enteredQuestion = ref("");
                const enteredAnswer = ref("");
                const error = ref("");
                watch(props, (_, newProps) => {
                    enteredQuestion.value = newProps.selecteditem.question;
                    enteredAnswer.value = newProps.selecteditem.answer;
                });

                const submitForm = () => {
                    error.value = "";
                    if (
                        enteredQuestion.value === "" ||
                        enteredAnswer.value === ""
                    ) {
                        error.value = "Input fields cannot be empty!";
                        return;
                    }
                    if (props.formtype === "Add") {
                        addFlashcard();
                    } else if (props.formtype === "Edit") {
                        updateFlashcard();
                    } else {
                        error.value = "Invalid form type!";
                        return;
                    }
                };

                const addFlashcard = () => {
                    fetch(
                        "http://scholarly.local/wp-json/flashcard/v1/create",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-WP-Nonce": NOUNCE,
                            },
                            body: JSON.stringify({
                                question: enteredQuestion.value,
                                answer: enteredAnswer.value,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            alert(`${data.message}`);
                            emit("on-add", {
                                flashcard_id: data.data.flashcard_id,
                                question: data.data.question,
                                answer: data.data.answer,
                            });
                            enteredQuestion.value = "";
                            enteredAnswer.value = "";
                            error.value = "";
                            emit("close");
                        })
                        .catch((err) => {
                            error.value = err;
                        });
                };

                const updateFlashcard = () => {
                    fetch(
                        `http://scholarly.local/wp-json/flashcard/v1/update/${props.selecteditem.flashcard_id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-WP-Nonce": NOUNCE,
                            },
                            body: JSON.stringify({
                                question: enteredQuestion.value,
                                answer: enteredAnswer.value,
                            }),
                        }
                    )
                        .then((response) => response.json())
                        .then((data) => {
                            alert(`${data.message}`);
                            emit("on-update", {
                                flashcard_id: data.data.flashcard_id,
                                question: data.data.question,
                                answer: data.data.answer,
                            });
                            enteredQuestion.value = "";
                            enteredAnswer.value = "";
                            emit("close");
                        })
                        .catch((err) => {
                            error.value = err;
                        });
                };

                return {
                    enteredQuestion,
                    enteredAnswer,
                    error,
                    submitForm,
                    addFlashcard,
                    updateFlashcard,
                };
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
            setup(props, { emit }) {
                const status = ref(false);
                const showOrHide = computed(() =>
                    status.value ? "Hide Answer" : "Show Answer"
                );

                const toggleAnswer = () => (status.value = !status.value);

                const displayUpdateForm = () => {
                    emit("update-form");
                };

                const deleteFlashcard = () => {
                    fetch(
                        `http://scholarly.local/wp-json/flashcard/v1/delete/${props.flashcard_id}`,
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
                            emit("delete-flashcard");
                        })
                        .catch((err) => {
                            alert(err);
                            console.log(err);
                        });
                };

                return {
                    status,
                    showOrHide,
                    toggleAnswer,
                    displayUpdateForm,
                    deleteFlashcard,
                };
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
