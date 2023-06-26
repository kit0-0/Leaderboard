import './index.css';
// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('An error occurred:', error);
  document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
};

// Helper function to make API requests
const makeApiRequest = async (url, method, body) => {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const { result } = await response.json();
    return result;
  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Create a new game and save the game ID
const createGame = async (gameName) => {
  try {
    const response = await makeApiRequest('https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/', 'POST', {
      name: gameName,
    });

    const gameId = response.split(' ')[3];
    localStorage.setItem('gameId', gameId);
  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Retrieve the game ID from local storage
const getGameId = () => localStorage.getItem('gameId');

// Retrieve all scores for the game
const getScores = async () => {
  const gameId = getGameId();

  try {
    const response = await makeApiRequest(`https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${gameId}/scores/`, 'GET');
    return response;
  } catch (error) {
    handleApiError(error);
    return []; // Return an empty array to indicate no scores available
  }
};

// Save a score for the game
const saveScore = async (userName, score) => {
  const gameId = getGameId();

  // Validate user input
  if (!userName || !score || Number.isNaN(parseInt(score, 10))) {
    // Invalid input, handle the error appropriately
    return;
  }

  try {
    await makeApiRequest(`https://us-central1-js-capstone-backend.cloudfunctions.net/api/games/${gameId}/scores/`, 'POST', {
      user: userName,
      score: parseInt(score, 10),
    });
  } catch (error) {
    handleApiError(error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// Refresh scores and update the UI
const refreshScores = async () => {
  const scoresContainer = document.getElementById('scores-container');
  scoresContainer.innerHTML = '';

  try {
    const scores = await getScores();

    if (scores.length === 0) {
      const noScoresMessage = document.createElement('p');
      noScoresMessage.textContent = 'Lets start';
      scoresContainer.appendChild(noScoresMessage);
    } else {
      scores.forEach(({ user, score }) => {
        const listItem = document.createElement('li');
        const playerNameSpan = document.createElement('span');
        playerNameSpan.textContent = user;
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = score;
        listItem.appendChild(playerNameSpan);
        listItem.appendChild(scoreSpan);
        scoresContainer.appendChild(listItem);
      });
    }
  } catch (error) {
    handleApiError(error);
  }
};

// Event listener for the Refresh button
const refreshButton = document.getElementById('refresh-button');
refreshButton.addEventListener('click', refreshScores);

// Event listener for the Submit button
const submitForm = document.querySelector('form');
submitForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const { Player: userName, score } = submitForm.elements;

  saveScore(userName.value, score.value);
  submitForm.reset();
  refreshScores();
});

// Create a new game and initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  const gameName = 'My Awesome Game';
  try {
    await createGame(gameName);
    await refreshScores();
  } catch (error) {
    handleApiError(error);
  }
});
