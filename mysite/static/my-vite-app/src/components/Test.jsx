import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';

const Test = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [scoreCounter, setScoreCounter] = useState(0);
  const [tests, setTests] = useState([]);
  const [testQuestions, setTestQuestions] = useState({ questions: [] });
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questions, setQuestions] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [maxScores, setMaxScores] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeMemories, setActiveMemories] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [currentCorrectAudioIndex, setCurrentCorrectAudioIndex] = useState(0);
  const [currentWrongAudioIndex, setCurrentWrongAudioIndex] = useState(0);
  const [recordMessage, setRecordMessage] = useState('');
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [correctAnswerKey, setCorrectAnswerKey] = useState('');
  const [correctWord, setCorrectWord] = useState('');
  const [correctSound, setCorrectSound] = useState('');
  const [correctPicture, setCorrectPicture] = useState('');
  const [correctLabel, setCorrectLabel] = useState('');
  const [randomizedValues, setRandomizedValues] = useState({});
  const [randomizedOptions, setRandomizedOptions] = useState({});
  const [correctOption, setCorrectOption] = useState(false);
  const [isPlayDisabled, setIsPlayDisabled] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isPractice, setIsPractice] = useState(false);

  const correctAudioUrls = window.correctAudioUrls;
  const wrongAudioUrls = window.wrongAudioUrls;



  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/users/current-user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      console.log('Fetched current user:', response.data);
      setCurrentUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to fetch current user.');
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchCurrentUser();
  }, []);


  const fetchMaxScores = async (category, userId) => {
    try {
      setError(null);
      const maxScoresResponse = await axios.get(`/api/maxscore/by-category-and-user/${category}/${userId}/`);
      console.log('Fetched sessions:', maxScoresResponse.data);
      return maxScoresResponse.data;
    } catch (error) {
      console.error('Error fetching maxScores:', error);
      setError('Failed to fetch maxScores.');
    }
  };

  useEffect(() => {
    axios.get('/api/classrooms/my-classroom/')
      .then(response => {
        setClassrooms(response.data);
        const initialFormData = {};
        response.data.forEach(classroom => {
          initialFormData[classroom.id] = {
            name: classroom.name,
            test_picture: null,
          };
        });
        setFormData(initialFormData);
      })
      .catch(error => {
        console.error('Error fetching classrooms:', error);
      });
  }, []);


  const fetchTestsByClassroom = (classroomId) => {
    axios.get(`/api/name-id-tests/`)
      .then(response => {
        setTests(prevTests => ({
          ...prevTests,
          [classroomId]: response.data,
        }));
      })
      .catch(error => {
        console.error(`Error fetching tests for classroom ${classroomId}:`, error);
      });
  };

  const fetchTestsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/name-id-tests/by-category/?category=${category}`);
      setTests(prevTests => ({
        ...prevTests,
        [`category_${category}`]: response.data,
      }));
      return response.data;
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error);
    }
  };



  const fetchQuestionsByTest = async (testId) => {
    try {
      const response = await axios.get(`/api/test-questions/one-question/${testId}/`);
      setQuestions(response.data);
    } catch (error) {
      console.error(`Error fetching question for test ${testId}:`, error);
    }
  };


  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };


  const fetchTestQuestionsAndOptions = async (testId) => {
    try {
      setLoading(true);
      setError(null);

      const testQuestionsResponse = await axios.get(`/api/test-questions/by-test/${testId}/`);
      const questions = testQuestionsResponse.data;


      setTestQuestions({ questions });
      setTotalQuestions(questions.length);
      setLoading(false);

      const randomizedValues = questions.reduce((acc, question) => {
        const keys = Object.keys(question.question_list);

        const unusedKeys = keys.filter(key => !Object.values(acc).some(item => item.randomAlphabet === key));

        const randomKey = unusedKeys.length > 0
          ? unusedKeys[Math.floor(Math.random() * unusedKeys.length)]
          : keys[Math.floor(Math.random() * keys.length)];

        const randomValue = question.question_list[randomKey];


        let randomAlphabetSliced = null;
        if (question.first_letter) {
          randomAlphabetSliced = `_${randomKey.slice(1)}`;
        } else if (question.second_letter) {
          randomAlphabetSliced = `${randomKey[0]}_${randomKey.slice(2)}`;
        } else if (question.third_letter) {
          randomAlphabetSliced = `${randomKey.slice(0, 2)}_${randomKey.slice(3)}`;
        } else if (question.last_letter) {
          randomAlphabetSliced = `${randomKey.slice(0, randomKey.length - 1)}_`;
        }


        acc[question.id] = {
          randomAlphabetSliced : randomAlphabetSliced,
          randomAlphabet: randomKey || null,
          randomUrl: randomValue || null,
          randomWord: randomValue.word || null,
          randomPicture: randomValue.picture || null,
          randomSound: randomValue.sound || null,
          randomSound2: randomValue.sound2 || null,
          randomLabel: randomValue.label || null,
        };

        return acc;
      }, {});



      setRandomizedValues(randomizedValues);

      const randomizedOptions = questions.reduce((acc, question) => {
        const options = question.options;
        const shuffledOptions = shuffleArray([...options]);
        const optionKeys = options ? Object.keys(options[0].option_list) : [];
        const selectedKeys = new Set();

        const randomizedOptionsForQuestion = shuffledOptions.map((option) => {
          let randomOptionKey;
          do {
            randomOptionKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
          } while (randomOptionKey === randomizedValues[question.id].randomAlphabet || selectedKeys.has(randomOptionKey));

          selectedKeys.add(randomOptionKey);
          return { ...option, randomOptionKey };
        });

        acc[question.id] = randomizedOptionsForQuestion;
        return acc;
      }, {});

      setRandomizedOptions(randomizedOptions);

    } catch (error) {
      console.error('Error fetching test questions and options:', error);
      setError('Failed to fetch test questions and options.');
      setLoading(false);
    }
  };



  const recordScore = async (testId) => {
    try {
      const csrfToken = cookies.csrftoken;
      const data = { score: scoreCounter };

      const response = await axios.post(`/score/${testId}/record/`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      const message = response.data.message;
      setRecordMessage(message);
      setShowModal(true);
      await fetchCurrentUser();
      const scores = await fetchMaxScores(activeCategory, currentUser.id);

      if (scores) {
        setMaxScores(scores);
      }

    } catch (error) {
      console.error('Error recording test score:', error);
      setError('Failed to record test score.');
    }
  };

  const deleteSubmissions = async () => {
    try {
      const csrfToken = cookies.csrftoken;
      await axios.post('/submissions/delete/', null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
    } catch (error) {
      console.error('Error deleting submissions:', error);
      setError('Failed to delete submissions.');
    }
  };


  const toggleMemories = () => {
    setActiveMemories(prev => !prev);
  };


  const toggleQuestionDetails = async (testId) => {
    setScoreCounter(0)

    if (activeTestId === testId) {
      setActiveTestId(null);
    } else {
      try {
        setActiveTestId(testId);
        if (isPractice) {
          await fetchQuestionsByTest(testId);
        } else {
          setActiveQuestionIndex(0);
          await fetchTestQuestionsAndOptions(testId);
        }
      } catch (error) {
        console.error('Error fetching test questions and options:', error);
        setError('Failed to fetch test questions and options.');
      }
    }
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      try {
        setActiveCategory(category);
        const fetchedTests = await fetchTestsByCategory(category);

      try {
        const scores = await fetchMaxScores(category, currentUser.id);

        if (scores) {
          setMaxScores(scores);
        } else {
          console.error('No scores found for category:', category);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      } catch (error) {
        console.error('Error fetching tests by category:', error);
        setError('Failed to fetch tests by category.');
      }
    }
  };

  const handlePracticeChange = (e) => {
    setIsPractice(e.target.checked);
  };

  const handleSubmit = async (e, sound2, questionId, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWord, randomPicture, randomSound, randomSound2, randomLabel) => {
    e.preventDefault();

    setCorrectWord(randomWord);
    setCorrectSound(sound2 ? randomSound2 : (randomSound !== null ? randomSound : randomUrl));
    setCorrectPicture(randomPicture);
    setCorrectLabel(randomLabel);


    setSelectedOption(null)
    setInputValue('');


    setShowModal(true);
    setCorrectAnswerKey(randomAlphabet);

    let audioUrl, audioElement;
    if (correctOption) {
      setScoreCounter((prevScore) => prevScore + 1);
      setIsCorrect(true);
      setCurrentWrongAudioIndex(0);
      audioUrl = currentCorrectAudioIndex >= 9
        ? correctAudioUrls[9]
        : correctAudioUrls[currentCorrectAudioIndex];
      audioElement = new Audio(audioUrl);
      setCurrentCorrectAudioIndex((prevIndex) => {
        const newIndex = (prevIndex + 1);
        return newIndex;
      });
    } else {
      setIsCorrect(false);
      setCurrentCorrectAudioIndex(0);
      audioUrl = wrongAudioUrls[currentWrongAudioIndex];
      audioElement = new Audio(audioUrl);
      setCurrentWrongAudioIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) < wrongAudioUrls.length ? (prevIndex + 1) : prevIndex;
        return newIndex;
      });
    }

    audioElement.volume = volume;
    audioElement.play();

    setActiveQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const closeModal = () => {
    setShowModal(false);
    setRecordMessage('');
    if (activeQuestionIndex === totalQuestions && activeTestId !== null) {
        recordScore(activeTestId);
        setActiveTestId(null)
    }
  };


const handlePlay = (audioUrl, button) => {
    if (button.disabled) return;

    button.disabled = true;

    const audio = new Audio(audioUrl);
    audio.play();

    audio.onended = () => {
        button.disabled = false;
    };
};






  const renderForm = (sound2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWord, randomPicture, randomSound, randomSound2, randomLabel) => {
    const options = randomizedOptions[question.id];
    if (!options) return null;
    const optionId = options.length === 1 ? options[0].id : null;

    return (
      <form className="test-form"
      onSubmit={(e) => {
        if (selectedOption !== null || inputValue.trim() !== '') {
          handleSubmit(e, sound2, question.id, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWord, randomPicture, randomSound, randomSound2, randomLabel);
        } else {
          e.preventDefault();
        }
      }}
      >
        <div className="container-fluid">
          <div className="row">
            {options.map(option => {
              return (
                <div key={option.id} className={!question.write_answer ? "col-md-6" : ""}>
                  {question.write_answer ? (
                    <>
                    {(question.first_letter || question.second_letter || question.third_letter || question.last_letter) ? (
                      <div>
                        <span style={{ fontSize: '50px' }}>{randomAlphabetSliced}</span>
                        <p>書いてある文字と足りない文字を全部書いて上の言葉を完成させてください</p>
                      </div>
                    ) : null}
                    <input
                      type="text"
                      id={`selected_option_${question.id}_${option.id}`}
                      name={`selected_option_${question.id}`}
                      style={{ width: '300px', height: '50px', marginTop: '20px' }}
                      value={inputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value);
                        if (!randomLabel && value === randomAlphabet) {
                          setCorrectOption(true);
                        } else if (randomLabel && value === randomLabel) {
                          setCorrectOption(true);
                        } else {
                          setCorrectOption(false);
                        }
                      }}
                    />
                    </>
                  ) : (
                    <>
                      {option.option_list[option.randomOptionKey]?.picture && !question.label ? (
                        <img
                          style={{ width: '150px', height: '120px', marginTop: '8px', border: '3px solid black' }}
                          src={option.is_correct ? randomPicture : option.option_list[option.randomOptionKey].picture}
                          alt="Option"
                        />
                      ): null}
                      <label htmlFor={`selected_option_${question.id}_${option.id}`}   style={{ fontSize: '25px', marginBottom: '10px'}}>
                        <input
                          type="radio"
                          id={`selected_option_${question.id}_${option.id}`}
                          name={`selected_option_${question.id}`}
                          value={option.id}
                          style={{ height: '25px', width: '25px', marginRight: '10px', flexShrink: 0 }}
                          onChange={() => {
                            setCorrectOption(option.is_correct);
                            setSelectedOption(option.id);
                          }}
                          checked={selectedOption === option.id}
                        />
                        <span style={{ flex: 1 }}>
                        {(option.option_list[option.randomOptionKey]?.word === undefined && !randomPicture) ? (
                          option.is_correct ? randomAlphabet : option.randomOptionKey ? option.randomOptionKey : option.name
                        ): (option.option_list[option.randomOptionKey]?.word !== undefined && !randomPicture ? (option.is_correct ? randomWord : option.option_list[option.randomOptionKey].word) : null
                        )}
                        </span>
                      </label>
                      {option.option_list[option.randomOptionKey].word && randomPicture ? (
                        <h4>{question.label ? (option.is_correct? randomLabel : option.option_list[option.randomOptionKey].label) : option.is_correct ? randomWord : option.option_list[option.randomOptionKey].word}</h4>
                      ): null}
                      {option.option_picture && (
                        <img
                          style={{ width: '100px', height: '100px', marginTop: '8px', border: '3px solid black' }}
                          src={Object.keys(option.option_list).length === 0 ? option.option_picture : null}
                          alt="Option"
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          id="submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{
            border: '4px solid #343a40',
            width: '400px',
            height: '80px',
            marginTop: '50px'
          }}
        >
          回答する
        </button>
      </form>
    );
  };


  return (
    <div>
      <div className="quiz-container d-flex justify-content-center align-items-center" id="quiz" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
      {!activeCategory && !activeMemories && (
      <figure style={{ margin: 0 }}>
      {currentUser?.student && (
                <h1 style={{ fontWeight: 'bold' }}>{currentUser.username}</h1>
      )}
      <img
                src={currentUser?.profile_asset?.image}
                alt="Level Image"
                style={{ height: '220px', width: '220px', border: '5px solid black' }}
                onClick={() => document.getElementById('audio').play()}
      />
      <figcaption style={{ fontSize: '30px', marginTop: '5px' }}>
                君は{currentUser?.profile_asset?.text}
      </figcaption>
      <figcaption style={{ fontSize: '45px', marginTop: '5px' }}>
                <strong>最大記録トータル＝{currentUser?.total_max_scores}</strong>
      </figcaption>
      <audio id="audio" src={currentUser?.profile_asset?.audio} />
      </figure>
      )}
        <div className="quiz-header" style={{ height: 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div>
          <div>
          <button
            onClick={() => toggleMemories()}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: !activeMemories ? '100px' : '50px', width: !activeMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
          ><h5 className="text-white">{!activeMemories ? '思い出を見る' : '戻る！'}</h5></button>
          </div>
          {activeMemories && (
            Object.keys(currentUser?.memories || {}).map((key) => (
              <span key={key}>
                <img
                  src={currentUser?.memories[key].image}
                  alt={`Level ${key} Image`}
                  style={{ height: '220px', width: '220px', border: '5px solid black' }}
                  onClick={() => document.getElementById(`audio-${key}`).play()}
                />
                <audio id={`audio-${key}`} src={currentUser?.memories[key].audio} />
              </span>
            ))
          )}
          {!activeMemories && (
          <>
          <button
            onClick={() => toggleCategories('japanese')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >日本語<h5 className="text-white">トータル：{currentUser?.total_category_scores.total_japanese_scores}/{currentUser?.question_counts.total_japanese_questions}</h5></button>
          <button
            onClick={() => toggleCategories('english_5')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >５年英語<h5 className="text-white">トータル：{currentUser?.total_category_scores.total_english_5_scores}/{currentUser?.question_counts.total_english_5_questions}</h5></button>
          <button
            onClick={() => toggleCategories('english_6')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >６年英語<h5 className="text-white">トータル：{currentUser?.total_category_scores.total_english_6_scores}/{currentUser?.question_counts.total_english_6_questions}</h5></button>
          <button
            onClick={() => toggleCategories('phonics')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >アルファベットとフォニックス<h5 className="text-white">トータル：{currentUser?.total_category_scores.total_phonics_scores}/{currentUser?.question_counts.total_phonics_questions}</h5></button>
          <button
            onClick={() => toggleCategories('numbers')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >数字<h5 className="text-white">トータル：{currentUser?.total_category_scores.total_numbers_scores}/{currentUser?.question_counts.total_numbers_questions}</h5></button>
          <button
            className={`btn btn-success mb-3 toggle-test-btn ${activeCategory !== null && activeTestId === null ? 'active' : 'd-none'}`}
            style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
            onClick={() => toggleCategories(activeCategory)}
          >
            <span
              className="text-center text-white"
              style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
            >
            <FaArrowLeft style={{ marginRight: '10px' }} /> 戻る！
            </span>
          </button>
          </>
          )}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {classrooms.map(classroom => (
              <div key={classroom.id}>
                <div className="test-buttons-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.values(tests).flat().sort((a, b) => a.lesson_number - b.lesson_number).map(test => (
                    <span key={test.id} style={{ marginRight: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
                    {activeTestId !== null ? (
                        <h2>
                        <button
                          className={`btn btn-warning mb-3 toggle-test-btn ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
                          style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
                          onClick={() => toggleQuestionDetails(test.id)}
                        >
                          <span
                            className="text-center text-white"
                            style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
                          >
                          <FaArrowLeft style={{ marginRight: '10px' }} /> 戻る!
                          </span>
                        </button>
                        </h2>
                    ) : (
                      <button
                        className={`btn btn-warning mb-3 toggle-test-btn ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
                        style={{ height: '240px', width: '240px', padding: '10px', border: '5px solid black' }}
                        onClick={() => toggleQuestionDetails(test.id)}
                      >
                        <span
                          className="text-center text-white"
                          style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px', justifyContent: 'center' }}
                        >
                      　　{test.name}
                        </span>
                        {test.picture_url && (
                          <img src={test.picture_url} alt="Question" width="170" height="170" />
                        )}
                        <div>
                              {maxScores.map(maxScore => {
                                if (maxScore.test === test.id) {
                                  return (
                                    <h5 key={maxScore.id} className="text-white">
                                      最高記録：{maxScore.score}/{maxScore.total_questions}
                                    </h5>
                                  );
                                }
                                return null;
                              })}
                        </div>
                      </button>
                    )}
                    </div>
                    </span>
                ))}

                {activeTestId && (
                  <div className="test-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
                  {isPractice && questions && (
                    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const keys = Object.keys(questions.question_list);

                        return keys.map((key) => {
                          const value = questions.question_list[key];

                          return (
                            <div key={key} style={{ margin: '10px' }}>
                            <button
                              className="btn btn-info"
                              style={{ height: value.picture ? '170px' : '70px', width: value.picture ? '170px' : 'auto', padding: '10px', border: '5px solid black', position: 'relative', backgroundColor: 'lightblue' }}
                              onClick={(e) => handlePlay(questions.sound2 ? value.sound2 : value.sound ? value.sound : value, e.target)}
                              disabled={isPlayDisabled}
                            >
                              {((value.picture && value.word) || (!value.picture && !value.word)) && (
                              <span
                                className={`${value.picture ? 'text-center' : ''} text-white`}
                                style={!value.picture ? { fontSize: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } : { background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px', justifyContent: 'center', fontSize: '15px' }}
                              >
                                {value.label ? value.label : value.word ? value.word : key}
                              </span>
                              )}
                              {value.picture ? <img src={value.picture} alt={`Picture of ${value.word || key}`} width="120" height="120" /> : null}
                            </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                    <ul>
                      {!isPractice && testQuestions.questions.map((question, index) => {
                        const { randomAlphabetSliced, randomAlphabet, randomUrl, randomWord, randomPicture, randomSound, randomSound2, randomLabel} = randomizedValues[question.id] || {};
                        let selectedKeys = [];
                        const isAudio = typeof randomUrl === 'string' && (randomUrl.includes('Record') || randomUrl.includes('mp3'));
                        const isPicture = typeof randomUrl === 'string' && randomUrl.includes('image');
                        const sound2 = question.sound2
                        return (
                          <li key={question.id} className={index === activeQuestionIndex ? 'active' : 'd-none'}>
                          {isPicture ? (
                            <img src={randomUrl} alt="Question" width="200" height="150" />
                          ) : question.label ? (
                            <>
                            <img src={randomPicture} alt="Question" width="200" height="150" />
                            <h5>{randomWord}</h5>
                            <button
                                className="btn btn-success"
                                style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                onClick={(e) => handlePlay(randomSound2, e.target)}
                                disabled={isPlayDisabled}
                            >
                                音声 <FaPlay style={{ marginLeft: '10px' }} />
                            </button>
                            </>
                          ) : isAudio ? (
                                <button
                                    className="btn btn-success"
                                    style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                    onClick={(e) => handlePlay(randomUrl, e.target)}
                                    disabled={isPlayDisabled}
                                >
                                    音声 <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                          ) : randomSound ? (
                                <button
                                    className="btn btn-success"
                                    style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                    onClick={(e) => handlePlay(sound2 ? randomSound2 : randomSound, e.target)}
                                    disabled={isPlayDisabled}
                                >
                                    音声 <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                          ) : (
                            <p style={{ fontSize: '50px' }}>{randomUrl}</p>
                          )}
                            {renderForm(sound2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWord, randomPicture, randomSound, randomSound2, randomLabel)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                </div>
              </div>
            ))}
          <div className="volume-control">
            <label htmlFor="volume-slider" style={{ fontSize: '20px' }}>
              イバルの声の音量調整
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '200px' }}
            />
          </div>
          <div className={`${activeTestId === null ? 'active' : 'd-none'}`}>
            <span style={{ width: '20px', height: '20px' }}>練習：</span>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
              checked={isPractice}
              onChange={handlePracticeChange}
            />
          </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header
          style={{
            backgroundImage:
                currentCorrectAudioIndex >= 9 || recordMessage
                ? `url(${window.staticFileUrl})`
                : currentCorrectAudioIndex === 1 || currentCorrectAudioIndex === 2 || currentCorrectAudioIndex === 3
                ? `url(${window.staticFileUrl3})`
                : currentCorrectAudioIndex === 4
                ? `url(${window.staticFileUrl1})`
                : currentWrongAudioIndex
                ? `url(${window.staticFileUrl4})`
                : `url(${window.staticFileUrl2})`,


            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            height: '40vh'
          }}
        >
        </Modal.Header>
        <Modal.Body>
            {recordMessage ? (
                <div className="d-flex align-items-center justify-content-center">
                    <h2 className="message">{recordMessage}</h2>
                </div>
            ) : (
                <>
                <div className="d-flex align-items-center">
                    {isCorrect === true ? (
                        <>
                            <span style={{ fontSize: '50px' }}>正解！</span>
                            <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                        </>
                    ) : isCorrect === false ? (
                        <div>
                            <span style={{ fontSize: '50px' }}>あまい！</span>
                            <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                            {correctSound && (
                              <p>
                                <button
                                    className="btn btn-success"
                                    style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => handlePlay(correctSound, e.target)}
                                    disabled={isPlayDisabled}
                                >
                                    音声 <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              </p>
                            )}
                            <h1>正解は：{correctLabel !== null ? correctLabel : correctWord !== null ? correctWord : correctAnswerKey}</h1>
                        </div>
                    ) : null}
                </div>
                <h1>連続正解：{currentCorrectAudioIndex}</h1>
                {isCorrect? <h1>点数：{scoreCounter}</h1> : null}
                </>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Next!
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Test;