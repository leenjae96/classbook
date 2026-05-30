import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {TeacherReportRow} from "../../components/attendance/TeacherReportRow.tsx";
import {TeacherAttendanceRow} from "../../components/attendance/TeacherAttendanceRow.tsx";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import { getMostRecentSunday } from "../../util/dateUtils.tsx";
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

    const [loadedWorship, setLoadedWorship] = useState<{ date: string; worship: number } | null>(null);
    useEffect(() => {
        if (teacherReport !== undefined && loadedWorship?.date !== selectedDate) {
            setLoadedWorship({ date: selectedDate, worship: teacherReport.worship });
        }
    }, [teacherReport, selectedDate]);

    const isLocked =
        selectedDate < getMostRecentSunday() ||
        (selectedDate === getMostRecentSunday() &&
            loadedWorship?.date === selectedDate &&
            loadedWorship.worship !== -1);

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
                제출이 완료되었거나 날짜가 지났습니다.
            </div>
            <div style={{ fontSize: '13px' }}>
                통계만 확인이 가능하며, 수정이 필요할 시에는 관리자에게 문의해주세요.
            </div>
        </div>
    );

    return (
        <div className="content" style={{ position: 'relative' }}>
            <BackButton/>
            <h4>선생님 출석</h4>

            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

            {isLocked ? lockedBox : (
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
                        제출하기
                    </button>
                </>
            )}
        </div>
    );
}

export default AdministrativeSheet;