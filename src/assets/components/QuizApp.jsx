import React, { useState, useEffect } from "react";
import "./QuizAppcss.css"; 

const facts = [
  "Honey never spoils. Archaeologists found pots of honey in Egyptian tombs over 3,000 years old that were still good.",
  "Octopuses have three hearts and blue blood.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "Bananas are berries, but strawberries aren't.",
  "Water can boil and freeze at the same time under certain conditions.",
  "There’s enough DNA in your body to stretch from the sun to Pluto and back – 17 times!",
];

function getRandomFact() {
  return facts[Math.floor(Math.random() * facts.length)];
}

function QuizApp() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [randomFact, setRandomFact] = useState(getRandomFact());
  const [timeTaken, setTimeTaken] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [questionLoaded, setQuestionLoaded] = useState(false); // State to track when the question is loaded

  useEffect(() => {
    if (quizStarted) {
      async function startQuiz() {
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
          if (!res.ok) throw new Error("Failed to fetch quiz data");
          const data = await res.json();
          setQuestions(data.results);
        } catch (error) {
          console.error("Error fetching quiz:", error);
        }
      }
      startQuiz();
    }
  }, [quizStarted]);

  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentIndex];
      setShuffledOptions(shuffle([...currentQuestion.incorrect_answers, currentQuestion.correct_answer]));
      setQuestionLoaded(true); // Set to true once the question is loaded
    }
  }, [currentIndex, questions]);

  useEffect(() => {
    if (timerRunning && questionLoaded) { // Only start the timer if the question is loaded
      const timer = setInterval(() => {
        setTimeTaken((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup the timer
    }
  }, [timerRunning, questionLoaded]); // Runs when question is loaded and timer is running

  function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function handleAnswer(answer) {
    if (answer === questions[currentIndex]?.correct_answer) {
      setScore(score + 1);
    }
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setRandomFact(getRandomFact());
      setQuestionLoaded(false); // Reset until the next question is loaded
    } else {
      setShowResult(true);
      setTimerRunning(false);
      document.body.classList.add("quiz-completed"); 
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function startQuiz() {
    setQuizStarted(true);
    setTimerRunning(true); // Start the timer only when the quiz starts
  }

  return (
    <div className="quiz-page">
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>
      <div className="circle"></div>

      <div className="quiz-container">
        {!quizStarted ? (
          <div className="start-container">
            <h2>Welcome to the Quiz!</h2>
            <p> Did you know? {randomFact}</p>
            <button className="start-btn" onClick={startQuiz}>
              Start Quiz
            </button>
          </div>
        ) : showResult ? (
          <div className="result-container">
            <h2>Quiz Completed!</h2>
            <h3>Your Score: {score} / {questions.length}</h3>
            <h3>Time Taken: {formatTime(timeTaken)}</h3>
            {score === questions.length && <p className="excellent-message"> Excellent! You got them all right! </p>}
            <button className="restart-btn" onClick={() => window.location.reload()}>
              Restart Quiz
            </button>
          </div>
        ) : (
          <div className="question-container">
            <h2>Question {currentIndex + 1} / {questions.length}</h2>
            <h3>{questions[currentIndex]?.question}</h3>
            <div className="timer"> Time: {formatTime(timeTaken)}</div>
            <div className="options-container">
              {shuffledOptions.map((option, idx) => (
                <button key={idx} className="option-btn" onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
            <div className="fact-container">
              <p> Fun Fact: {randomFact}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizApp;
