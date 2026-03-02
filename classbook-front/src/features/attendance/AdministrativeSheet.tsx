import {useNavigate, useParams} from "react-router-dom";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {TeacherReportRow} from "../../components/attendance/TeacherReportRow.tsx";
import {TeacherAttendanceRow} from "../../components/attendance/TeacherAttendanceRow.tsx";

const AdministrativeSheet = () => {
    // URL 파라미터 타입 지정 (className은 문자열)
    const {teacherId} = useParams();
    const navigate = useNavigate();

    // 1. Hook을 사용해 로직을 전부 가져옴 (코드 량 대폭 감소)
    const {
        selectedDate,
        setSelectedDate,
        teacherReport,
        submitAttendance,
        handleWorshipChange,
        handleOtnChange,
        handleDawnPrayChange,
        handleTeacherReportCommentChange,
        teacherAttendances,
        toggleTeacherAttendance,
        updateTeacherAttendanceComment
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?teacherId=${teacherId}`,
        initialDate: new Date().toLocaleDateString('en-CA')
    });

    return (
        <div className="content" style={{position: 'relative'}}>
            <button className="go-back-btn" onClick={() => navigate(-1)} style={{marginBottom: '10px'}}>← 뒤로가기</button>
            <h3>
                선생님 출석
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

            {teacherId == '2' ? (
                <div className="teacher-list">
                    {teacherAttendances.map((teacherAttendance) => (
                        <TeacherAttendanceRow
                            key={teacherAttendance.id}
                            teacherAttendance={teacherAttendance}
                            onToggle={toggleTeacherAttendance}
                            onCommentChange={updateTeacherAttendanceComment}
                        />
                    ))}
                </div>
            ) : (
                <></>
            )}

            <hr style={{margin: '20px 0'}}/>

            {/* 선생님 출석 */}
            {teacherReport && (
                <TeacherReportRow
                    teacher={teacherReport}
                    onWorshipChange={handleWorshipChange}
                    onOtnChange={handleOtnChange}
                    onDawnPrayChange={handleDawnPrayChange}
                    onCommentsChange={handleTeacherReportCommentChange}
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

export default AdministrativeSheet