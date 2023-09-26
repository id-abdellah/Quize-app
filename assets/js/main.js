/* ------- elements References -------- */

/* cards display */

const choosingPhase = document.querySelector(".choosing_phase");
const quizePhase = document.querySelector(".quize_phase");
const quizeResult = document.querySelector(".quize_result");


// Choosing Phase elements

const categorySelect = document.querySelector(".choosing_phase select#category");
const nOfQuestion = document.querySelector(".choosing_phase select#nmbrOfQuestions");
const nextStepBtn = document.querySelector(".choosing_phase button");



// quize phase elements 

const timeLeft = document.querySelector(".quize_phase .header .time_lefting_box span:last-child");
const theQuestion = document.querySelector(".quize_phase .body .question");
const answersList = document.querySelector(".quize_phase .body .answers_list");

const currentQuestionCount = document.querySelector(".quize_phase .footer .counter span:first-child");
const allQuestionsCount = document.querySelector(".quize_phase .footer .counter span:last-child");

const nextQuestion = document.querySelector(".next_que");


/* result */
const answerdQCounted = document.querySelector(".quize_result .ur_answers");
const retake = document.querySelector(".quize_result button");

/* ----------- Logic -------------- */

cardDisplay(choosingPhase); // its displayed by default


nextStepBtn.addEventListener("click", (e) => {
    let category = categorySelect.value;
    let numberOfQuestion = nOfQuestion.value;

    getQuizeData(category, numberOfQuestion);

    let quizeCountDown = setInterval(() => {
        timeLeft.innerHTML -= 1;
        if (timeLeft.innerHTML == 0) {
            nextQuestion.classList.add("hasAnswerd")
            nextQuestion.click();
            timeLeft.innerHTML = 40;
        }
    }, 1000);

    currentQuestionCount.innerHTML = 1;
}, { once: true })





/* ---------------- functions ---------------- */

function getQuizeData(category, limit) {
    let myRequest = new XMLHttpRequest();
    myRequest.open("GET", `https://quizapi.io/api/v1/questions?apiKey=jOrR3M4gLdVlDR6h9Seyy6huDE5MzT9SXfFJyGow&category=${category != "any" ? category : "code"}&limit=${limit}`);
    myRequest.send();

    myRequest.onreadystatechange = () => {
        if (myRequest.readyState === 4 && myRequest.status === 200) {

            cardDisplay(quizePhase);
            // main var for fetched quize data
            let quizeData = JSON.parse(myRequest.responseText);
            console.log(quizeData)
            let currentQi = 0;
            allQuestionsCount.innerHTML = quizeData.length;
            setQuetions(currentQi, quizeData);

            let youAlreadyChosed = false;

            nextQuestion.addEventListener("click", () => {
                if (nextQuestion.classList.contains("hasAnswerd") == false) return;
                timeLeft.innerHTML = 40;
                nextQuestion.classList.remove("hasAnswerd");
                // check if quize questions are finished
                if (currentQuestionCount.textContent == allQuestionsCount.textContent) {
                    cardDisplay(quizeResult);
                    answerdQCounted.style.color = `${correctAnswersCount < (quizeData.length / 2) ? "red" : "green"}`;
                    answerdQCounted.innerHTML = `${correctAnswersCount} / ${allQuestionsCount.innerHTML}`;
                    return;
                } else {
                    currentQi += 1;
                }
                // make it "false" for gain ability to answer in the next question
                youAlreadyChosed = false;
                // clear answers li's
                answersList.innerHTML = "";
                // increming question count
                currentQuestionCount.innerHTML++;
                // set Questions 
                setQuetions(currentQi, quizeData);
            });

            let correctAnswersCount = 0;

            document.documentElement.addEventListener("click", (e) => {
                let target = e.target;
                if (target.classList.contains("suggAnswer")) {
                    if (youAlreadyChosed) return;
                    // 
                    nextQuestion.classList.add("hasAnswerd")
                    // make it "true" for avoid multiple answers
                    youAlreadyChosed = true;
                    // check if the chosen answer is correct or not
                    if (quizeData[currentQi].correct_answers[`${getKeyByValue(quizeData[currentQi].answers, target.textContent)}_correct`] == "true") {
                        target.classList.add("right")
                        correctAnswersCount++
                    } else {
                        target.classList.add("wrong")
                    }
                    console.log(correctAnswersCount)
                }
            })
        }
    };
}

retake.addEventListener("click", () => {
    window.location.reload()
})

/* ------------------- */

function setQuetions(i, data) {
    let qObject = data[i];
    let qObjectAnswers = data[i].answers;

    theQuestion.textContent = qObject.question;

    for (let ans in qObjectAnswers) {
        if (qObjectAnswers[ans] == null) {
            delete qObjectAnswers[ans];
        }
    }

    for (let ans in qObjectAnswers) {
        const li = document.createElement("li");
        li.className = "suggAnswer"
        li.textContent = qObjectAnswers[ans];
        answersList.appendChild(li)
    };
}

function cardDisplay(card) {
    [choosingPhase, quizePhase, quizeResult].forEach(card => {
        card.style.display = "none";
    })
    card.style.display = "block";
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key =>
        object[key] === value
    );
}