"use strict"

const scoreSection = document.getElementById("score-section");
const answerSection = document.getElementById("answer-section");
const requestSection = document.getElementById("request-section");

scoreSection.classList.add("hidden");
answerSection.classList.add("hidden");

let results;
let currentIndex;
let selectedAnswers;

/**
 * On window load
 */
window.addEventListener("load",  (e) => {
    const requestForm = document.forms["request"];
    requestForm.addEventListener("submit", onRequestSubmit);

    const answerForm = document.forms["answer"];
    answerForm.addEventListener("submit", onAnswerSubmit);
});

/**
 * On logo click
 */
document.getElementById("logo").addEventListener("click", (e) => {
    window.location.reload();
});


/**
 * Submit event-listener, on quiz request form
 * @param {Event} e - Submit event
 */
const onRequestSubmit = async (e) => {
    e.preventDefault();
    
    const url = constructRequestURL();
    const data = await requestQuiz(url);
    if (data.response_code !== 0) {
        console.error("ERROR: request failed");
        return;
    }

    answerSection.classList.remove("hidden");
    scoreSection.classList.add("hidden");
    requestSection.classList.add("hidden");
    results = data.results;
    selectedAnswers = [];

    e.target.reset();
    showQuestion(0);
};

/**
 * Construct an url for fetching a quiz from OpenTriviaDB.
 * Uses data from quiz request form.
 * @return {String} Constructed url
 */
const constructRequestURL = () => {
    const requestForm = document.forms["request"];

    let url = "https://opentdb.com/api.php";
    const amount = requestForm.elements["amount"].value;
    url += `?amount=${amount}&type=multiple`;
    const category = requestForm.elements["category"].value;
    if (category !== "0") { url += `&category=${category}`; }
    const difficulty = requestForm.elements["difficulty"].value;
    if (difficulty !== "0") { url += `&difficulty=${difficulty}`; }

    return url;
};

/**
 * Requests a quiz from OpenTriviaDB.
 * If request fails response object is `{ response_code: -1 }`.
 * @param {String} url - Quiz request url
 * @return {Object} - Quiz response object
 */
const requestQuiz = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        return { "response_code": -1 };
    }

    const data = await response.json();
    return data;
};


/**
 * Submit event-listener, on answer question form.
 * @param {Event} e - Submit event
 */
const onAnswerSubmit = (e) => {
    e.preventDefault();

    const answerForm = document.forms["answer"];
    const answers = Array.from(answerForm.elements["answer"]);
    const selected = answers.filter(input => input.checked)[0];
    selectedAnswers.push(selected.value);
    answerForm.reset();

    if (currentIndex == results.length - 1) {
        showResults();
        return;
    }

    showQuestion(currentIndex + 1);
};

/**
 * Shows a question based of the given index.
 * Shuffles the answers.
 * @param {Number} index - Index of the question
 */
const showQuestion = (index) => {
    currentIndex = index;
    document.getElementById("title").innerHTML = `${results[index].category} (${index + 1}/${results.length})`;
    document.getElementById("question").innerHTML = results[index].question;

    const answers = [results[index].correct_answer, ...results[index].incorrect_answers];
    shuffle(answers);

    const answerForm = document.forms["answer"];
    Array.from(answerForm.elements["answer"]).forEach((input, i) => {
        input.value = answers[i];
        const span = input.previousElementSibling;
        span.innerHTML = answers[i];
    });
};

/**
 * Durstenfeld shuffle
 * see: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {Array<String>} array - Array to shuffle
 */
const shuffle = (array) => {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
};


/**
 * Shows the results of the quiz.
 * Shows a score and a table of the correct/answered questions.
 */
const showResults = () => {
    const score = calculateScore();
    document.getElementById("score").textContent = `Score (${score}/${results.length})`;

    const tbody = document.querySelector("tbody");
    tbody.replaceChildren();
    for (let i = 0; i < results.length; i++) {
        const tr = createResultTableRow(i);
        tbody.appendChild(tr);
    }

    scoreSection.classList.remove("hidden");
    requestSection.classList.remove("hidden");
    answerSection.classList.add("hidden");
};

/**
 * Calculates a score.
 * @return {Number} Score of the quiz
 */
const calculateScore = () => {
    let score = 0;
    for (let i = 0; i < results.length; i++) {
        if (selectedAnswers[i] === results[i].correct_answer) {
            score += 1;
        }
    }

    return score;
};

/**
 * Creates a table row to show correct/answered questions.
 * @param {Number} index - Index of the question
 * @return {HTMLTableRowElement} Created table row element
 */
const createResultTableRow = (index) => {
    const tr = document.createElement("tr");
    const indexTH = document.createElement("th");
    indexTH.textContent = `${index + 1}`;
    tr.appendChild(indexTH);

    const questionTD = document.createElement("td");
    questionTD.innerHTML = results[index].question;
    tr.appendChild(questionTD);

    const correctTD = document.createElement("td");
    correctTD.innerHTML = results[index].correct_answer;
    tr.appendChild(correctTD);

    const indicatorTD = document.createElement("td");
    indicatorTD.innerHTML = (selectedAnswers[index] === results[index].correct_answer) ? "&#x2713;" : "&#x2717;";
    indicatorTD.className = (selectedAnswers[index] === results[index].correct_answer) ? "correct" : "incorrect";
    tr.appendChild(indicatorTD);

    const answeredTD = document.createElement("td");
    answeredTD.innerHTML = selectedAnswers[index];
    tr.appendChild(answeredTD);
    return tr;
};
