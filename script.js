// Game State
let currentLevel = 1;
let currentScore = 0;
let currentProblem = {};
let showingVisual = false;

// Color palette for blocks
const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731',
    '#5f27cd', '#00d2d3', '#ff9ff3', '#54a0ff',
    '#48dbfb', '#1dd1a1', '#feca57', '#ee5a6f'
];

// Level configurations
const levels = [
    { num1: 10, num2: 10, name: "Ten Times Ten" },
    { num1: 10, num2: 100, name: "Ten Times Hundred" },
    { num1: 100, num2: 10, name: "Hundred Times Ten" },
    { num1: 10, num2: 1000, name: "Ten Times Thousand" },
    { num1: 100, num2: 100, name: "Hundred Times Hundred" },
    { num1: 1000, num2: 10, name: "Thousand Times Ten" },
    { num1: 100, num2: 1000, name: "Hundred Times Thousand" },
    { num1: 1000, num2: 100, name: "Thousand Times Hundred" },
    { num1: 1000, num2: 1000, name: "Thousand Times Thousand" },
    { num1: 10000, num2: 10, name: "Ten Thousand Times Ten" },
    { num1: 10000, num2: 100, name: "Big Numbers!" }
];

// DOM Elements
const num1El = document.getElementById('num1');
const num2El = document.getElementById('num2');
const resultEl = document.getElementById('result');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const answerButtonsEl = document.getElementById('answer-buttons');
const feedbackEl = document.getElementById('feedback');
const blocksContainer = document.getElementById('blocks-container');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const toggleVisualBtn = document.getElementById('toggle-visual');
const celebrationEl = document.getElementById('celebration');

// Initialize game
function init() {
    loadProgress();
    generateProblem();
    updateDisplay();
    attachEventListeners();
    playSound('start');
}

// Attach event listeners
function attachEventListeners() {
    showAnswerBtn.addEventListener('click', showAnswer);
    nextBtn.addEventListener('click', nextProblem);
    restartBtn.addEventListener('click', restartGame);
    toggleVisualBtn.addEventListener('click', toggleVisual);
}

// Generate a new problem
function generateProblem() {
    const levelConfig = levels[Math.min(currentLevel - 1, levels.length - 1)];
    const num1 = levelConfig.num1;
    const num2 = levelConfig.num2;
    const correctAnswer = num1 * num2;

    // Generate wrong answers
    const wrongAnswers = generateWrongAnswers(correctAnswer, num1, num2);
    const answers = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    currentProblem = {
        num1,
        num2,
        correctAnswer,
        answers,
        answered: false
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
        feedbackEl.textContent = '🎉 Amazing! You got it! 🎉';
        feedbackEl.className = 'feedback correct';
        currentScore += 10;
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
    scoreEl.textContent = currentScore;

    // Disable all buttons
    const allButtons = answerButtonsEl.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.style.pointerEvents = 'none');

    // Show next button
    showAnswerBtn.style.display = 'none';
    nextBtn.style.display = 'block';

    // Save progress
    saveProgress();
}

// Show answer
function showAnswer() {
    resultEl.textContent = currentProblem.correctAnswer.toLocaleString();
    showVisual();
    playSound('reveal');
}

// Toggle visual blocks
function toggleVisual() {
    if (showingVisual) {
        blocksContainer.innerHTML = '';
        showingVisual = false;
        toggleVisualBtn.textContent = '✨ See the Magic!';
    } else {
        showVisual();
    }
}

// Show visual blocks
function showVisual() {
    if (showingVisual) return;
    showingVisual = true;
    blocksContainer.innerHTML = '';
    toggleVisualBtn.textContent = '🎨 Hide Magic';

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

// Next problem
function nextProblem() {
    // Level up every 3 correct answers
    if (currentScore > 0 && currentScore % 30 === 0 && currentLevel < levels.length) {
        currentLevel++;
        levelEl.textContent = currentLevel;
        feedbackEl.textContent = '🎊 Level Up! 🎊';
        feedbackEl.className = 'feedback correct';
        celebrate();
        playSound('levelup');

        setTimeout(() => {
            generateProblem();
            updateDisplay();
        }, 2000);
    } else {
        generateProblem();
        updateDisplay();
    }
}

// Restart game
function restartGame() {
    if (confirm('Are you sure you want to restart? Your progress will be reset.')) {
        currentLevel = 1;
        currentScore = 0;
        generateProblem();
        updateDisplay();
        saveProgress();
        playSound('start');
    }
}

// Update display
function updateDisplay() {
    levelEl.textContent = currentLevel;
    scoreEl.textContent = currentScore;
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

// Save progress to localStorage
function saveProgress() {
    const progress = {
        level: currentLevel,
        score: currentScore,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('myra-number-blocks-progress', JSON.stringify(progress));
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('myra-number-blocks-progress');
    if (saved) {
        const progress = JSON.parse(saved);
        currentLevel = progress.level || 1;
        currentScore = progress.score || 0;
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);
