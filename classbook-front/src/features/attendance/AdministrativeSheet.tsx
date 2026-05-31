import { useEffect, useState } from "react";
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
        loading
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

    const todayStr = new Date().toLocaleDateString('en-CA');
    const isLocked =
        new Date().getDay() !== 0 ||
        selectedDate !== todayStr ||
        (loadedWorship?.date === selectedDate && loadedWorship.worship !== -1);

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
                제출은 당일에만 가능합니다.
            </div>
            <div style={{ fontSize: '13px' }}>
                제출 이후 보고서 열람을 원하는 경우 관리자에게 문의하세요.
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
                        제출하기
                    </button>
                </>
            )}
        </div>
    );
}

export default AdministrativeSheet;