import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Form, Button, Alert } from 'react-bootstrap';

const TestCreate = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [classrooms, setClassrooms] = useState([]);
  const [tests, setTests] = useState({});
  const [testQuestions, setTestQuestions] = useState({});
  const [options, setOptions] = useState({});
  const [cookies] = useCookies(['csrftoken']);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [writeAnswer, setWriteAnswer] = useState(false);
  const [doubleObject, setDoubleObject] = useState(false);
  const [firstLetter, setFirstLetter] = useState(false);
  const [secondLetter, setSecondLetter] = useState(false);
  const [thirdLetter, setThirdLetter] = useState(false);
  const [lastLetter, setLastLetter] = useState(false);
  const [questionSound2, setQuestionSound2] = useState(false);
  const [questionLabel, setQuestionLabel] = useState(false);
  const [questionPicture2, setQuestionPicture2] = useState(false);

  useEffect(() => {
  }, [options]);


  useEffect(() => {
    axios.get('/api/classrooms/my-classroom-teacher/')
      .then(response => {
        setClassrooms(response.data);
        const initialFormData = {};
        response.data.forEach(classroom => {
          initialFormData[classroom.id] = {
            name: '',
            test_picture: null,
          };
          // Fetch tests for each classroom
          fetchTestsByClassroom(classroom.id);
        });
        setFormData(initialFormData);
      })
      .catch(error => {
        console.error('Error fetching classrooms:', error);
      });
  }, []);


  const fetchTestsByClassroom = (classroomId) => {
    axios.get(`/api/name-id-tests/by-classroom/${classroomId}`)
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

  const fetchQuestionsByTest = (testId) => {
    axios.get(`/api/test-questions/by-test/${testId}/`)
      .then(response => {
        setTestQuestions(prevQuestions => ({
          ...prevQuestions,
          [testId]: response.data,
        }));
      })
      .catch(error => {
        console.error(`Error fetching questions for test ${testId}:`, error);
      });
  };

  const fetchOptionsByQuestion = (questionId) => {
    axios.get(`/api/options/by-question/${questionId}/`)
      .then(response => {
        setOptions(prevOptions => ({
          ...prevOptions,
          [questionId]: response.data,
        }));
      })
      .catch(error => {
        console.error(`Error fetching options for question ${questionId}:`, error);
      });
  };



  const handleConnectInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConnectSubmit = async (e) => {
    e.preventDefault();
    const { classroom_name, classroom_password } = formData;
    const response = await fetch(`/test-classroom/${activeTestId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.csrftoken, // Add the CSRF token to headers
      },
      body: JSON.stringify({ classroom_name, classroom_password }),
    });
    const data = await response.json();
    setResponseMessage(data.message);
  };


  const handleTestCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const handleTestCreateFileChange = (e) => {
    setFormData({ ...formData, test_picture: e.target.files[0] });
  };

  const handleTestCreateSubmit = async (classroomId, e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('lesson_number', formData.lesson_number);
      data.append('picture_url', formData.picture_url);
      if (formData.test_picture) {
          data.append('test_picture', formData.test_picture);
      }

      try {
          const response = await fetch(`/test/${classroomId}/create/`, {
              method: 'POST',
              headers: {
                  'X-CSRFToken': cookies.csrftoken,
              },
              body: data,
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const result = await response.json();
          setResponseMessage(result.message);
          setTests(prevTests => {
              const newTests = {...prevTests};
              if (!newTests[classroomId]) {
                  newTests[classroomId] = [];
              }
              newTests[classroomId].unshift({id: result.id, name: result.name}); // Add the new test at the beginning of the array
              return newTests;
          });

      } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
      }
  };


  const handleTestDelete = async (testId) => {
    try {
      const response = await fetch(`/test/${testId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });
      setActiveTestId(null);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      // Update the tests state to remove the deleted test
      setTests(prevTests => {
        const newTests = {...prevTests};
        for (let classroomId in newTests) {
          newTests[classroomId] = newTests[classroomId].filter(test => test.id !== testId);
        }
        return newTests;
      });

    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };



  const handleQuestionPictureFileChange = (e) => {
    setFormData({ ...formData, question_picture: e.target.files[0] });
  };

  const handleQuestionSoundFileChange = (e) => {
    setFormData({ ...formData, question_sound: e.target.files[0] });
  };

  const handleWriteAnswerChange = (e) => {
    setWriteAnswer(e.target.checked);
  };

  const handleDoubleObjectChange = (e) => {
    setDoubleObject(e.target.checked);
  };

  const handleQuestionSound2Change = (e) => {
    setQuestionSound2(e.target.checked);
  };

  const handleQuestionLabelChange = (e) => {
    setQuestionLabel(e.target.checked);
  };

  const handleQuestionPicture2Change = (e) => {
    setQuestionPicture2(e.target.checked);
  };



  const handleFirstLetterChange = (e) => {
    setFirstLetter(e.target.checked);
  };

  const handleSecondLetterChange = (e) => {
    setSecondLetter(e.target.checked);
  };

  const handleThirdLetterChange = (e) => {
    setThirdLetter(e.target.checked);
  };

  const handleLastLetterChange = (e) => {
    setLastLetter(e.target.checked);
  };


  const handleQuestionSubmit = async (testId, e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    if (formData.question_picture) {
      data.append('question_picture', formData.question_picture);
    }
    if (formData.question_sound) {
      data.append('question_sound', formData.question_sound);
    }
    data.append('list_selection', formData.list_selection);
    data.append('write_answer', writeAnswer);
    data.append('double_object', doubleObject);
    data.append('first_letter', firstLetter);
    data.append('second_letter', secondLetter);
    data.append('third_letter', thirdLetter);
    data.append('last_letter', lastLetter);
    data.append('sound2', questionSound2)
    data.append('label', questionLabel)
    data.append('picture2', questionPicture2)


    try {
      const response = await fetch(`/question/${testId}/create/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setResponseMessage(result.message);

      setTestQuestions(prevQuestions => {
          const newQuestions = {...prevQuestions};
          if (!newQuestions[testId]) {
              newQuestions[testId] = [];
          }
          newQuestions[testId].unshift({id: result.id, name: result.name}); // Add the new question at the beginning of the array
          return newQuestions;
      });

    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleQuestionDelete = async (questionId) => {
    try {
      const response = await fetch(`/question/${questionId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });
      setActiveQuestionId(null);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      // Update the testQuestions state to remove the deleted question
      setTestQuestions(prevTestQuestions => {
        const newTestQuestions = {...prevTestQuestions};
        for (let testId in newTestQuestions) {
          newTestQuestions[testId] = newTestQuestions[testId].filter(question => question.id !== questionId);
        }
        return newTestQuestions;
      });

    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };



  const handleOptionCreateFileChange = (e) => {
    setFormData({ ...formData, option_picture: e.target.files[0] });
  };

  const handleIsCorrectChange = (e) => {
    setIsCorrect(e.target.checked);
  };


  const handleOptionCreateSubmit = async (questionId, e) => {
      e.preventDefault();
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.option_picture) {
          data.append('option_picture', formData.option_picture);
      }
      data.append('is_correct', isCorrect);

      try {
          const response = await fetch(`/option/${questionId}/create/`, {
              method: 'POST',
              headers: {
                  'X-CSRFToken': cookies.csrftoken,
              },
              body: data,
          });

          if (!response.ok) {
              throw new Error('Network response was not ok');
          }

          const result = await response.json();
          setResponseMessage(result.message);

          setOptions(prevOptions => {
              const newOptions = {...prevOptions};
              if (!newOptions[questionId]) {
                  newOptions[questionId] = [];
              }
              newOptions[questionId].unshift({id: result.pk, name: result.name, is_correct: result.is_correct}); // Add the new option at the beginning of the array
              return newOptions;
          });

      } catch (error) {
          console.error('There was a problem with the fetch operation:', error);
      }
  };

  const handleOptionDelete = async (optionId) => {
    try {
      const response = await fetch(`/option/${optionId}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': cookies.csrftoken,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      // Update the options state to remove the deleted option
      setOptions(prevOptions => {
        const newOptions = {...prevOptions};
        for (let questionId in newOptions) {
          newOptions[questionId] = newOptions[questionId].filter(option => option.id !== optionId);
        }
        return newOptions;
      });

    } catch (error) {
      console.error(`There was a problem with the delete operation:`, error);
    }
  };




  const toggleQuestionDetails = (testId) => {
    if (activeTestId === testId) {
      setActiveTestId(null);
      setActiveQuestionId(null);
    } else {
      setActiveTestId(testId);
      setActiveQuestionId(null);
      fetchQuestionsByTest(testId);
    }
  };

  const toggleOptionDetails = (questionId) => {
    if (activeQuestionId === questionId) {
      setActiveQuestionId(null);
    } else {
      setActiveQuestionId(questionId);
      fetchOptionsByQuestion(questionId);
    }
  };

  return (
    <div>
      {classrooms.map(classroom => (
        <div key={classroom.id}>
          <h2>Create Test for {classroom.name}</h2>
          <form onSubmit={(e) => handleTestCreateSubmit(classroom.id, e)}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleTestCreateInputChange}
              placeholder="Test Name"
              className="form-control"
            />
            <input
              type="text"
              name="picture_url"
              value={formData.picture_url}
              onChange={handleTestCreateInputChange}
              placeholder="picture url"
              className="form-control"
            />
            <input
              type="number"
              name="lesson_number"
              value={formData.lesson_number}
              onChange={handleTestCreateInputChange}
              placeholder="lesson number"
              className="form-control"
            />
            <input
              type="file"
              name="test_picture"
              onChange={handleTestCreateFileChange}
              className="form-control"
            />
            <select name="category" value={formData.category} onChange={handleTestCreateInputChange} className="form-control">
                <option value="">Select Category</option>
                <option value="japanese">Japanese</option>
                <option value="english_5">English_5</option>
                <option value="english_6">English_6</option>
                <option value="phonics">Phonics</option>
                <option value="numbers">Numbers</option>
            </select>
            <button type="submit" style={{ width: '200px', border: '4px solid dark' }} className="btn btn-primary">Submit</button>
          </form>
          {responseMessage && <p>{responseMessage}</p>}
          <div className="test-buttons-container">
            {tests[classroom.id] && tests[classroom.id].map(test => (
              <span key={test.id}>
                {activeTestId === null || activeTestId === test.id ? (
                <span>
                  <Button
                    variant="warning"
                    className="toggle-test-btn"
                    style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                    onClick={() => toggleQuestionDetails(test.id)}
                  >
                    {test.name}
                  </Button>
                </span>
                ) : null}
                {activeTestId === test.id && testQuestions[test.id] && (
                  <div className="questions-container">
                  <Button
                    variant="danger"
                    onClick={() => handleTestDelete(test.id)}
                    style={{ width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                  >
                    Delete Test
                  </Button>
                  <button class="btn btn-success" style={{ width: '200px', border: '4px solid dark' }} type="button" data-toggle="collapse" data-target="#connectForm" aria-expanded="false" aria-controls="connectForm">
                    Toggle Connect Form
                  </button>
                  <div class="collapse" id="connectForm">
                  <div class="card card-body">
                  <form onSubmit={handleConnectSubmit}>
                    <input
                      type="text"
                      name="classroom_name"
                      value={formData.classroom_name}
                      onChange={handleConnectInputChange}
                      placeholder="Classroom Name"
                      className="form-control"
                    />
                    <input
                      type="password"
                      name="classroom_password"
                      value={formData.classroom_password}
                      onChange={handleConnectInputChange}
                      placeholder="Classroom Password"
                      className="form-control"
                    />
                    <button type="submit" style={{ width: '200px', border: '4px solid dark' }} className="btn btn-primary">Submit</button>
                  </form>
                  </div>
                  </div>
                  <form onSubmit={(e) => handleQuestionSubmit(test.id, e)}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleTestCreateInputChange}
                      placeholder="Question Name"
                      className="form-control"
                    />
                    <select name="list_selection" value={formData.list_selection} onChange={handleTestCreateInputChange} className="form-control">
                        <option value="">Select List</option>
                        <option value="alphabet_sounds">Alphabet Sounds</option>
                        <option value="small_alphabet_sounds">Small Alphabet Sounds</option>
                        <option value="alphabet_phonics">alphabet_phonics</option>
                        <option value="jlpt_n5_vocabulary">Jlpt_n5_vocabulary</option>
                        <option value="phonics1">Phonics1</option>
                        <option value="phonics_2">Phonics_2</option>
                        <option value="lesson4_list">Lesson4_list</option>
                        <option value="lesson4_grade6_dict">Lesson4_grade6_dict</option>
                        <option value="grade_6_lesson_5">Grade_6_lesson_5</option>
                        <option value="grade_5_lesson_5">Grade_5_lesson_5</option>
                        <option value="grade_6_lesson_6">Grade_6_lesson_6</option>
                        <option value="grade_5_lesson_6">Grade_5_lesson_6</option>
                        <option value="one_twenty">One Twenty</option>
                        <option value="one_hundred">One Hundred</option>
                        <option value="eleven_ninety">Eleven Ninety</option>
                        <option value="one_thousand">One Thousand</option>
                        <option value="one_quadrillion">One Quadrillion</option>
                        <option value="thousand_quadrillion">Thousand Quadrillion</option>
                        <option value="japanese_numbers">Japanese Numbers</option>
                        <option value="alphabet_sounds2">Alphabet Sounds2</option>
                    </select>
                    <input
                      type="file"
                      name="question_picture"
                      onChange={handleQuestionPictureFileChange}
                      className="form-control"
                    />
                    <input
                      type="file"
                      name="question_sound"
                      onChange={handleQuestionSoundFileChange}
                      className="form-control"
                    />
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="write_answer"
                      checked={writeAnswer}
                      onChange={handleWriteAnswerChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Write Answer</label>
                    </div>
                    <div className="form-check">
                    <input
                      type="checkbox"
                      name="double_object"
                      checked={doubleObject}
                      onChange={handleDoubleObjectChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Double Object</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="first_letter"
                        checked={firstLetter}
                        onChange={handleFirstLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">First Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="second_letter"
                        checked={secondLetter}
                        onChange={handleSecondLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Second Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="third_letter"
                        checked={thirdLetter}
                        onChange={handleThirdLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Third Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="last_letter"
                        checked={lastLetter}
                        onChange={handleLastLetterChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Last Letter</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="sound2"
                        checked={questionSound2}
                        onChange={handleQuestionSound2Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Sound2</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="label"
                        checked={questionLabel}
                        onChange={handleQuestionLabelChange}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Label</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="picture2"
                        checked={questionPicture2}
                        onChange={handleQuestionPicture2Change}
                        className="form-check-input"
                      />
                      <label className="form-check-label">Picture2</label>
                    </div>
                    <button type="submit" style={{ width: '200px', border: '4px solid dark' }} className="btn btn-primary">Submit</button>
                  </form>
                  {responseMessage && <p>{responseMessage}</p>}
                    {testQuestions[test.id].map(question => (
                      <span key={question.id}>
                        {activeQuestionId === null || activeQuestionId === question.id ? (
                          <Button
                            variant="primary"
                            style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                            className="mb-2"
                            onClick={() => toggleOptionDetails(question.id)}
                          >
                            {
                              question.name !== "undefined" ? question.name : 'randomized'
                            }
                            {activeTestId === test.id && (
                              question.question_picture && (
                                <img src={question.question_picture} alt="Question" width="100" height="100" />
                              )
                            )}
                          </Button>
                        ) : null}
                        {activeQuestionId === question.id && options[question.id] && (
                          <div className="options-container">
                          <Button
                              variant="danger"
                              onClick={() => handleQuestionDelete(question.id)}
                              style={{ width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                          >
                            Delete
                          </Button>
                          <div>
                          {question.question_sound && (
                            <audio controls>
                              <source src={question.question_sound} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                          </div>
                          <div>
                          <form onSubmit={(e) => handleOptionCreateSubmit(question.id, e)}>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleTestCreateInputChange}
                              placeholder="Option Name"
                              className="form-control"
                            />
                            <input
                              type="file"
                              name="option_picture"
                              onChange={handleOptionCreateFileChange}
                              className="form-control"
                            />
                            <div className="form-check">
                            <input
                              type="checkbox"
                              name="is_correct"
                              checked={isCorrect}
                              onChange={handleIsCorrectChange}
                              className="form-check-input"
                            />
                            <label className="form-check-label">Is Correct</label>
                            </div>
                            <button type="submit" style={{ width: '200px', border: '4px solid dark' }} className="btn btn-primary">Submit</button>
                          </form>
                          </div>
                            {options[question.id].map(option => (
                            <div key={option.id}>
                              <li>
                              <Button
                                variant="info"
                                style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                className="mb-1"
                              >
                                {option.name}
                                {option.option_picture && (
                              <img src={option.option_picture} alt="Option" width="100" height="100" />
                              )}
                              {option.is_correct ? (
                                <span className="text-success" style={{ fontSize: '20px', marginLeft: '10px' }}>&#x2713;</span>
                              ) : (
                                <span className="text-danger" style={{ fontSize: '20px', marginLeft: '10px' }}>&#x2717;</span>
                            )}
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleOptionDelete(option.id)}
                                style={{ width: '200px', padding: '10px', margin: '5px', border: '4px solid black' }}
                              >
                                Delete
                              </Button>
                              </li>
                            </div>
                            ))}
                          </div>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCreate;
