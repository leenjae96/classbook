import {useNavigate, useParams} from 'react-router-dom';
import BackButton from "../../components/common/BackButton.tsx";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {getMostRecentSaturday, snapToSaturday} from "../../util/dateUtils.tsx";
import {apiFetch} from "../../hooks/api.ts";
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
        loading
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
            await apiFetch(`/api/attendances/sheet?date=${selectedDate}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ studentAttendances }),
            });
            alert('제출되었습니다!');
            navigate(-1);
            return true;
        } catch (e) {
            console.error(e);
            alert('제출 실패');
            return false;
        }
    }, [selectedDate, studentAttendances]);


    const isLocked = new Date().getDay() !== 6 || selectedDate !== new Date().toLocaleDateString('en-CA');

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
                onChange={(d) => {
                    if (new Date(d + 'T12:00:00').getDay() !== 6) {
                        alert('토요일만 선택이 가능합니다.');
                        setSelectedDate(snapToSaturday(d));
                    } else {
                        setSelectedDate(d);
                    }
                }}
            />

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#adb5bd' }}>불러오는 중...</div>
            ) : isLocked ? (
                <div style={{
                    marginTop: '12px',
                    padding: '30px 20px',
                    backgroundColor: '#f1f3f5',
                    borderRadius: '10px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    color: '#868e96',
                    lineHeight: '1.8',
                }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
                        제출은 당일에만 가능합니다.
                    </div>
                    <div style={{ fontSize: '13px' }}>
                        제출 이후 보고서 열람을 원하는 경우 관리자에게 문의하세요.
                    </div>
                </div>
            ) : (
                <>
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
                        onClick={submitAttendance}
                    >
                        제출하기
                    </button>
                </>
            )}

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