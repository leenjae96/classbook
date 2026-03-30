import {useParams} from "react-router-dom";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {TeacherReportRow} from "../../components/attendance/TeacherReportRow.tsx";
import {TeacherAttendanceRow} from "../../components/attendance/TeacherAttendanceRow.tsx";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {getMostRecentSunday} from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const AdministrativeSheet = () => {
    const { teacherId } = useParams();

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
        initialDate: getMostRecentSunday()
    });

    return (
        <div className="content" style={{ position: 'relative' }}>
            <BackButton/>
            <h4>선생님 출석</h4>

            {/* ✨ 교체된 날짜 선택기 UI */}
            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

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

            <hr style={{ margin: '20px 0' }} />

            {teacherReport && (
                <TeacherReportRow
                    teacher={teacherReport}
                    onWorshipChange={handleWorshipChange}
                    onOtnChange={handleOtnChange}
                    onDawnPrayChange={handleDawnPrayChange}
                    onCommentsChange={handleTeacherReportCommentChange}
                />
            )}

            {/* ✨ 예뻐진 제출 버튼 */}
            <button
                className="submit-btn"
                onClick={submitAttendance}
            >
                제출하기
            </button>
        </div>
    );
}

export default AdministrativeSheet;