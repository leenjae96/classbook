import {useNavigate, useParams} from 'react-router-dom';
import {TeacherRow} from "../../components/attendance/TeacherRow.tsx";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {StudentRow} from "../../components/attendance/StudentRow.tsx";

const ClassroomSheet = () => {
        // URL 파라미터 타입 지정 (className은 문자열)
        const {grade, classNo} = useParams();
        const navigate = useNavigate();

        // 1. Hook을 사용해 로직을 전부 가져옴 (코드 량 대폭 감소)
        const {
            selectedDate,
            setSelectedDate,
            studentChecks,
            teacherCheck,
            toggleStatus,
            handleStudentCommentsChange,
            submitAttendance,
            handleWorshipChange,
            handleOtnChange,
            handleDawnPrayChange,
            handleTeacherCommentsChange
        } = useAttendance({
            apiEndpoint: `/api/attendances/sheet?grade=${grade}&classNo=${classNo}` ,// 새친구 API 엔드포인트
            initialDate: new Date().toLocaleDateString('en-CA')
        });

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

                {/* 학생 리스트 (StudentRow 재사용) */}
                <div className="student-list">
                    {studentChecks.map((studentCheck) => (
                        <StudentRow
                            key={studentCheck.id}
                            studentCheck={studentCheck}
                            onToggle={toggleStatus}
                            onCommentChange={handleStudentCommentsChange}
                        />
                    ))}
                </div>

                <hr style={{margin: '20px 0'}}/>

                {/* 선생님 출석 */}
                {teacherCheck && (
                    <TeacherRow
                        teacher={teacherCheck}
                        onWorshipChange={handleWorshipChange}
                        onOtnChange={handleOtnChange}
                        onDawnPrayChange={handleDawnPrayChange}
                        onCommentsChange={handleTeacherCommentsChange}
                    />
                )}

                <button
                    className="menu-btn"
                    onClick={submitAttendance}
                    style={{backgroundColor: '#28a745'}}
                >
                    제출하기
                </button>
            </div>
        );
    }
;

export default ClassroomSheet;