// Game State
let quizActive = false;
let currentQuestion = 0;
let totalQuestions = 10;
let starsEarned = 0;
let currentProblem = {};
let showingVisual = false;
let quizType = 'multiplication'; // multiplication, addition, subtraction, division

// Color palette for blocks
const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
    '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff',
    '#48dbfb', '#1dd1a1', '#feca57', '#ee5a6f'
];

// Operator symbols per quiz type
const operatorSymbols = {
    multiplication: '×',
    addition: '+',
    subtraction: '−',
    division: '÷'
};

// Multiplication: orders of tens only
const multiplyLevels = [
    { nums: [2,3,4,5], tens: [10] },
    { nums: [2,3,4,5,6], tens: [10] },
    { nums: [6,7,8,9], tens: [10] },
    { nums: [2,3,4,5], tens: [100] },
    { nums: [6,7,8,9], tens: [100] },
    { nums: [10,20,30], tens: [10] },
    { nums: [2,3,4,5], tens: [1000] },
    { nums: [10,20,30,40,50], tens: [100] },
    { nums: [6,7,8,9], tens: [1000] },
    { nums: [10,20,50,100], tens: [1000] }
];

// Addition: 6-year-old friendly (single digits up to small double digits)
const additionLevels = [
    { max1: 5, max2: 5 },
    { max1: 8, max2: 5 },
    { max1: 9, max2: 9 },
    { max1: 10, max2: 5 },
    { max1: 10, max2: 10 },
    { max1: 12, max2: 8 },
    { max1: 15, max2: 5 },
    { max1: 15, max2: 10 },
    { max1: 20, max2: 10 },
    { max1: 20, max2: 20 }
];

// Subtraction: 6-year-old friendly (result always >= 0)
const subtractionLevels = [
    { max1: 5, maxSub: 3 },
    { max1: 8, maxSub: 5 },
    { max1: 10, maxSub: 5 },
    { max1: 10, maxSub: 8 },
    { max1: 12, maxSub: 8 },
    { max1: 15, maxSub: 10 },
    { max1: 15, maxSub: 12 },
    { max1: 18, maxSub: 10 },
    { max1: 20, maxSub: 15 },
    { max1: 20, maxSub: 18 }
];

// Division: 6-year-old friendly (clean division, no remainders)
const divisionPairs = [
    { pairs: [[2,1],[4,2],[6,2],[6,3]] },
    { pairs: [[8,2],[8,4],[9,3],[10,2]] },
    { pairs: [[10,5],[12,2],[12,3],[12,4]] },
    { pairs: [[14,2],[14,7],[15,3],[15,5]] },
    { pairs: [[16,2],[16,4],[16,8],[18,2]] },
    { pairs: [[18,3],[18,6],[18,9],[20,2]] },
    { pairs: [[20,4],[20,5],[20,10],[24,3]] },
    { pairs: [[24,4],[24,6],[24,8],[25,5]] },
    { pairs: [[30,5],[30,6],[30,10],[36,6]] },
    { pairs: [[40,5],[40,8],[40,10],[50,10]] }
];

// DOM Elements
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const operatorEl = document.getElementById('operator');
const resultEl = document.getElementById('result');
const questionEl = document.getElementById('question-number');
const scoreEl = document.getElementById('score');
const answerButtonsEl = document.getElementById('answer-buttons');
const feedbackEl = document.getElementById('feedback');
const blocksContainer = document.getElementById('blocks-container');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextBtn = document.getElementById('next-btn');
const quizMenu = document.getElementById('quiz-menu');
const celebrationEl = document.getElementById('celebration');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');

// Initialize game
function init() {
    attachEventListeners();
    showStartScreen();
}

// Attach event listeners
function attachEventListeners() {
    showAnswerBtn.addEventListener('click', showAnswer);
    nextBtn.addEventListener('click', nextQuestion);

    // Quiz type buttons
    document.querySelectorAll('.quiz-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            quizType = btn.dataset.type;
            startQuiz();
        });
    });
}

// Show start screen
function showStartScreen() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    quizMenu.style.display = 'flex';
}

// Start quiz
function startQuiz() {
    quizActive = true;
    currentQuestion = 0;
    starsEarned = 0;
    quizMenu.style.display = 'none';
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    operatorEl.textContent = operatorSymbols[quizType];
    generateProblem();
    updateDisplay();
    playSound('start');
}

// Generate a new problem based on quiz type
function generateProblem() {
    const levelIndex = Math.min(currentQuestion, 9);
    let num1, num2, correctAnswer;

    switch (quizType) {
        case 'multiplication':
            const mLevel = multiplyLevels[levelIndex];
            num1 = mLevel.nums[Math.floor(Math.random() * mLevel.nums.length)];
            num2 = mLevel.tens[Math.floor(Math.random() * mLevel.tens.length)];
            // Randomly swap so sometimes tens come first
            if (Math.random() > 0.5) { [num1, num2] = [num2, num1]; }
            correctAnswer = num1 * num2;
            break;

        case 'addition':
            const aLevel = additionLevels[levelIndex];
            num1 = Math.floor(Math.random() * aLevel.max1) + 1;
            num2 = Math.floor(Math.random() * aLevel.max2) + 1;
            correctAnswer = num1 + num2;
            break;

        case 'subtraction':
            const sLevel = subtractionLevels[levelIndex];
            num1 = Math.floor(Math.random() * sLevel.max1) + 2;
            num2 = Math.floor(Math.random() * Math.min(sLevel.maxSub, num1)) + 1;
            correctAnswer = num1 - num2;
            break;

        case 'division':
            const dLevel = divisionPairs[levelIndex];
            const pair = dLevel.pairs[Math.floor(Math.random() * dLevel.pairs.length)];
            num1 = pair[0];
            num2 = pair[1];
            correctAnswer = num1 / num2;
            break;
    }

    // Generate wrong answers
    const wrongAnswers = generateWrongAnswers(correctAnswer, num1, num2);
    const answers = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    currentProblem = {
        num1,
        num2,
        correctAnswer,
        answers,
        answered: false,
        quizType
    };

    renderProblem();
}

// Generate plausible wrong answers based on quiz type
function generateWrongAnswers(correct, num1, num2) {
    const wrong = new Set();

    switch (quizType) {
        case 'multiplication':
            wrong.add(correct * 10);
            if (correct / 10 >= 1) wrong.add(correct / 10);
            wrong.add(num1 + num2);
            wrong.add(correct + num1);
            if (correct - num1 > 0) wrong.add(correct - num1);
            break;

        case 'addition':
            wrong.add(correct + 1);
            wrong.add(correct - 1);
            if (correct + 2 > 0) wrong.add(correct + 2);
            if (correct - 2 > 0) wrong.add(correct - 2);
            wrong.add(num1 * num2);
            break;

        case 'subtraction':
            wrong.add(correct + 1);
            if (correct - 1 >= 0) wrong.add(correct - 1);
            wrong.add(correct + 2);
            wrong.add(num1 + num2);
            if (correct - 2 >= 0) wrong.add(correct - 2);
            break;

        case 'division':
            wrong.add(correct + 1);
            if (correct - 1 >= 0) wrong.add(correct - 1);
            wrong.add(correct + 2);
            wrong.add(num1 - num2);
            wrong.add(num2);
            break;
    }

    // Remove the correct answer and non-positive numbers
    wrong.delete(correct);
    wrong.delete(0);
    wrong.forEach(v => { if (v < 0 || !Number.isInteger(v)) wrong.delete(v); });

    // Fill with random nearby values if needed
    let offset = 3;
    while (wrong.size < 3) {
        const candidate = correct + offset;
        if (candidate > 0 && candidate !== correct && Number.isInteger(candidate)) {
            wrong.add(candidate);
        }
        offset = offset > 0 ? -offset : -offset + 1;
    }

    return Array.from(wrong).slice(0, 3);
}

// Render problem to UI
function renderProblem() {
    num1El.textContent = currentProblem.num1.toLocaleString();
    num2El.textContent = currentProblem.num2.toLocaleString();
    resultEl.textContent = '?';

    // Clear previous state
    answerButtonsEl.innerHTML = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    blocksContainer.innerHTML = '';
    showingVisual = false;

    // Create answer buttons
    currentProblem.answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer.toLocaleString();
        btn.addEventListener('click', () => checkAnswer(answer, btn));
        answerButtonsEl.appendChild(btn);
    });

    // Reset buttons
    showAnswerBtn.style.display = 'block';
    nextBtn.style.display = 'none';
}

// Check if answer is correct
function checkAnswer(selectedAnswer, btnElement) {
    if (currentProblem.answered) return;

    currentProblem.answered = true;
    const isCorrect = selectedAnswer === currentProblem.correctAnswer;

    // Update UI
    if (isCorrect) {
        btnElement.classList.add('correct');
        starsEarned += 10;
        feedbackEl.textContent = '🎉 Amazing! +10 Stars! 🌟';
        feedbackEl.className = 'feedback correct';
        celebrate();
        playSound('correct');

        // Show the visual automatically on correct answer
        setTimeout(() => {
            showVisual();
        }, 500);
    } else {
        btnElement.classList.add('incorrect');
        feedbackEl.textContent = '🤔 Oops! Try again! 🤔';
        feedbackEl.className = 'feedback incorrect';
        playSound('incorrect');
        currentProblem.answered = false; // Allow retry
        return;
    }

    // Update score display
    scoreEl.textContent = `${starsEarned} ⭐`;

    // Disable all buttons
    const allButtons = answerButtonsEl.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.style.pointerEvents = 'none');

    // Show next button
    showAnswerBtn.style.display = 'none';
    nextBtn.style.display = 'block';
}

// Show answer
function showAnswer() {
    resultEl.textContent = currentProblem.correctAnswer.toLocaleString();
    showVisual();
    playSound('reveal');
}

// Show visual blocks
function showVisual() {
    if (showingVisual) return;
    showingVisual = true;
    blocksContainer.innerHTML = '';

    const num1 = currentProblem.num1;
    const num2 = currentProblem.num2;
    const answer = currentProblem.correctAnswer;

    switch (quizType) {
        case 'multiplication':
            if (answer > 10000) {
                showSimplifiedVisual(num1, num2);
            } else {
                showMultiplyVisual(num1, num2);
            }
            break;
        case 'addition':
            showAddSubVisual(num1, num2, answer, '+');
            break;
        case 'subtraction':
            showAddSubVisual(num1, num2, answer, '−');
            break;
        case 'division':
            showDivisionVisual(num1, num2, answer);
            break;
    }
}

// Show visual for addition / subtraction
function showAddSubVisual(num1, num2, answer, op) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = 'text-align:center; padding:15px; font-size:1.3rem; font-weight:bold; color:#333;';

    // Show num1 blocks
    const group1 = document.createElement('div');
    group1.className = 'block-group';
    for (let i = 0; i < Math.min(num1, 25); i++) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.backgroundColor = colors[0];
        block.style.animationDelay = `${i * 0.04}s`;
        block.textContent = i + 1;
        group1.appendChild(block);
    }
    blocksContainer.appendChild(group1);

    // Show operator label
    const opLabel = document.createElement('div');
    opLabel.style.cssText = 'font-size:2rem; font-weight:bold; text-align:center; margin:8px 0; color:#5f27cd;';
    opLabel.textContent = op;
    blocksContainer.appendChild(opLabel);

    // Show num2 blocks
    const group2 = document.createElement('div');
    group2.className = 'block-group';
    for (let i = 0; i < Math.min(num2, 25); i++) {
        const block = document.createElement('div');
        block.className = 'block';
        block.style.backgroundColor = colors[1];
        block.style.animationDelay = `${i * 0.04}s`;
        block.textContent = i + 1;
        group2.appendChild(block);
    }
    blocksContainer.appendChild(group2);

    // Show result
    const resultDiv = document.createElement('div');
    resultDiv.style.cssText = 'font-size:1.8rem; font-weight:bold; text-align:center; margin-top:10px; color:#f5576c;';
    resultDiv.textContent = `= ${answer}`;
    blocksContainer.appendChild(resultDiv);
}

// Show visual for division (split into groups)
function showDivisionVisual(num1, num2, answer) {
    const label = document.createElement('div');
    label.style.cssText = 'font-size:1.2rem; font-weight:bold; text-align:center; color:#555; margin-bottom:8px;';
    label.textContent = `${num1} split into groups of ${num2}:`;
    blocksContainer.appendChild(label);

    for (let g = 0; g < answer; g++) {
        setTimeout(() => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'block-group';
            for (let i = 0; i < num2; i++) {
                const block = document.createElement('div');
                block.className = 'block';
                block.style.backgroundColor = colors[g % colors.length];
                block.style.animationDelay = `${i * 0.05}s`;
                block.textContent = g * num2 + i + 1;
                groupDiv.appendChild(block);
            }
            blocksContainer.appendChild(groupDiv);
        }, g * 250);
    }

    setTimeout(() => {
        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = 'font-size:1.8rem; font-weight:bold; text-align:center; margin-top:10px; color:#f5576c;';
        resultDiv.textContent = `= ${answer} groups`;
        blocksContainer.appendChild(resultDiv);
    }, answer * 250 + 100);
}

// Multiplication visual with block groups
function showMultiplyVisual(num1, num2) {
    let blockIndex = 0;
    const rowCount = Math.min(num2, 10);
    const colCount = Math.min(num1, 20);

    for (let group = 0; group < rowCount; group++) {
        setTimeout(() => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'block-group';

            for (let i = 0; i < colCount; i++) {
                const block = document.createElement('div');
                block.className = 'block';
                block.style.backgroundColor = colors[group % colors.length];
                block.style.animationDelay = `${i * 0.05}s`;
                if (colCount <= 20) block.textContent = blockIndex + 1;
                groupDiv.appendChild(block);
                blockIndex++;
            }

            if (colCount < num1) {
                const lbl = document.createElement('div');
                lbl.style.cssText = 'font-weight:bold; color:#333; padding:5px;';
                lbl.textContent = `(${num1} blocks)`;
                groupDiv.appendChild(lbl);
            }

            blocksContainer.appendChild(groupDiv);
        }, group * 300);
    }
}

// Show simplified visual for large numbers
function showSimplifiedVisual(num1, num2) {
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        padding: 20px;
        color: #333;
        line-height: 1.8;
    `;

    infoDiv.innerHTML = `
        <div style="margin: 20px 0; animation: numberPop 0.6s ease-out;">
            <div style="color: #ff6b6b; font-size: 2rem;">${num1.toLocaleString()}</div>
            <div style="color: #95e1d3; font-size: 1.8rem;">groups of</div>
            <div style="color: #4ecdc4; font-size: 2rem;">${num2.toLocaleString()}</div>
        </div>
        <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 15px; animation: pulse 1s ease-in-out infinite;">
            <div style="color: #f5576c; font-size: 2.5rem;">= ${currentProblem.correctAnswer.toLocaleString()}</div>
        </div>
        <div style="font-size: 1.2rem; color: #555; margin-top: 20px;">
            That's ${countZeros(currentProblem.correctAnswer)} zeros! 🎈
        </div>
    `;

    blocksContainer.appendChild(infoDiv);

    // Add visual representation with fewer blocks
    for (let i = 0; i < Math.min(num2, 5); i++) {
        setTimeout(() => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'block-group';
            groupDiv.style.justifyContent = 'center';

            for (let j = 0; j < Math.min(num1 / 100, 10); j++) {
                const block = document.createElement('div');
                block.className = 'block';
                block.style.backgroundColor = colors[i % colors.length];
                block.style.animationDelay = `${j * 0.05}s`;
                block.style.width = '50px';
                block.style.height = '50px';
                block.textContent = '100';
                groupDiv.appendChild(block);
            }

            blocksContainer.appendChild(groupDiv);
        }, i * 300);
    }
}

// Count zeros in a number
function countZeros(num) {
    return (num.toString().match(/0/g) || []).length;
}

// Next question in quiz
function nextQuestion() {
    currentQuestion++;

    if (currentQuestion >= totalQuestions) {
        // Quiz complete - show results
        showResults();
    } else {
        // Next question
        generateProblem();
        updateDisplay();
    }
}

// Show results screen
function showResults() {
    quizActive = false;
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    const percentage = (starsEarned / (totalQuestions * 10)) * 100;
    let message = '';
    let emoji = '';

    if (percentage === 100) {
        message = 'PERFECT SCORE!';
        emoji = '🏆';
        playSound('levelup');
    } else if (percentage >= 80) {
        message = 'AMAZING JOB!';
        emoji = '🌟';
        playSound('correct');
    } else if (percentage >= 60) {
        message = 'GREAT WORK!';
        emoji = '👏';
        playSound('correct');
    } else {
        message = 'KEEP PRACTICING!';
        emoji = '💪';
        playSound('start');
    }

    document.getElementById('results-emoji').textContent = emoji;
    document.getElementById('results-message').textContent = message;
    document.getElementById('results-stars').textContent = `${starsEarned} out of ${totalQuestions * 10} Stars!`;
    document.getElementById('results-percentage').textContent = `${percentage.toFixed(0)}% Correct`;

    celebrate();
}

// Update display
function updateDisplay() {
    questionEl.textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;
    scoreEl.textContent = `${starsEarned} ⭐`;
}

// Celebration animation
function celebrate() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            celebrationEl.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// Sound effects (using Web Audio API)
function playSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch(type) {
        case 'correct':
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            break;
        case 'incorrect':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            break;
        case 'reveal':
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            break;
        case 'levelup':
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3);
            break;
        case 'start':
            oscillator.frequency.setValueAtTime(392, audioContext.currentTime);
            break;
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}


// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);
