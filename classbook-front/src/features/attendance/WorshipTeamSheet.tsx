import {useNavigate, useParams} from 'react-router-dom';
import BackButton from "../../components/common/BackButton.tsx";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {getMostRecentSaturday} from "../../util/dateUtils.tsx";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {StudentAttendanceRow} from "../../components/attendance/StudentAttendanceRow.tsx";
import {useCallback} from "react";

const WorshipTeamSheet = () => {
    // URL 파라미터 타입 지정 (className은 문자열)
    const {teamName} = useParams<{ teamName: string }>();

    const {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?teamName=${teamName}`,
        initialDate: getMostRecentSaturday(),
    });

    const navigate = useNavigate();

    //const [popupInfo, setPopupInfo] = useState<string | null>(null);
    //const timerRef = useRef<number | null>(null);
    //const isLongPress = useRef<boolean>(false);

    const submitAttendance = useCallback(async () => {
        if (new Date(selectedDate).getDay() !== 6) {
            alert('토요일만 출석 제출이 가능해요.');
            return;
        }

        try {
            await fetch(`/api/attendances/sheet?date=${selectedDate}`, { // 엔드포인트는 상황에 맞게 조정 필요
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    studentAttendances: studentAttendances,
                }),

            });
            alert('제출되었습니다!');
            console.log(studentAttendances);
            navigate(-1);
            return true;
        } catch (e) {
            console.error(e);
            alert('제출 실패');
            return false;
        }
    }, [selectedDate, studentAttendances]);


    const totalCount = studentAttendances.length;
    const presentCount = studentAttendances.filter(student => student.status).length;

    return (
        <div className="content" style={{position: 'relative'}}>
            <BackButton/>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                padding: '12px 16px', // 높이를 낮게 하기 위해 padding 조절
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                marginBottom: '15px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)' // 살짝 그림자 줘서 입체감 부여
            }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#343a40' }}>
                    {teamName} 출석부
                </div>

                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                    출석 <span style={{ fontWeight: 'bold', color: '#4caf50', fontSize: '15px' }}>{presentCount}</span>명
                    <span style={{ margin: '0 5px', color: '#ced4da' }}>|</span>
                    재적 {totalCount}명
                </div>
            </div>

            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />
            {/* 학생 리스트 */}
            <div className="student-list">
                {studentAttendances.map((studentCheck) => (
                    <StudentAttendanceRow
                        key={studentCheck.id}
                        studentCheck={studentCheck}
                        onToggle={toggleStudentAttendance}
                        onCommentChange={updateStudentAttendanceComment}
                    />
                ))}
            </div>

            <hr style={{margin: '20px 0'}}/>

            <button
                className="submit-btn"
                onPointerUp={submitAttendance}
            >
                제출하기
            </button>

            {/* 꾹 눌렀을 때 정보창 (Modal)
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
            )}*/}
        </div>
    );
};

export default WorshipTeamSheet;