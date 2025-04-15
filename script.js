const shapes = [
  { name: "círculo", class: "circle" },
  { name: "quadrado", class: "square" },
  { name: "triângulo", class: "triangle" },
];

const colors = [
  { name: "vermelho", value: "red" },
  { name: "azul", value: "blue" },
  { name: "verde", value: "green" },
  { name: "amarelo", value: "gold" },
];

const promptEl = document.getElementById("prompt");
const repeatBtn = document.getElementById("repeat-btn");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const soundSuccess = document.getElementById("sound-success");
const soundError = document.getElementById("sound-error");

let currentAnswer = null;
let currentInstruction = "";
let isSpeaking = false;
let score = 0;
let correctAnswers = 0;
const MAX_STARS = 5;

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function speak(text) {
  if (!('speechSynthesis' in window)) {
    console.warn("Síntese de fala não suportada no navegador");
    return;
  }
  
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "pt-BR";
  
  if (isSpeaking) {
    speechSynthesis.cancel();
  }
  
  isSpeaking = true;
  utter.onend = () => {
    isSpeaking = false;
  };
  
  speechSynthesis.speak(utter);
}

function createBubbles() {
  const mainEl = document.querySelector('main');
  const bubbleCount = 8;
  
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 60 + 20;
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    bubble.style.left = `${Math.random() * 90}%`;
    bubble.style.top = `${Math.random() * 90}%`;
    
    bubble.style.animationDuration = `${Math.random() * 10 + 10}s`;
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    
    mainEl.appendChild(bubble);
  }
}

function updateStars() {
  const starsContainer = document.querySelector('.stars-container');
  if (!starsContainer) return;
  
  const stars = starsContainer.querySelectorAll('.star');
  const starsToActivate = Math.min(correctAnswers, MAX_STARS);
  
  for (let i = 0; i < stars.length; i++) {
    if (i < starsToActivate) {
      stars[i].classList.add('active');
    } else {
      stars[i].classList.remove('active');
    }
  }
}

function newRound() {
  feedbackEl.classList.remove("show", "success", "error");
  feedbackEl.textContent = "";

  const shape = getRandomItem(shapes);
  const color = getRandomItem(colors);
  currentAnswer = `${shape.class}-${color.value}`;
  currentInstruction = `Toque no ${shape.name} ${color.name}`;

  promptEl.textContent = capitalize(shape.name) + " " + color.name;
  speak(currentInstruction);

  optionsEl.innerHTML = "";

  const options = new Set();
  
  while (options.size < 4) {
    const s = getRandomItem(shapes);
    const c = getRandomItem(colors);
    const id = `${s.class}-${c.value}`;
    options.add(id);
  }

  const optionsArray = Array.from(options);
  
  if (!optionsArray.includes(currentAnswer)) {
    optionsArray[Math.floor(Math.random() * 4)] = currentAnswer;
  }

  optionsArray.forEach((id) => {
    const [shapeClass, color] = id.split("-");
    const el = document.createElement("div");
    el.className = `shape ${shapeClass}`;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${getShapeName(shapeClass)} ${getColorName(color)}`);
    el.setAttribute("tabindex", "0");
    
    if (shapeClass === "triangle") {
      el.style.borderBottomColor = color;
    } else {
      el.style.backgroundColor = color;
    }

    el.onclick = () => handleSelection(id, el);
    el.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleSelection(id, el);
      }
    };

    optionsEl.appendChild(el);
  });
}

function handleSelection(id, element) {
  if (id === currentAnswer) {
    score += 10;
    correctAnswers++;
    updateStars();
    
    feedbackEl.textContent = ["Muito bem!", "Parabéns!", "Ótimo trabalho!", "Excelente!"][Math.floor(Math.random() * 4)];
    feedbackEl.classList.add("show", "success");
    element.style.transform = "scale(1.2) rotate(10deg)";
    
    try {
      soundSuccess.play();
    } catch (error) {
      console.warn("Não foi possível tocar o som de sucesso", error);
    }
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(newRound, 1800);
  } else {
    feedbackEl.textContent = "Tente de novo!";
    feedbackEl.classList.add("show", "error");
    element.style.transform = "scale(0.9)";
    setTimeout(() => {
      element.style.transform = "";
    }, 400);
    
    try {
      soundError.play();
    } catch (error) {
      console.warn("Não foi possível tocar o som de erro", error);
    }
  }
}

function getShapeName(shapeClass) {
  const shape = shapes.find(s => s.class === shapeClass);
  return shape ? shape.name : shapeClass;
}

function getColorName(colorValue) {
  const color = colors.find(c => c.value === colorValue);
  return color ? color.name : colorValue;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function initGame() {
  // Criar contêiner de estrelas para gamificação
  const starsContainer = document.createElement('div');
  starsContainer.className = 'stars-container';
  
  // Adicionar estrelas
  for (let i = 0; i < MAX_STARS; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    starsContainer.appendChild(star);
  }
  
  // Inserir antes do feedback
  document.querySelector('main').insertBefore(starsContainer, feedbackEl);
  
  // Criar bolhas decorativas
  createBubbles();
  
  // Iniciar novo round
  newRound();
}

repeatBtn.addEventListener("click", () => {
  speak(currentInstruction);
  repeatBtn.classList.add('animate');
  setTimeout(() => repeatBtn.classList.remove('animate'), 300);
});

document.addEventListener('DOMContentLoaded', () => {
    if (soundSuccess) {
        soundSuccess.load();
    }
    if (soundError) {
        soundError.load();
    }
    initGame();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'r') {
    speak(currentInstruction);
  }
});
