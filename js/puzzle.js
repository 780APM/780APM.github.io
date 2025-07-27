document.addEventListener('DOMContentLoaded', function() {
  const answerInput = document.getElementById('puzzle-answer');
  const submitButton = document.getElementById('submit-answer');
  const feedback = document.getElementById('puzzle-feedback');
  const emailReveal = document.getElementById('email-reveal');
  
  const correctAnswer = 'coventry university';
  let attempts = 0;
  
  function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    attempts++;
    
    if (userAnswer === correctAnswer) {
      feedback.textContent = 'Correct! Email address revealed.';
      feedback.className = 'puzzle-feedback correct';
      emailReveal.style.display = 'block';
      answerInput.disabled = true;
      submitButton.disabled = true;
    } else {
      if (attempts >= 3) {
        feedback.textContent = 'Hint: Try "C_______ U_________" (include the word "University")';
        feedback.className = 'puzzle-feedback hint';
      } else {
        feedback.textContent = `Incorrect. Try again! (Attempt ${attempts}/3)`;
        feedback.className = 'puzzle-feedback incorrect';
      }
      answerInput.value = '';
      answerInput.focus();
    }
  }
  
  submitButton.addEventListener('click', checkAnswer);
  
  answerInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });
}); 