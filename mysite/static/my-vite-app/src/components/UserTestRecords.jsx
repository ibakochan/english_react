import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { Button, Form, Modal } from 'react-bootstrap';

const UserTestRecords = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [cookies, setCookie, removeCookie] = useCookies(['csrftoken']);
  const [maxScores, setMaxScores] = useState([]);
  const [sessionDetails, setSessionDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeClassroomId, setActiveClassroomId] = useState(null);
  const [activeTestId, setActiveTestId] = useState(null);
  const [activeUserDeleteId, setActiveUserDeleteId] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [userDetailButtonActive, setUserDetailButtonActive] = useState(false);
  const [formData, setFormData] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = (userId) => {
    setActiveUserDeleteId(userId);
    setModalIsOpen(true);
  };

  const closeReturnModal = () => {
    setModalIsOpen(false);
    setActiveUserDeleteId(null);
  };

  const handleBackClick = () => {
    closeReturnModal();
    handleAccountDelete(activeUserDeleteId);
  };

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
        });
        setFormData(initialFormData);
      })
      .catch(error => {
        console.error('Error fetching classrooms:', error);
      });
  }, []);


  const handleAccountDelete = async (userId) => {
    try {
      const csrfToken = cookies.csrftoken;
      const response = await axios.post(
        `/remove/account/${userId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'X-CSRFToken': csrfToken,
          },
        }
      );

      setUsers(prevUsers =>
          prevUsers.filter(user => user.id !== userId)
      );

    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred while deleting the account.');
    }
  };

  const fetchTests = async (classroomId) => {
    try {
      setLoading(true);
      setError(null);
      const testsResponse = await axios.get(`/api/name-id-tests/`);
      console.log('Fetched tests:', testsResponse.data);
      setTests(testsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Failed to fetch tests.');
      setLoading(false);
    }
  };

  const fetchTestsByCategory = async (category) => {
    try {
      const response = await axios.get(`/api/name-id-tests/by-category/?category=${category}`);
        setTests(prevTests => ({
          ...prevTests,
          [`category_${category}`]: response.data,
        }));
    } catch (error) {
      console.error(`Error fetching tests for category ${category}:`, error);
    }
  };

  const toggleCategories = async (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
    } else {
      try {
        setActiveCategory(category);
        await fetchTestsByCategory(category);
      } catch (error) {
        console.error('Error fetching tests by category:', error);
        setError('Failed to fetch tests by category.');
      }
    }
  };

  const fetchUsers = async (classroomId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const usersResponse = await axios.get(`/api/users/by-classroom/${classroomId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const sortedUsers = usersResponse.data.sort((a, b) => {
        const numA = a.student?.student_number || '0000';
        const numB = b.student?.student_number || '0000';
        return numA.localeCompare(numB, undefined, { numeric: true });
      });

      console.log('Fetched users:', sortedUsers);
      setUsers(sortedUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };





  const toggleUserDetailsForUserDetailButton = async (classroomId) => {
    if (userDetailButtonActive) {
      setUserDetailButtonActive(null);
      setUsers([]);
    } else {
      setUserDetailButtonActive(classroomId);
      await fetchUsers(classroomId);
    }
  };


  const fetchMaxScores = async (testId) => {
    try {
      setError(null);
      const maxScoresResponse = await axios.get(`/api/maxscore/by-classroom_and_test/${testId}/`);
      console.log('Fetched sessions:', maxScoresResponse.data);
      return maxScoresResponse.data;
    } catch (error) {
      console.error('Error fetching maxScores:', error);
      setError('Failed to fetch maxScores.');
    }
  };

  const fetchSessions = async (testId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const sessionsResponse = await axios.get(`/api/only-sessions/by-test-and-user/${testId}/${userId}/`);
      console.log('Fetched sessions:', sessionsResponse.data);
      setSessions(sessionsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to fetch sessions.');
      setLoading(false);
    }
  };

  const fetchSessionDetails = async (sessionId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/sessions/${sessionId}/`);
      console.log('Fetched session details:', response.data);
      setSessionDetails(prevDetails => ({
        ...prevDetails,
        [sessionId]: response.data,
      }));
      setLoading(false);
    } catch (error) {
      console.error(`Error fetching session details for ID ${sessionId}:`, error);
      setError(`Failed to fetch session details for ID ${sessionId}.`);
      setLoading(false);
    }
  };

  const toggleClassroomDetails = async (classroomId) => {
    if (activeClassroomId === classroomId) {
      setActiveClassroomId(null);
      setTests([]);
      setUsers([]);
    } else {
      setActiveClassroomId(classroomId);
      await fetchUsers(classroomId);
    }
  };

  const toggleTestDetails = async (testId) => {
    if (activeTestId === testId) {
      setActiveTestId(null);
      setSessions([]);
      setActiveUserId(null);
    } else {
      setActiveTestId(testId);
      setSessions([]);
      setActiveUserId(null);
      try {
        const scores = await fetchMaxScores(testId);

        if (scores) {
          setMaxScores(scores);
        } else {
          console.error('No scores found for category:', category);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  const toggleUserDetails = async (userId) => {
    if (activeUserId === userId) {
      setActiveUserId(null);
      setSessions([]);
    } else {
      setActiveUserId(userId);
      if (activeTestId) {
        await fetchSessions(activeTestId, userId);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };



  const toggleSessionDetails = async (sessionId) => {
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    } else {
      setActiveSessionId(sessionId);
      await fetchSessionDetails(sessionId);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const renderAudio = (question) => {
    if (question.question_sound) {
      return <audio controls src={question.question_sound} />;
    }
    return null;
  };



  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
          <ul>
            {classrooms.map(classroom => (
              <div key={classroom.id}>
                <button
                  style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                  className={`btn btn-dark mb-3 toggle-classroom-btn${activeClassroomId === classroom.id ? ' active' : ''}`}
                  onClick={() => toggleClassroomDetails(classroom.id)}
                >
                  <h5>{classroom.name}の</h5>
                  <h5>テスト記録</h5>
                </button>
                <p>
                <button
                  style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                  className={`btn btn-primary mb-3`}
                  onClick={() => toggleUserDetailsForUserDetailButton(classroom.id)}
                >
                  {userDetailButtonActive ? '生徒管理閉じる' : '生徒管理開く'}
                </button>
                </p>
                {userDetailButtonActive && (
                  <div className="user-list">
                    {users.map(user => (
                      <span key={user.id}>
                      <button
                        style={{ height: '180px', width: '250px', padding: '10px', margin: '5px', border: '5px solid black' }}
                        className={`btn btn-success mb-3`}
                      >
                        <h5>{user.username} - {user.student.student_number}</h5>
                        <h5>最大記録トータル＝{user.total_max_scores}</h5>
                        <h5>英検トータル＝{user.total_eiken_score}</h5>
                      <button className={`btn btn-danger`} onClick={() => openModal(user.id)}>
                        Delete Account
                      </button>
                      </button>
                      </span>
                    ))}
                  </div>
                )}
                {activeClassroomId === classroom.id && (
                  <div className="classroom-details">
                  <button
                    onClick={() => toggleCategories('japanese')}
                    className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
                    style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
                  >日本語</button>
                  <button
                    onClick={() => toggleCategories('english_5')}
                    className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
                    style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
                  >５年英語</button>
                  <button
                    onClick={() => toggleCategories('english_6')}
                    className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
                    style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
                  >６年英語</button>
                  <button
                    onClick={() => toggleCategories('phonics')}
                    className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
                    style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
                  >アルファベットとフォニックス</button>
                  <button
                    onClick={() => toggleCategories('numbers')}
                    className={`btn btn-success mb-3 ${activeCategory === null ? 'active' : 'd-none'}`}
                    style={{ height: '100px', width: '220px', padding: '10px', border: '5px solid black' }}
                  >数字</button>
                　<p>
                　<button
      　            className={`btn btn-success mb-3 toggle-test-btn ${activeCategory !== null && activeTestId === null ? 'active' : 'd-none'}`}
              　    style={{ height: '50px', width: '290px', padding: '10px', border: '5px solid black', position: 'relative', marginBottom: '10px' }}
      　            onClick={() => toggleCategories(activeCategory)}
              　   >
          　        <span
                  　  className="text-center text-white"
      　              style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
              　    >
                  　{activeCategory}から戻る
      　            </span>
              　  </button>
                 </p>
                    {Object.values(tests).flat().sort((a, b) => a.lesson_number - b.lesson_number).map(test => (
                      <span key={test.id}>
                        {activeTestId === null || activeTestId === test.id ? (
                        <span style={{ marginRight: '10px' }}>
                        <button
                          className={`btn btn-warning mb-3 toggle-test-btn ${activeTestId === test.id || activeTestId === null && activeCategory === test.category ? 'active' : 'd-none'}`}
                          style={{ height: '220px', width: '220px', padding: '10px', border: '5px solid black', position: 'relative' }}
                          onClick={() => toggleTestDetails(test.id)}
                        >
                          <span
                            className="text-center text-white"
                            style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '5px', borderRadius: '5px', marginBottom: '10px' }}
                          >
                            {test.name}
                          </span>
                          {test.picture_url && (
                            <img src={test.picture_url} alt="Question" width="170" height="170" />
                          )}
                        </button>
                        </span>
                        ) : null}
                        {activeTestId === test.id && (
                          <div className="test-details">
                            {users.map(user => (
                              <span key={user.id}>
                                {activeUserId === null || activeUserId === user.id ? (
                                <button
                                  className={`btn btn-success mb-3 toggle-user-btn${activeUserId === user.id ? ' active' : ''}`}
                                  style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                  onClick={() => toggleUserDetails(user.id)}
                                >
                                  <h5>{user.username}</h5>
                                  <h5>出席番号: {user.student.student_number}</h5>
                                  {maxScores.map(score =>
                                    score.user === user.id && (
                                      <h5>最大記録：{score.score}/{score.total_questions}</h5>
                                    )
                                  )}
                                </button>
                                ) : null}
                                {activeUserId === user.id && (
                                  <div className="user-details">
                                    {sessions.map(session => (
                                      <span key={session.id}>
                                        {activeSessionId === null || activeSessionId === session.id ? (
                                        <button
                                          className={`btn btn-info mb-3 toggle-session-btn${activeSessionId === session.id ? ' active' : ''}`}
                                          style={{ height: '120px', width: '200px', padding: '10px', margin: '5px', border: '5px solid black' }}
                                          onClick={() => toggleSessionDetails(session.id)}
                                        >
                                          {session.timestamp ? formatTimestamp(session.timestamp) : `Session ${session.id}`}
                                          <h4>点数:{session.total_recorded_score}/{session.total_questions}</h4>
                                        </button>
                                        ) : null}
                                        {activeSessionId === session.id && sessionDetails[session.id] && (
                                          <div className="record-details">
                                            {sessionDetails[session.id].test_records.map(record => (
                                              <div key={record.id} style={{ border: '3px solid black', padding: '10px', marginBottom: '10px' }}>
                                                {record.question_name && (
                                                  <h4>Question: {record.question_name}</h4>
                                                )}
                                                {record.question && (
                                                  <>
                                                    {renderAudio(record.question)}
                                                    {record.question.options.map(option => (
                                                      option.is_correct && (
                                                        <p key={option.id}>Correct option: {option.name}</p>
                                                      )
                                                    ))}
                                                  </>
                                                )}
                                                {record.selected_option_name && (
                                                  <p>Selected Option: {record.selected_option_name}</p>
                                                )}
                                                {record.total_recorded_score === 0 ? (
                                                  <p>Recorded Score: {record.recorded_score}</p>
                                                ) : (
                                                  <h2>Total Score: {record.total_recorded_score}</h2>
                                                )}
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
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ul>
      <Modal show={modalIsOpen} onHide={closeReturnModal}>
        <Modal.Body>
          <p>このアカウントを本当に削除しますか？</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeReturnModal}>いいえ</Button>
          <Button variant="primary" onClick={handleBackClick}>はい</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserTestRecords;