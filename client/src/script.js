import bot from '../assets/bot.svg';
import user from '../assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loadMessage(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 400)
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      clearInterval(interval)
    };
  }, 20)
}

function generateUniqueID() {
  let timeStamp = Date.now();
  let randomNumber = Math.random();
  let hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueID) {
  return `
  <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
      <div class="profile">
        <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}"/>
      </div>
      <div class="message" id=${uniqueID}>
      ${value}
      </div>
    </div>
  </div>
  `
}

const handleSubmit = async (event) => {
  event.preventDefault();

  const data = new FormData(form);
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset();

  const uniqueBotID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, '', uniqueBotID);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueBotID);
  loadMessage(messageDiv);

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    }),
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  }
  else {
    const error = await response.text();
    console.log(error);
    messageDiv.innerHTML = 'Something went wrong';
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') handleSubmit
})