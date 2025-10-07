import './style.css'

// Game state
let currentQuestion = 1;
const totalQuestions = 5;
let score = 0;
let num1, num2;
let factors1, factors2, commonFactors, hcf;
let droppedFactors = [];

// Initialize the game
function init() {
  generateNewQuestion();
  setupEventListeners();
  updateUI();
}

// Generate random numbers and calculate factors
function generateNewQuestion() {
  // Generate two random numbers between 10 and 100
  num1 = Math.floor(Math.random() * 91) + 10;
  num2 = Math.floor(Math.random() * 91) + 10;

  // Calculate factors
  factors1 = getFactors(num1);
  factors2 = getFactors(num2);

  // Find common factors
  commonFactors = factors1.filter(f => factors2.includes(f));

  // HCF is the largest common factor
  hcf = Math.max(...commonFactors);

  // Reset dropped factors
  droppedFactors = [];

  // Update display
  displayQuestion();
}

// Get all factors of a number
function getFactors(num) {
  const factors = [];
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) {
      factors.push(i);
    }
  }
  return factors;
}

// Display the current question
function displayQuestion() {
  document.getElementById('num1').textContent = num1;
  document.getElementById('num2').textContent = num2;
  document.getElementById('factors-num1').textContent = num1;
  document.getElementById('factors-num2').textContent = num2;

  // Clear and populate factor lists
  const list1 = document.getElementById('factors-list-1');
  const list2 = document.getElementById('factors-list-2');
  const dropZone = document.getElementById('drop-zone');

  list1.innerHTML = '';
  list2.innerHTML = '';
  dropZone.innerHTML = '<p class="drop-hint">Drop common factors here</p>';

  factors1.forEach(factor => {
    const tile = createFactorTile(factor, 1);
    list1.appendChild(tile);
  });

  factors2.forEach(factor => {
    const tile = createFactorTile(factor, 2);
    list2.appendChild(tile);
  });

  // Hide result and next button
  document.getElementById('result-message').classList.add('hidden');
  document.getElementById('next-btn').classList.add('hidden');
}

// Create a draggable factor tile
function createFactorTile(factor, listNumber) {
  const tile = document.createElement('div');
  tile.className = 'factor-tile';
  tile.textContent = factor;
  tile.draggable = true;
  tile.dataset.factor = factor;
  tile.dataset.list = listNumber;

  // Drag events
  tile.addEventListener('dragstart', handleDragStart);
  tile.addEventListener('dragend', handleDragEnd);

  return tile;
}

// Drag and drop handlers
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  e.target.closest('.drop-zone')?.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.target.closest('.drop-zone')?.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  const dropZone = e.target.closest('.drop-zone');
  if (dropZone) {
    dropZone.classList.remove('drag-over');

    const factor = parseInt(draggedElement.dataset.factor);

    // Check if it's a common factor
    if (commonFactors.includes(factor)) {
      // Check if already dropped
      if (!droppedFactors.includes(factor)) {
        playSound('correct');
        droppedFactors.push(factor);

        // Remove hint text if present
        const hint = dropZone.querySelector('.drop-hint');
        if (hint) hint.remove();

        // Create new tile in drop zone
        const newTile = document.createElement('div');
        newTile.className = 'factor-tile';
        newTile.textContent = factor;
        dropZone.appendChild(newTile);

        // Remove from original list
        draggedElement.remove();

        // Check if all common factors are found
        checkCompletion();
      }
    } else {
      playSound('incorrect');
      showTemporaryMessage('error', '❌ Not a common factor! Try again.');
    }
  }

  return false;
}

// Check if all common factors are collected
function checkCompletion() {
  droppedFactors.sort((a, b) => a - b);
  commonFactors.sort((a, b) => a - b);

  if (droppedFactors.length === commonFactors.length) {
    // Success!
    playSound('success');
    score += 10;
    updateUI();

    const message = `✅ Great! The HCF of ${num1} and ${num2} is ${hcf}!`;
    showMessage('success', message);
    document.getElementById('next-btn').classList.remove('hidden');

    // Show confetti
    createConfetti();
  }
}

// Show result message
function showMessage(type, text) {
  const messageEl = document.getElementById('result-message');
  messageEl.className = `result-message ${type}`;
  messageEl.textContent = text;
}

// Show temporary message
function showTemporaryMessage(type, text) {
  const messageEl = document.getElementById('result-message');
  messageEl.className = `result-message ${type}`;
  messageEl.textContent = text;

  setTimeout(() => {
    messageEl.classList.add('hidden');
  }, 2000);
}

// Hint button handler
function showHint() {
  playSound('hint');

  // Highlight all common factors still in the lists
  const tiles = document.querySelectorAll('.factor-tile');
  tiles.forEach(tile => {
    const factor = parseInt(tile.dataset.factor);
    if (commonFactors.includes(factor) && !droppedFactors.includes(factor)) {
      tile.classList.add('hint-glow');
      setTimeout(() => {
        tile.classList.remove('hint-glow');
      }, 3000);
    }
  });
}

// Next question handler
function nextQuestion() {
  if (currentQuestion < totalQuestions) {
    currentQuestion++;
    updateUI();
    generateNewQuestion();
  } else {
    // Game over
    showMessage('success', `🎉 Game Complete! Final Score: ${score}/${totalQuestions * 10}`);
    document.getElementById('next-btn').textContent = '🔄 Play Again';
    document.getElementById('next-btn').onclick = resetGame;
  }
}

// Reset game
function resetGame() {
  currentQuestion = 1;
  score = 0;
  updateUI();
  document.getElementById('next-btn').textContent = 'Next Question ➡️';
  document.getElementById('next-btn').onclick = nextQuestion;
  generateNewQuestion();
}

// Update UI elements
function updateUI() {
  document.getElementById('current-question').textContent = currentQuestion;
  document.getElementById('total-questions').textContent = totalQuestions;
  document.getElementById('score').textContent = score;
}

// Create confetti animation
function createConfetti() {
  const container = document.getElementById('confetti-container');
  const emojis = ['🎉', '🎊', '⭐', '✨', '🌟'];

  for (let i = 0; i < 30; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
}

// Sound effects using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.value = 0.1;

  if (type === 'correct') {
    oscillator.frequency.value = 523.25; // C5
    oscillator.type = 'sine';
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'incorrect') {
    oscillator.frequency.value = 200; // Lower tone
    oscillator.type = 'square';
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } else if (type === 'hint') {
    oscillator.frequency.value = 800; // Higher tone
    oscillator.type = 'sine';
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (type === 'success') {
    // Play a little tune
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.15);
      osc.start(audioContext.currentTime + i * 0.15);
      osc.stop(audioContext.currentTime + i * 0.15 + 0.15);
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  const dropZone = document.getElementById('drop-zone');
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragenter', handleDragEnter);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);

  document.getElementById('hint-btn').addEventListener('click', showHint);
  document.getElementById('next-btn').addEventListener('click', nextQuestion);
}

// Start the game when DOM is loaded
init();
