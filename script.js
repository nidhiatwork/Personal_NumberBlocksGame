// Game State
let quizActive = false;
let currentQuestion = 0;
let totalQuestions = 10;
let starsEarned = 0;
let currentProblem = {};
let showingVisual = false;

// Color palette for blocks
const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
    '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff',
    '#48dbfb', '#1dd1a1', '#feca57', '#ee5a6f'
];

// Difficulty levels - from simple to hard
const difficultyLevels = [
    // Easy (1-3)
    { max1: 5, max2: 5, difficulty: 'Easy' },
    { max1: 10, max2: 5, difficulty: 'Easy' },
    { max1: 10, max2: 10, difficulty: 'Easy' },

    // Medium (4-6)
    { max1: 10, max2: 20, difficulty: 'Medium' },
    { max1: 20, max2: 20, difficulty: 'Medium' },
    { max1: 50, max2: 10, difficulty: 'Medium' },

    // Hard (7-10)
    { max1: 100, max2: 10, difficulty: 'Hard' },
    { max1: 50, max2: 50, difficulty: 'Hard' },
    { max1: 100, max2: 100, difficulty: 'Hard' },
    { max1: 1000, max2: 10, difficulty: 'Very Hard' }
];

// DOM Elements
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const resultEl = document.getElementById('result');
const questionEl = document.getElementById('question-number');
const scoreEl = document.getElementById('score');
const answerButtonsEl = document.getElementById('answer-buttons');
const feedbackEl = document.getElementById('feedback');
const blocksContainer = document.getElementById('blocks-container');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextBtn = document.getElementById('next-btn');
const startQuizBtn = document.getElementById('start-quiz-btn');
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
    startQuizBtn.addEventListener('click', startQuiz);
}

// Show start screen
function showStartScreen() {
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    startQuizBtn.style.display = 'block';
}

// Start quiz
function startQuiz() {
    quizActive = true;
    currentQuestion = 0;
    starsEarned = 0;
    startQuizBtn.style.display = 'none';
    quizContainer.style.display = 'block';
    resultsContainer.style.display = 'none';
    generateProblem();
    updateDisplay();
    playSound('start');
}

// Generate a new problem with diverse difficulty
function generateProblem() {
    // Select difficulty based on question number
    const difficultyIndex = Math.min(currentQuestion, difficultyLevels.length - 1);
    const difficulty = difficultyLevels[difficultyIndex];

    // Generate random numbers within difficulty range
    const num1 = Math.floor(Math.random() * difficulty.max1) + 1;
    const num2 = Math.floor(Math.random() * difficulty.max2) + 1;
    const correctAnswer = num1 * num2;

    // Generate wrong answers
    const wrongAnswers = generateWrongAnswers(correctAnswer, num1, num2);
    const answers = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    currentProblem = {
        num1,
        num2,
        correctAnswer,
        answers,
        answered: false,
        difficulty: difficulty.difficulty
    };

    renderProblem();
}

// Generate plausible wrong answers
function generateWrongAnswers(correct, num1, num2) {
    const wrong = new Set();

    // Common mistakes
    wrong.add(correct * 10);
    wrong.add(correct / 10);
    wrong.add(num1 + num2);
    wrong.add(correct + num1);
    wrong.add(correct - num1);

    // Random variations
    while (wrong.size < 3) {
        const variation = correct * (0.5 + Math.random() * 1.5);
        const rounded = Math.round(variation / 10) * 10;
        if (rounded !== correct && rounded > 0) {
            wrong.add(rounded);
        }
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

    // For large numbers, show simplified representation
    if (num1 * num2 > 10000) {
        showSimplifiedVisual(num1, num2);
    } else {
        showFullVisual(num1, num2);
    }
}

// Show full visual for smaller numbers
function showFullVisual(num1, num2) {
    let blockIndex = 0;

    // Create groups of num1 blocks, repeated num2 times
    for (let group = 0; group < num2; group++) {
        setTimeout(() => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'block-group';

            const blocksToShow = Math.min(num1, 100); // Cap at 100 for performance
            const blockSize = blocksToShow <= 10 ? 'large' : 'small';

            for (let i = 0; i < blocksToShow; i++) {
                const block = document.createElement('div');
                block.className = 'block';
                block.style.backgroundColor = colors[group % colors.length];
                block.style.animationDelay = `${i * 0.05}s`;

                if (blocksToShow <= 20) {
                    block.textContent = blockIndex + 1;
                }

                groupDiv.appendChild(block);
                blockIndex++;
            }

            if (blocksToShow < num1) {
                const label = document.createElement('div');
                label.style.cssText = 'font-weight: bold; color: #333; padding: 5px;';
                label.textContent = `(${num1} blocks)`;
                groupDiv.appendChild(label);
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
