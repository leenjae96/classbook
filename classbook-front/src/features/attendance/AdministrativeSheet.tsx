import {useParams} from "react-router-dom";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {TeacherReportRow} from "../../components/attendance/TeacherReportRow.tsx";
import {TeacherAttendanceRow} from "../../components/attendance/TeacherAttendanceRow.tsx";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import { getMostRecentSunday, snapToSunday } from "../../util/dateUtils.tsx";
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
        updateTeacherAttendanceComment,
        loading,
        serverOffsetMs
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?teacherId=${teacherId}`,
        initialDate: getMostRecentSunday()
    });

    const todayStr = new Date().toLocaleDateString('en-CA');
    // 서버 시각 기준 당일 13:30 까지만 저장/수정 허용
    const cutoffMs = new Date(`${selectedDate}T13:30:00+09:00`).getTime();
    const afterCutoff = Date.now() + (serverOffsetMs ?? 0) >= cutoffMs;
    const isLocked =
        new Date().getDay() !== 0 ||
        selectedDate !== todayStr ||
        afterCutoff;

    const lockedBox = (
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
                {afterCutoff && selectedDate === todayStr
                    ? '오후 1시 30분이 지나 저장할 수 없습니다.'
                    : '저장은 당일 오후 1시 30분까지만 가능합니다.'}
            </div>
            <div style={{ fontSize: '13px' }}>
                수정이 필요한 경우 관리자에게 문의하세요.
            </div>
        </div>
    );

    return (
        <div className="content" style={{ position: 'relative' }}>
            <BackButton/>
            <h4>선생님 출석</h4>

            <DateSelector
                selectedDate={selectedDate}
                onChange={(d) => {
                    if (new Date(d + 'T12:00:00').getDay() !== 0) {
                        alert('일요일만 선택이 가능합니다.');
                        setSelectedDate(snapToSunday(d));
                    } else {
                        setSelectedDate(d);
                    }
                }}
            />

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#adb5bd' }}>불러오는 중...</div>
            ) : isLocked ? lockedBox : (
                <>
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
                    ) : <></>}

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

                    <button
                        className="submit-btn"
                        onClick={submitAttendance}
                    >
                        저장하기
                    </button>
                </>
            )}
        </div>
    );
}

export default AdministrativeSheet;