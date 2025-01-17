import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { FaPlay, FaArrowLeft } from 'react-icons/fa';

const Test = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [classroomRequests, setClassroomRequests] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [shuffledKeys, setShuffledKeys] = useState([]);
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
  const [activeTestName, setActiveTestName] = useState('');
  const [activeTestDescription, setActiveTestDescription] = useState('');
  const [activeTestDescriptionSound, setActiveTestDescriptionSound] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeMemories, setActiveMemories] = useState(false);
  const [activeEikenMemories, setActiveEikenMemories] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [isEnglish, setIsEnglish] = useState(null);
  const [currentCorrectAudioIndex, setCurrentCorrectAudioIndex] = useState(0);
  const [currentWrongAudioIndex, setCurrentWrongAudioIndex] = useState(0);
  const [recordMessage, setRecordMessage] = useState('');
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [correctAnswerKey, setCorrectAnswerKey] = useState('');
  const [correctWord, setCorrectWord] = useState('');
  const [correctSound, setCorrectSound] = useState('');
  const [correctPicture, setCorrectPicture] = useState('');
  const [correctLabel, setCorrectLabel] = useState('');
  const [correctEikenWord, setCorrectEikenWord] = useState('');
  const [randomizedValues, setRandomizedValues] = useState({});
  const [randomizedOptions, setRandomizedOptions] = useState({});
  const [correctOption, setCorrectOption] = useState(false);
  const [isPlayDisabled, setIsPlayDisabled] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isPractice, setIsPractice] = useState(false);

  const correctAudioUrls = window.correctAudioUrls;
  const wrongAudioUrls = window.wrongAudioUrls;
  const correctEnglishAudioUrls = window.correctEnglishAudioUrls;
  const wrongEnglishAudioUrls = window.wrongEnglishAudioUrls;

  const formatText = (text) => {
    if (text.includes('B:')) {
      const parts = text.split('B:');
      return (
        <>
          <p>{parts[0]}</p>
          <p>B:{parts[1]}</p>
        </>
      );
    } else {
      return <p>{text}</p>;
    }
  };


  const openModal = () => {
    if (isPractice) {
      setActiveTestDescription('')
      setActiveTestDescriptionSound('')
    }
    if (isPractice || activeQuestionIndex === 0) {
      setActiveTestId(null);
    } else {
      setModalIsOpen(true);
    }
  };

  const closeReturnModal = () => {
    setModalIsOpen(false);
  };

  const handleBackClick = () => {
    closeReturnModal();
    recordScore(activeTestId);
    toggleQuestionDetails(activeTestId);
  };

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
        setClassroom(response.data[0]);
        const initialFormData = {};
        response.data.forEach(classroom => {
          initialFormData[classroom.id] = {
            name: classroom.name,
          };
        });
        setFormData(initialFormData);
      })
      .catch(error => {
        console.error('Error fetching classrooms:', error);
      });
  }, []);

  useEffect(() => {
      const fetchClassroomRequests = async () => {
          if (classroom) {
              try {
                  const response = await axios.get(`/api/classroomrequest/by-classroom/${classroom.id}/`);
                  setClassroomRequests(response.data);
              } catch (error) {
                  console.error('Error fetching classroom requests:', error);
              }
          }
      };

      fetchClassroomRequests();
  }, [classroom]);


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




  const fetchTestQuestionsAndOptions = async (testId, numberOfQuestions) => {
    try {
      setLoading(true);
      setError(null);

      const testQuestionsResponse = await axios.get(`/api/test-questions/by-test/${testId}/`);
      const fetchedQuestions = testQuestionsResponse.data;
      const questions = fetchedQuestions.flatMap((question) =>
        Array(numberOfQuestions).fill(null).map((_, index) => ({ ...question, duplicateId: `${question.id}-${index}` }))
      );

      const oneQuestion = questions[0];
      setQuestions(oneQuestion);

      if (oneQuestion && oneQuestion.question_list) {
        const keys = Object.keys(oneQuestion.question_list);
        const shuffled = shuffleArray([...keys]);
        setShuffledKeys(shuffled);
      }


      setTestQuestions({ questions });
      setTotalQuestions(questions.length);
      setLoading(false);

      const randomizedValues = questions.reduce((acc, question) => {
        const keys = Object.keys(question.question_list);
        const shuffledKeys = shuffleArray([...keys]);

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

        const isArray = Array.isArray(randomValue)
        const isArrayfour = Array.isArray(randomValue) && randomValue.length >= 4

        acc[question.duplicateId] = {
          randomAlphabetSliced : randomAlphabetSliced,
          randomAlphabet: randomKey || null,
          randomUrl: !isArray ? randomValue : null,
          randomTranslation: isArray ? randomValue[0] : null,
          randomEikenUrl: isArray ? randomValue[1] : null,
          randomWrongOne: isArrayfour ? randomValue[0] : null,
          randomWrongTwo: isArrayfour ? randomValue[1] : null,
          randomWrongThree: isArrayfour ? randomValue[2] : null,
          randomCorrect: isArrayfour ? randomValue[3] : null,
          randomNumbers: randomValue.numbers || null,
          randomWord: randomValue.word ? (Array.isArray(randomValue.word) ? randomValue.word[0] : randomValue.word) : randomValue.word || null,
          randomWord2: randomValue.word2 || null,
          randomJapanese: randomValue.japanese || null,
          randomPicture: randomValue.picture || null,
          randomSound: randomValue.sound || null,
          randomSound2: randomValue.sound2 || null,
          randomSound3: randomValue.sound3 || null,
          randomLabel: randomValue.label || null,
        };

        return acc;
      }, {});



      setRandomizedValues(randomizedValues);

      const randomizedOptions = questions.reduce((acc, question) => {
        const options = question.options;
        const shuffledOptions = shuffleArray([...options]);
        const optionKeys = Object.keys(question.question_list)
        const selectedKeys = new Set();

        const randomizedOptionsForQuestion = shuffledOptions.map((option) => {
          let randomOptionKey;
          do {
            randomOptionKey = optionKeys[Math.floor(Math.random() * optionKeys.length)];
          } while (randomOptionKey === randomizedValues[question.duplicateId].randomAlphabet || selectedKeys.has(randomOptionKey));

          selectedKeys.add(randomOptionKey);
          return { ...option, randomOptionKey };
        });

        acc[question.duplicateId] = randomizedOptionsForQuestion;
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

  const toggleAccept = async (requestId) => {
    try {
      const csrfToken = cookies.csrftoken;
      await axios.post(`/classroom_accept/${requestId}/`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'X-CSRFToken': csrfToken
        }
      });
      setClassroomRequests(prevRequests =>
          prevRequests.map(request =>
              request.id === requestId ? { ...request, is_accepted: !request.is_accepted } : request
          )
      );

    } catch (error) {
      console.error('Error deleting submissions:', error);
      setError('Failed to delete submissions.');
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

  const toggleEikenMemories = () => {
    setActiveEikenMemories(prev => !prev);
  };


  const toggleQuestionDetails = async (testId, testDescription, testDescriptionSound, numberOfQuestions, testName) => {
    setScoreCounter(0)

    if (isPractice) {
      if (activeTestDescription === testDescription && activeTestDescriptionSound === testDescriptionSound) {
        setActiveTestDescription('')
        setActiveTestDescriptionSound('')
      } else {
        setActiveTestDescription(testDescription)
        setActiveTestDescriptionSound(testDescriptionSound)
      }
    }

    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveTestName('');
    } else {
      try {
        setActiveTestId(testId);
        setActiveTestName(testName);
        if (isPractice) {
          await fetchQuestionsByTest(testId);
        } else {
          setActiveQuestionIndex(0);
          await fetchTestQuestionsAndOptions(testId, numberOfQuestions);
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

  const handleLanguageChange = (e) => {
    setIsEnglish(e.target.checked);
  };

  const handleSubmit = async (e, sound2, sound3, word2, questionId, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel) => {
    e.preventDefault();

    setCorrectWord(randomNumbers ? randomNumbers : randomWord);
    setCorrectSound(sound3 ? randomSound3 : sound2 ? randomSound2 : randomSound !== null ? randomSound : randomEikenUrl !== 't' ? randomEikenUrl : randomUrl);
    setCorrectPicture(randomPicture);
    setCorrectLabel(word2 ? randomWord2 : randomLabel);
    setCorrectEikenWord(randomCorrect);


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
        ? (isEnglish ? correctEnglishAudioUrls[8] : correctAudioUrls[8])
        : (isEnglish ? correctEnglishAudioUrls[currentCorrectAudioIndex] : correctAudioUrls[currentCorrectAudioIndex]);
      audioElement = new Audio(audioUrl);
      setCurrentCorrectAudioIndex((prevIndex) => {
        const newIndex = (prevIndex + 1);
        return newIndex;
      });
    } else {
      setIsCorrect(false);
      setCurrentCorrectAudioIndex(0);
      audioUrl = (isEnglish ? wrongEnglishAudioUrls[currentWrongAudioIndex] : wrongAudioUrls[currentWrongAudioIndex]);
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






  const renderForm = (sound2, sound3, word2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel) => {
    const options = randomizedOptions[question.duplicateId];
    if (!options) return null;
    const optionId = options.length === 1 ? options[0].id : null;

    return (
      <form className="test-form"
      onSubmit={(e) => {
        if (selectedOption !== null || inputValue.trim() !== '') {
          handleSubmit(e, sound2, sound3, word2, question.id, question, optionId, randomAlphabet, randomAlphabetSliced, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel);
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
                    {question.description && (
                      <h4>{question.name}</h4>
                    )}
                    <input
                      type="text"
                      id={`selected_option_${question.id}_${option.id}`}
                      name={`selected_option_${question.id}`}
                      style={{ width: '400px', height: '50px', marginTop: '20px' }}
                      value={inputValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputValue(value);
                        if (!randomLabel && !question.word2 && value === randomAlphabet) {
                          setCorrectOption(true);
                        } else if (randomLabel && value === randomLabel) {
                          setCorrectOption(true);
                        } else if (question.word2 && value === randomWord2 ) {
                          setCorrectOption(true);
                        } else {
                          setCorrectOption(false);
                        }
                      }}
                    />
                    </>
                  ) : (
                    <>
                      {question.question_list[option.randomOptionKey]?.picture && !question.label ? (
                        <img
                          style={{ width: '150px', height: '120px', marginTop: '8px', border: '3px solid black' }}
                          src={option.is_correct ? randomPicture : question.question_list[option.randomOptionKey].picture}
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
                        <span style={{ flex: 1 }} onClick={(e) => randomEikenUrl && !randomWrongThree ? handlePlay(option.is_correct ? randomEikenUrl : questions.question_list[option.randomOptionKey][1], e.target) : null}>
                        {(question.question_list[option.randomOptionKey]?.word === undefined && !randomPicture) ? (
                          option.is_correct ? (randomCorrect ? randomCorrect : randomAlphabet) : randomWrongThree ? (option.id == question.options[1].id ? randomWrongOne : option.id == question.options[2].id ? randomWrongTwo : randomWrongThree) : option.randomOptionKey ? option.randomOptionKey : option.name
                        ): (question.question_list[option.randomOptionKey]?.word !== undefined && !randomPicture ? (option.is_correct ? (randomNumbers !== undefined ? randomNumbers : randomWord) : (randomNumbers !== undefined ? question.question_list[option.randomOptionKey].numbers : question.question_list[option.randomOptionKey].word)) : null
                        )}
                        {question.japanese_option && (
                          option.is_correct? randomJapanese : question.question_list[option.randomOptionKey]?.japanese
                        )}
                        </span>
                      </label>
                      {question.question_list[option.randomOptionKey].word && randomPicture ? (
                        <h4>{question.label ? (option.is_correct? randomLabel : (question.question_list[option.randomOptionKey].label === randomLabel) ? "1000 Yen" : question.question_list[option.randomOptionKey].label) : option.is_correct ? randomWord : question.question_list[option.randomOptionKey].word}</h4>
                      ): null}
                      {option.option_picture && (
                        <img
                          style={{ width: '100px', height: '100px', marginTop: '8px', border: '3px solid black' }}
                          src={Object.keys(question.question_list).length === 0 ? option.option_picture : null}
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
            marginTop: '20px'
          }}
        >
          {isEnglish ? "Answer" : "回答する"}
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
      <img
                src={currentUser?.pets?.image}
                alt="Level Image"
                style={{ height: '150px', width: '150px', border: '5px solid black' }}
                onClick={() => document.getElementById('pet_audio').play()}
      />
      <figcaption style={{ fontSize: '20px', marginTop: '5px' }}>
            {isEnglish ? 'you ' : '君は'}{isEnglish ? currentUser?.profile_asset?.english_text : currentUser?.profile_asset?.text}
      </figcaption>
      <figcaption style={{ fontSize: '20px', marginTop: '5px' }}>
            {isEnglish ? 'your pet is ' : '君のペットは'}{isEnglish ? currentUser?.pets?.english_text : currentUser?.pets?.text}
      </figcaption>
      <figcaption style={{ fontSize: '30px', marginTop: '5px' }}>
                <strong>{isEnglish ? 'Total max scores=' : '最大記録トータル＝'}{currentUser?.total_max_scores}    {isEnglish ? 'points untill growth=' : '成長まで＝'} {20 - (currentUser?.total_max_scores % 20)}{isEnglish ? 'points' : '点'}</strong>
      </figcaption>
      <figcaption style={{ fontSize: '30px', marginTop: '5px' }}>
                <strong>{isEnglish ? 'Total Eiken score=' : '英検最大記録トータル＝'}{currentUser?.total_eiken_score}    {isEnglish ? 'points untill evolution=' : '進化まで＝'} {50 - (currentUser?.total_eiken_score % 50)}{isEnglish ? 'points' : '点'}</strong>
      </figcaption>
      <figcaption style={{ fontSize: '30px', marginTop: '5px' }}>
          {isEnglish ? "classroom: " : "教室："}{classroom?.name}
      </figcaption>
      {!classroom?.character_voice ? (<audio id="audio" src={isEnglish ? currentUser?.profile_asset?.english_audio : currentUser?.profile_asset?.audio} />) : (null)}
      {!classroom?.character_voice ? (<audio id="pet_audio" src={currentUser?.pets?.audio} />) : (null)}
      </figure>
      )}
        <div className="quiz-header" style={{ height: 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div>
          <div>
          {!activeEikenMemories && (
          <button
            onClick={() => toggleMemories()}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: !activeMemories ? '100px' : '50px', width: !activeMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
          ><h5 className="text-white">{!activeMemories ? (isEnglish ? 'Memories' : '思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</h5></button>
          )}
          {!activeMemories && (
          <button
            onClick={() => toggleEikenMemories()}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: !activeEikenMemories ? '100px' : '50px', width: !activeEikenMemories ? '220px' : '290px', padding: '10px', border: '5px solid black' }}
          ><h5 className="text-white">{!activeEikenMemories ? (isEnglish ? 'Pet memories' : 'ペットの思い出を見る') : (isEnglish ? 'Go back' : '戻る！')}</h5></button>
          )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {activeMemories && (
            Object.keys(currentUser?.memories || {}).map((key) => (
              <span key={key}>
                <img
                  src={currentUser?.memories[key].image}
                  alt={`Level ${key} Image`}
                  style={{ height: '220px', width: '220px', border: '5px solid black' }}
                  onClick={() => document.getElementById(`audio-${key}`).play()}
                />
                {!classroom?.character_voice ? (<audio id={`audio-${key}`} src={isEnglish ? currentUser?.memories[key].english_audio : currentUser?.memories[key].audio} />) : (null)}
              </span>
            ))
          )}
          {activeEikenMemories && (
            Object.keys(currentUser?.eiken_memories || {}).map((key) => (
              <span key={key}>
                <img
                  src={currentUser?.eiken_memories[key].image}
                  alt={`Level ${key} Image`}
                  style={{ height: '220px', width: '220px', border: '5px solid black' }}
                  onClick={() => document.getElementById(`audio-${key}`).play()}
                />
                {!classroom?.character_voice ? (<audio id={`audio-${key}`} src={isEnglish ? currentUser?.eiken_memories[key].audio : currentUser?.eiken_memories[key].audio} />) : (null)}
              </span>
            ))
          )}
          </div>
          {!activeMemories && !activeEikenMemories && (
          <>
          {currentUser?.username === 'Sarah' ? <button
            onClick={() => toggleCategories('japanese')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish ? 'Japanese' : '日本語'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_japanese_scores}/{currentUser?.question_counts.total_japanese_questions}</h5></button> : ''}
          <button
            onClick={() => toggleCategories('english_5')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish? '5th grade English' : '５年英語'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_english_5_scores}/{currentUser?.question_counts.total_english_5_questions}</h5></button>
          <button
            onClick={() => toggleCategories('english_6')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish ? '6th grade English' : '６年英語'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_english_6_scores}/{currentUser?.question_counts.total_english_6_questions}</h5></button>
          <button
            onClick={() => toggleCategories('phonics')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish ? 'Alphabet and phonics' : 'アルファベットとフォニックス'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_phonics_scores}/{currentUser?.question_counts.total_phonics_questions}</h5></button>
          <button
            onClick={() => toggleCategories('numbers')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish ? 'Numbers/days/months' : '数字/曜日/月'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_numbers_scores}/{currentUser?.question_counts.total_numbers_questions}</h5></button>
          <button
            onClick={() => toggleCategories('eiken')}
            className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
            style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
          >{isEnglish? 'Eiken' : '英検'}<h5 className="text-white">{isEnglish ? 'Total Score:' : 'トータル：'}{currentUser?.total_category_scores.total_eiken_scores}/{currentUser?.question_counts.total_eiken_questions}</h5></button>
          <button
            className={`btn btn-success mb-3 toggle-test-btn ${activeCategory !== null && activeTestId === null ? 'active' : 'd-none'}`}
            style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
            onClick={() => toggleCategories(activeCategory)}
          >
            <span
              className="text-center text-white"
              style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
            >
            <FaArrowLeft style={{ marginRight: '10px' }} /> {isEnglish ? 'Go back!' : '戻る！'}
            </span>
          </button>
          {activeCategory === 'eiken' ? <h4>最大２５点の語彙テスト以外７割以上とれたら次のテストが現れる</h4> : ''}
          </>
          )}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {classrooms.map(classroom => (
              <div key={classroom.id}>
                <div className="test-buttons-container" style={{ display: !activeTestId ? 'flex' : undefined, flexWrap: !activeTestId ? 'wrap' : undefined }}>
                {Object.values(tests).flat().sort((a, b) => a.lesson_number - b.lesson_number).map(test => (
                    <span key={test.id}>
                    {activeTestId !== null ? (
                        <>
                        <button
                          className={`btn btn-warning toggle-test-btn ${activeTestId === test.id || activeTestId === null ? 'active' : 'd-none'}`}
                          style={{ height: '50px', width: '400px', border: '5px solid black', marginBottom: '20px' }}
                          onClick={openModal}
                        >
                          <span
                            className="text-center text-white"
                            style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
                          >
                          <FaArrowLeft style={{ marginRight: '10px' }} /> {activeQuestionIndex !== 0 ? (isEnglish ? 'Record score and ' : '点数記録して') : ''}{isEnglish ? 'Go back from ' : ''}{test.name}{!isEnglish ? 'から戻る!' : ''}
                          </span>
                        </button>
                        </>
                    ) : (
                      <button
                        className={`btn btn-warning toggle-test-btn ${activeCategory === test.category && activeTestId === null ? 'active' : 'd-none'}`}
                        style={{ height: '240px', width: '240px', border: '5px solid black' }}
                        onClick={() => toggleQuestionDetails(test.id, test.description, test.sound_url, test.number_of_questions, test.name)}
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
                            {maxScores.some(maxScore => maxScore.test === test.id)
                              ? maxScores.map(maxScore =>
                                  maxScore.test === test.id ? (
                                    <h5 key={maxScore.id} className="text-white">
                                      {isEnglish ? "High score: " : "最高記録："}{maxScore.score}/{test.total_score}
                                    </h5>
                                  ) : null
                                )
                              : <h5 className="text-white">{isEnglish ? "Still " : "まだ"}0/{test.total_score}</h5>
                            }
                        </div>
                      </button>
                    )}
                    </span>
                ))}

                {activeTestId && (
                  <>
                  <div>
                      {activeTestDescription.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))}
                      {activeTestDescriptionSound ? (<audio controls> <source src={activeTestDescriptionSound} type="audio/mpeg" /> Your browser does not support the audio element. </audio>) : null}
                　</div>
                  <div className="test-details" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
                  {isPractice && questions && ((activeCategory === 'eiken' && activeTestName.includes('英検５-語彙')) || activeCategory !== 'eiken') && (
                    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const keys = Object.keys(questions.question_list);

                        return keys.map((key) => {
                          const value = questions.question_list[key];

                          return (
                            <div key={key} style={value.picture ? { margin: '10px' } : { flex: '1 1 50%', padding: '10px' }}>
                            <button
                              className="btn btn-info"
                              style={{ height: value.picture ? '170px' : '70px', width: value.picture ? '170px' : 'auto', padding: '10px', border: '5px solid black', position: 'relative', backgroundColor: 'lightblue' }}
                              onClick={(e) => handlePlay(value[1] !== 't' && value[1] !== undefined ? value[1] : questions.sound3? value.sound3 : questions.sound2 ? value.sound2 : value.sound ? value.sound : value, e.target)}
                              disabled={isPlayDisabled}
                            >
                              {((value.picture && value.word) || (!value.picture && !value.word)) && (
                              <span
                                className={`${value.picture ? 'text-center' : ''} text-white`}
                                style={!value.picture ? { fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } : { background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px', justifyContent: 'center', fontSize: '15px' }}
                              >
                                {value.numbers ? value.numbers : value.label ? value.label : value.word ? value.word : key}{value[0] !== undefined && value[0] !== 'h'  ? ` = ${value[0]}` : ""}
                              </span>
                              )}
                              {!value.picture && value.word && (
                              <span
                                className={`${value.picture ? 'text-center' : ''} text-white`}
                                style={!value.picture ? { fontSize: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } : { background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px', justifyContent: 'center', fontSize: '15px' }}
                              >
                                {value.numbers ? value.numbers : ''}{value.word}
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
                  {!isPractice && questions && questions.sound3 && (
                    <div key={questions.id} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {(() => {
                        const keys = Object.keys(questions.question_list);

                        return shuffledKeys.map((key) => {
                          const value = questions.question_list[key];
                          return (
                            <div key={key}>
                              <div
                                className={`${value.picture ? 'text-center' : ''} text-white`}
                                style={!value.picture ? { fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } : { background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', justifyContent: 'center', fontSize: '15px', lineHeight: '1' }}
                              >
                                {value.label ? value.label : value.word ? value.word : key}
                              </div>
                              {value.picture ? <img src={value.picture} alt={`Picture of ${value.word || key}`} width="100" height="100" /> : null}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                    <ul>
                      {!isPractice && testQuestions.questions.map((question, index) => {
                        const { randomAlphabetSliced, randomAlphabet, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel} = randomizedValues[question.duplicateId] || {};
                        let selectedKeys = [];
                        const isAudio = typeof randomUrl === 'string' && (randomUrl.includes('Record') || randomUrl.includes('mp3'));
                        const isPicture = typeof randomUrl === 'string' && randomUrl.includes('image');
                        const sound2 = question.sound2
                        const sound3 = question.sound3
                        const word2 = question.word2
                        const keys = Object.keys(question.question_list);
                        const shuffledKeys = shuffleArray([...keys]);
                        const shuffledValues = shuffledKeys.map((key) => question.question_list[key]);
                        return (
                          <>
                          <div key={question.id} className={index === activeQuestionIndex ? 'active' : 'd-none'}>
                            {!sound3 ? (
                              isPicture ? (
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
                                    {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                  </button>
                                </>
                              ) : isAudio ? (
                                <button
                                  className="btn btn-success"
                                  style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                  onClick={(e) => handlePlay(randomUrl, e.target)}
                                  disabled={isPlayDisabled}
                                >
                                  {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              ) : randomSound ? (
                                <button
                                  className="btn btn-success"
                                  style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                  onClick={(e) => handlePlay(sound2 ? randomSound2 : randomSound, e.target)}
                                  disabled={isPlayDisabled}
                                >
                                  {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              ) : (
                                <p style={{ fontSize: '50px' }}>{randomUrl}</p>
                              )
                            ) : null}
                            <h4 style={{ whiteSpace: 'pre' }}>{randomCorrect ? formatText(randomAlphabet) : randomTranslation}</h4>
                            {sound3 && (
                              <button
                                className="btn btn-success"
                                style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px' }}
                                onClick={(e) => handlePlay(sound3 ? randomSound3 : sound2 ? randomSound2 : randomSound, e.target)}
                                disabled={isPlayDisabled}
                              >
                                {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                              </button>
                            )}
                            {randomNumbers && (
                            <h4>{randomWord}</h4>
                            )}
                            {question.japanese_option && (
                              <h4>{randomWord}</h4>
                            )}
                            {question.description && !question.write_answer && (
                              <h4>{question.name}</h4>
                            )}
                            {renderForm(sound2, sound3, word2, question, randomAlphabet, randomAlphabetSliced, selectedKeys, randomUrl, randomWrongOne, randomWrongTwo, randomWrongThree, randomCorrect, randomEikenUrl, randomTranslation, randomNumbers, randomWord, randomWord2, randomJapanese, randomPicture, randomSound, randomSound2, randomSound3, randomLabel)}
                          </div>
                          </>
                        );
                      })}
                    </ul>
                  </div>
                  </>
                )}
                </div>
              </div>
            ))}
          <div className="volume-control">
            <label htmlFor="volume-slider" style={{ fontSize: '20px' }}>
              {isEnglish ? "Adjust Ivar's reaction voice volume" : "イバルの反応の声音量調整"}
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
            <span style={{ width: '20px', height: '20px' }}>{isEnglish ? 'Practice' : '練習'} ：</span>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
              checked={isPractice}
              onChange={handlePracticeChange}
            />
          </div>
          <div className={`${activeTestId === null ? 'active' : 'd-none'}`}>
            <span style={{ width: '20px', height: '20px' }}>{isEnglish ? '英語' : 'English'}：</span>
            <input
              type="checkbox"
              style={{ width: '20px', height: '20px' }}
              checked={isEnglish}
              onChange={handleLanguageChange}
            />
          </div>
          {classroomRequests.map((request) => (
              <button
                className="btn btn-success"
                style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => toggleAccept(request.id)}
                key={request.id}>
                  {request.teacher.user.username}
                  {request.is_accepted ? (
                      <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                  ) : (
                      <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                  )}
              </button>
          ))}
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header
          style={{
            backgroundImage:
                currentCorrectAudioIndex >= 9 || recordMessage
                ? `url("https://storage.googleapis.com/ivar_reactions/WhatsApp画像%202024-02-14%2013.27.37_9343389c%20(3).jpg")`
                : currentCorrectAudioIndex === 1 || currentCorrectAudioIndex === 2 || currentCorrectAudioIndex === 3
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-5eda95374c2140e3a6dad00334c41fef_raw%20(3).jpg")`
                : currentCorrectAudioIndex === 4
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-12ba3e00450f41cc899c83c6a484c79f_raw%20(4).jpg")`
                : currentWrongAudioIndex
                ? `url("https://storage.googleapis.com/ivar_reactions/openart-6cf0de3a89b84f87983d9234bf1fa9d5_raw%20(2).jpg")`
                : `url("https://storage.googleapis.com/ivar_reactions/openart-42849cd925af4fdba5bc73bf93394019_raw%20(7).jpg")`,


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
                            <span style={{ fontSize: '50px' }}>{isEnglish ? "Correct!" : "正解！"}</span>
                            <span className="text-success" style={{ fontSize: '50px' }}>&#x2713;</span>
                        </>
                    ) : isCorrect === false ? (
                        <div>
                            <span style={{ fontSize: '50px' }}>{isEnglish ? "Naive!" : "あまい！"}</span>
                            <span className="text-danger" style={{ fontSize: '50px' }}>&#x2717;</span>
                            {correctSound && (
                              <p>
                                <button
                                    className="btn btn-success"
                                    style={{ height: '50px', width: '250px', border: '5px solid black', color: 'white', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => handlePlay(correctSound, e.target)}
                                    disabled={isPlayDisabled}
                                >
                                    {isEnglish ? "Play sound" : "音声"} <FaPlay style={{ marginLeft: '10px' }} />
                                </button>
                              </p>
                            )}
                            <h1>{isEnglish ? "Correct answer:" : "正解は："}{correctLabel !== null ? correctLabel : correctWord !== null ? correctWord : correctEikenWord ? correctEikenWord : correctAnswerKey}</h1>
                        </div>
                    ) : null}
                </div>
                <h1>{isEnglish ? "Correct streak: " : "連続正解："}{currentCorrectAudioIndex}</h1>
                {isCorrect? <h1>{isEnglish ? "Points: " : "点数："}{scoreCounter}</h1> : null}
                </>
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Next!
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={modalIsOpen} onHide={closeReturnModal}>
        <Modal.Body>
          <p>まだテスト終わっていない。終わっていないまま戻ったら今までの点数しか記録されない。それでももどる？</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReturnModal}>いいえ</Button>
          <Button variant="primary" onClick={handleBackClick}>はい</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Test;