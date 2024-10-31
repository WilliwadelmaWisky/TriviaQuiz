"use strict"

const scoreSection = document.getElementById("score-section");
const answerSection = document.getElementById("answer-section");
const requestSection = document.getElementById("request-section");
const feedbackSection = document.getElementById("feedback-section");

scoreSection.classList.add("hidden");
answerSection.classList.add("hidden");
feedbackSection.classList.add("hidden");

let results;
let currentIndex;
let selectedAnswers;

window.addEventListener("load",  (e) => {
    const requestForm = document.forms["request"];
    requestForm.addEventListener("submit", onRequestSubmit);

    const answerForm = document.forms["answer"];
    answerForm.addEventListener("submit", onAnswerSubmit);
});


/**
 * 
 * @param {Event} e 
 */
const onRequestSubmit = async (e) => {
    e.preventDefault();
    
    const url = constructRequestURL();
    const data = await requestQuiz(url);
    if (data.response_code !== 0) {
        console.log("ERROR: request failed");
        return;
    }

    console.log(data.results);
    answerSection.classList.remove("hidden");
    scoreSection.classList.add("hidden");
    requestSection.classList.add("hidden");
    results = data.results;
    selectedAnswers = [];

    e.target.reset();
    showQuestion(0);
};

/**
 * 
 * @return {String}
 */
const constructRequestURL = () => {
    const requestForm = document.forms["request"];

    let url = "https://opentdb.com/api.php";
    const amount = requestForm.elements["amount"].value;
    url += `?amount=${amount}&type=multiple`;

    const category = requestForm.elements["category"].value;
    if (category !== "0") {
        url += `&category=${category}`;
    }

    const difficulty = requestForm.elements["difficulty"].value;
    if (difficulty !== "0") {
        url += `&difficulty=${difficulty}`;
    }

    return url;
};

/**
 * 
 * @param {String} url 
 * @return {Object}
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
 * 
 * @param {Event} e 
 */
const onAnswerSubmit = (e) => {
    e.preventDefault();

    const answerForm = document.forms["answer"];
    const answers = Array.from(answerForm.elements["answer"]);
    const selected = answers.filter(input => input.checked)[0];
    selectedAnswers.push(selected.value);

    if (currentIndex == results.length - 1) {
        showResults();
        return;
    }

    answerForm.reset();
    showQuestion(currentIndex + 1);
};

/**
 * 
 * @param {Number} index 
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
 * @param {Array<String>} array 
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
 * 
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
 * 
 * @return {Number}
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
 * 
 * @param {Number} index 
 * @return {HTMLTableRowElement}
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
