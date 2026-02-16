import {useState, useRef, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import type {Sheet, StudentCheck} from "../../constants/types.tsx";

const WorshipTeamSheet = () => {
    // URL 파라미터 타입 지정 (className은 문자열)
    const {teamName} = useParams<{ teamName: string }>();
    const navigate = useNavigate();


    // 1. 날짜 선택
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
    const [studentChecks, setStudentChecks] = useState<StudentCheck[]>([]);

    const [popupInfo, setPopupInfo] = useState<string | null>(null);
    const timerRef = useRef<number | null>(null);
    const isLongPress = useRef<boolean>(false);

    useEffect(() => {
        fetch(`/api/attendances/sheet?teamName=${teamName}&date=${selectedDate}`)
            .then(res => {
                if (!res.ok) throw Error(`responseError! status : ${res.status}`)
                return res.json();
            })
            .then((data: Sheet) => {
                setStudentChecks(data.studentChecks);
            })
            .catch(error => {
                console.log(error);
            })
    }, [selectedDate, teamName]);

    // 1. 누르기 시작 (마우스/터치 통합)
    const handlePointerDown = (studentCheck: StudentCheck) => {
        console.log(studentCheck);

        isLongPress.current = false;
        timerRef.current = window.setTimeout(() => {
            isLongPress.current = true;
            setPopupInfo("test 정보"); // 0.7초 뒤 롱프레스 인식
        }, 700);
    };

    // 2. 떼기 (마우스/터치 통합)
    const handlePointerUp = (studentId: number) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current); // 타이머 취소
            timerRef.current = null;
        }
        setPopupInfo(null); // 정보창 끄기

        // 롱프레스가 아니었을 때만 체크 토글
        if (!isLongPress.current) {
            toggleStatus(studentId);
        }
        // 상태 초기화
        isLongPress.current = false;
    };

    // 3. 버튼 밖으로 나갔을 때 (취소 처리)
    const handlePointerLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setPopupInfo('');
        isLongPress.current = false;
    };

    const toggleStatus = (id: number) => {
        setStudentChecks(prev => prev.map(s =>
            s.id === id ? {...s, status: !s.status} : s
        ));
    };

    const handleStudentCommentsChange = (studentId: number, comments: string) => {
        setStudentChecks(prev => prev.map(s =>
            s.id === studentId ? {...s, comments: comments} : s
        ));
    };


    const handleSubmit = () => {
        if (new Date(selectedDate).getDay() !== 6) {
            alert('토요일만 출석 제출이 가능해요.');
            return;
        }

        fetch(`/api/attendances/sheet?&date=${selectedDate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studentChecks: studentChecks,
            }),
        })
            .then(res => console.log(res));
        alert('제출되었습니다!');
        navigate(-1);
    };

    return (
        <div className="content" style={{position: 'relative'}}>
            <button onClick={() => navigate(-1)} style={{marginBottom: '10px'}}>← 뒤로가기</button>
            <h3>{teamName} 출석부</h3>
            개발중인 페이지입니다.
            {/* 1. 날짜 선택기 */}
            <div style={{
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <label style={{marginRight: '10px', fontWeight: 'bold'}}>날짜:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{padding: '5px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc'}}
                />
            </div>
            {/* 학생 리스트 */}
            <div className="student-list">
                {studentChecks.map((studentCheck) => (
                    <div key={studentCheck.id} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                        {/* 학생 버튼 */}
                        <button
                            onPointerDown={() => handlePointerDown(studentCheck)}
                            onPointerUp={() => handlePointerUp(studentCheck.id)}
                            onPointerLeave={() => handlePointerLeave()}
                            style={{
                                flex: 1,
                                padding: '15px',
                                backgroundColor: studentCheck.status ? '#4caf50' : '#e0e0e0',
                                color: studentCheck.status ? 'white' : 'black',
                                border: 'none',
                                borderRadius: '5px',
                                marginRight: '10px',
                                //(마우스의경우)올렸을때 손가락 모양으로 바뀜
                                cursor: 'pointer',
                                //버튼 내부 텍스트를 긁지 못하도록
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                //버튼에 대해서 스크롤과 패닝만 가능(더블탭 기능 삭제)
                                touchAction: 'manipulation',
                                transition: 'background-color 0.3s'
                            }}
                        >
                            {studentCheck.studentName}
                        </button>

                        {/* 특이사항 입력 */}
                        <input
                            type="text"
                            placeholder="결석/지각 사유 및 특이 사항"
                            value={studentCheck.comments}
                            onChange={(e) => handleStudentCommentsChange(studentCheck.id, e.target.value)}
                            style={{width: '70%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                        />
                    </div>
                ))}
            </div>

            <hr style={{margin: '20px 0'}}/>

            <button className="menu-btn" onClick={handleSubmit} style={{backgroundColor: '#28a745'}}>제출하기</button>
            {/* 꾹 눌렀을 때 정보창 (Modal) */}
            {popupInfo && (
                <div style={{
                    position: 'absolute',
                    top: '40%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    zIndex: 1000,
                    width: '80%',
                    textAlign: 'center',
                    pointerEvents: 'none', // 터치 간섭 방지
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                    <h4 style={{margin: '0 0 10px 0'}}>학생 정보</h4>
                    {popupInfo}
                </div>
            )}
        </div>
    );
};

export default WorshipTeamSheet;