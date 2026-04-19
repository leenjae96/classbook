import { useState, useEffect } from 'react';
import { apiFetch } from "../../hooks/api.ts";
import { getMostRecentSunday } from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import { DateSelector } from "../../components/common/DateSelector.tsx";
import { TeacherReportRow } from "../../components/attendance/TeacherReportRow.tsx";
import { StudentAttendanceRow } from "../../components/attendance/StudentAttendanceRow.tsx";
import styles from './TotalTeacherReports.module.css';

interface TotalReportResponse {
    grade: number | null;
    classNo: string | null;
    sheet: {
        teacherReport: any; // AttendanceDto.TeacherReport
        studentAttendances: any[]; // AttendanceDto.StudentAttendance
    };
}

const TotalTeacherReports = () => {
    const [selectedDate, setSelectedDate] = useState<string>(getMostRecentSunday());
    const [reports, setReports] = useState<TotalReportResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await apiFetch(`/api/administrator/total-reports?date=${selectedDate}`);
                setReports(data);
            } catch (error) {
                console.error("보고서를 불러오지 못했습니다.", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [selectedDate]);

    const getClassName = (grade: number | null, classNo: string | null) => {
        if (grade === null || classNo === null) {
            return '';
        }

        if (grade === 0) return classNo === '0' ? '1부 여자반 - ' : '1부 남자반 - ';
        return `${grade}학년 ${classNo}반 - `;
    };

    const doNothing = () => {};

    return (
        <div className="content">
            <BackButton />
            <h4 style={{ marginBottom: '15px' }}>전체 교사 보고서</h4>

            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>데이터를 불러오는 중...</div>
            ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#868e96' }}>
                    해당 날짜에 제출된 데이터가 없습니다.
                </div>
            ) : (
                <div className={styles.reportList}>
                    {reports.map((report, idx) => {
                        // ✨ report.sheet 안의 재사용 데이터에 접근!
                        const { studentAttendances, teacherReport } = report.sheet;

                        // 선생님이 아직 제출하지 않아서 sheet가 null이거나 비어있는 경우 방어 로직
                        if (!teacherReport || !studentAttendances) return null;

                        const normalStudents = studentAttendances.filter((s: any) => s.studentStatus !== 0);
                        const newStudents = studentAttendances.filter((s: any) => s.studentStatus === 0);

                        const normalPresentCount = normalStudents.filter((s: any) => s.status).length;
                        const newPresentCount = newStudents.filter((s: any) => s.status).length;

                        return (
                            <div key={idx} className={styles.reportCard}>
                                <h4 className={styles.reportHeader}>
                                    {/* teacherReport.name은 AttendanceDto에 정의된 선생님 이름입니다 */}
                                    {getClassName(report.grade, report.classNo)}{teacherReport.name} 선생님
                                </h4>

                                <div className={styles.readOnlyWrapper}>
                                    {/* 1. 기존 학생 */}
                                    <div className="attendance-header">
                                        <h4>기존 재적</h4>
                                        <div className="attendance-stats">
                                            출석 <span className="present-count">{normalPresentCount}</span>명
                                            <span className="separator">|</span> 총인원 {normalStudents.length}명
                                        </div>
                                    </div>
                                    <div className="student-list">
                                        {normalStudents.map((student: any) => (
                                            <StudentAttendanceRow
                                                key={student.id}
                                                studentCheck={student}
                                                onToggle={doNothing}
                                                onCommentChange={doNothing}
                                            />
                                        ))}
                                    </div>

                                    {/* 2. 새친구 (있는 경우만) */}
                                    {newStudents.length > 0 && (
                                        <>
                                            <div className="attendance-header" style={{ marginTop: '15px' }}>
                                                <h4>새친구</h4>
                                                <div className="attendance-stats">
                                                    출석 <span className="new-present-count">{newPresentCount}</span>명
                                                    <span className="separator">|</span> 총인원 {newStudents.length}명
                                                </div>
                                            </div>
                                            <div className="student-list">
                                                {newStudents.map((student: any) => (
                                                    <StudentAttendanceRow
                                                        key={student.id}
                                                        studentCheck={student}
                                                        onToggle={doNothing}
                                                        onCommentChange={doNothing}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #e9ecef' }} />

                                    {/* 3. 교사 코멘트 영역 */}
                                    <TeacherReportRow
                                        teacher={teacherReport}
                                        onWorshipChange={doNothing}
                                        onOtnChange={doNothing}
                                        onDawnPrayChange={doNothing}
                                        onCommentsChange={doNothing}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TotalTeacherReports;