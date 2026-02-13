import {useState, useRef, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import type {Sheet, StudentCheck, TeacherCheck} from "../constants/types.tsx";

const ClassroomSheet = () => {
        // URL 파라미터 타입 지정 (className은 문자열)
        const {grade, classNo} = useParams();
        const navigate = useNavigate();

        // 1. 날짜 선택
        const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));

        // 상태 관리 (Generic 사용)
        const [studentChecks, setStudentChecks] = useState<StudentCheck[]>([]);
        const [teacherCheck, setTeacherCheck] = useState<TeacherCheck>();
        const [popupInfo, setPopupInfo] = useState<string | null>(null);
        // 이벤트 핸들링을 위한 Ref (Timer ID 저장)

        const timerRef = useRef<number | null>(null);
        const isLongPress = useRef<boolean>(false);

        useEffect(() => {
            if (!selectedDate) return; // 날짜 없으면 요청 X

            fetch(`/api/attendances/sheet?grade=${grade}&classNo=${classNo}&date=${selectedDate}`)
                .then((res) => {
                    if (!res.ok) throw Error(`responseError! status : ${res.status}`)
                    return res.json();
                })
                .then((data: Sheet) => {
                    setStudentChecks(data.studentChecks);
                    setTeacherCheck(data.teacherCheck);
                })
                .catch(error => {
                    console.log(error);
                })
        }, [selectedDate, classNo])

        // 1. 누르기 시작 (마우스/터치 통합)
        const handlePointerDown = (studentCheck: StudentCheck) => {
            console.log(studentCheck)
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

        const toggleStatus = (studentId: number) => {
            setStudentChecks(prev => prev.map(s =>
                s.id === studentId ? {...s, status: !s.status} : s
            ));
        };

        const handleStudentCommentsChange = (studentId: number, comments: string) => {
            setStudentChecks(prev => prev.map(s =>
                s.id === studentId ? {...s, comments: comments} : s
            ));
        };

        const handleWorshipChange = (worship: number) => {
            setTeacherCheck(prev => {
                if (!prev) return prev;
                return {...prev, worship: worship}
            });
        }

        const handleOtnChange = (otn: number) => {
            setTeacherCheck(prev => {
                if (!prev) return prev;
                return {...prev, otn: otn === 1}
            })
        }

        const handleDawnPrayChange = (dawnPray: number) => {
            setTeacherCheck(prev => {
                if (!prev) return prev;
                return {...prev, dawnPray: dawnPray}
            })
        }

        const handleTeacherCommentsChange = (comments: string) => {
            setTeacherCheck(prev => {
                if (!prev) return prev;
                return {...prev, comments: comments}
            })
        }

        const handleSubmit = () => {
            if (new Date(selectedDate).getDay() !== 0) {
                alert('일요일만 출석 제출이 가능해요.');
                return;
            }
            if (teacherCheck?.worship === -1) {
                alert('선생님 예배 여부를 선택해주세요.');
                return;
            }

            fetch(`/api/attendances/sheet?date=${selectedDate}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentChecks: studentChecks,
                    teacherCheck: {
                        ...teacherCheck,
                        dawnPray: teacherCheck?.dawnPray ?? 0
                    }
                }),
            })
                .then(res => console.log(res));
            alert('제출되었습니다!');
            navigate(-1);
        };

        return (
            <div className="content" style={{position: 'relative'}}>
                <button className="go-back-btn" onClick={() => navigate(-1)} style={{marginBottom: '10px'}}>← 뒤로가기</button>
                <h3>
                    {grade == '0' ?
                        classNo == '0' ? '여자' : '남자' :
                        classNo
                    }
                    반 출석부
                </h3>

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
                    {studentChecks.map((studentCheck: StudentCheck) => (
                        <div key={studentCheck.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}
                        >
                            {/* 학생 버튼 */}
                            <button
                                onPointerDown={() => handlePointerDown(studentCheck)}
                                onPointerUp={() => handlePointerUp(studentCheck.id)}
                                onPointerLeave={() => handlePointerLeave()}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    fontSize: '13px',
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
                                    transition: 'background-color 0.3s',
                                    minWidth: '90px'
                                }}
                            >
                                {studentCheck.studentName}
                            </button>

                            {/* 특이사항 입력 */}
                            <input
                                type="text"
                                placeholder="결석 사유 및 심방 내용"
                                value={studentCheck.comments}
                                onChange={(e) => handleStudentCommentsChange(studentCheck.id, e.target.value)}
                                style={{width: '70%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                            />
                        </div>
                    ))}
                </div>

                <hr style={{margin: '20px 0'}}/>

                {/* 선생님 출석 */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>주일 예배 참석 <span
                        style={{color: 'red'}}>*</span></label>
                    <select
                        value={teacherCheck?.worship ?? -1}
                        onChange={(e) => handleWorshipChange(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value={-1} disabled hidden>선택하세요</option>
                        <option value={1}>1부</option>
                        <option value={2}>2부</option>
                        <option value={3}>3부</option>
                        <option value={4}>4부</option>
                        <option value={5}>5부</option>
                        <option value={6}>6부</option>
                        <option value={0}>안 드림</option>
                    </select>
                </div>

                {/* 2. OTN */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>OTN 참석</label>
                    <select
                        value={teacherCheck?.otn ? 1 : 0}
                        onChange={(e) => handleOtnChange(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value={1}>참석</option>
                        <option value={0}>불참</option>
                    </select>
                </div>

                {/* 3. 새벽기도 */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>새벽기도 참석</label>
                    <select
                        value={teacherCheck?.dawnPray ?? -1}
                        onChange={(e) => handleDawnPrayChange(Number(e.target.value))}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '16px',
                            borderRadius: '5px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value={0}>0 회</option>
                        <option value={1}>1 회</option>
                        <option value={2}>2 회</option>
                        <option value={3}>3 회</option>
                        <option value={4}>4 회</option>
                        <option value={5}>5 회</option>
                    </select>
                </div>

                {/* 건의사항 */}
                <textarea
                    placeholder="선생님 심방, 기도제목을 적어주세요."
                    style={{width: '95%', height: '80px', marginBottom: '10px', padding: '10px', borderRadius: '5px'}}
                    onChange={(e) => handleTeacherCommentsChange(e.target.value)}
                />

                <button
                    className="menu-btn"
                    onClick={handleSubmit}
                    style={{backgroundColor: '#28a745'}}
                >
                    제출하기
                </button>

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
    }
;

export default ClassroomSheet;