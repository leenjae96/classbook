import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TeacherReportRow } from "../../components/attendance/TeacherReportRow.tsx";
import { useAttendance } from "../../hooks/useAttendance.ts";
import { StudentAttendanceRow } from "../../components/attendance/StudentAttendanceRow.tsx";
import { DateSelector } from "../../components/common/DateSelector.tsx";
import { getMostRecentSunday, snapToSunday } from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import './ClassroomSheet.css';
import {ClassroomCumulativeStatisticsModal} from "../../components/attendance/ClassroomCumulativeStatisticsModal.tsx";

const ClassroomSheet = () => {
    const { grade, classNo } = useParams();

    // 모달 열림/닫힘 상태 관리
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    const {
        selectedDate, setSelectedDate, studentAttendances,
        toggleStudentAttendance, updateStudentAttendanceComment,
        teacherReport, handleWorshipChange, handleOtnChange,
        handleDawnPrayChange, handleTeacherReportCommentChange, submitAttendance,
        loading
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?grade=${grade}&classNo=${classNo}`,
        initialDate: getMostRecentSunday()
    });

    // 날짜별 최초 로드 시점의 worship 값을 캡처 (사용자가 선택을 바꿔도 잠금 조건에 영향 없도록)
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

    const normalStudents = studentAttendances.filter(student => student.studentStatus !== 0);
    const newStudents = studentAttendances.filter(student => student.studentStatus === 0);

    const normalTotalCount = normalStudents.length;
    const normalPresentCount = normalStudents.filter(student => student.status).length;
    const newTotalCount = newStudents.length;
    const newPresentCount = newStudents.filter(student => student.status).length;

    return (
        <div className="content" style={{ position: 'relative' }}>

            <div className="header-buttons">
                <BackButton />
                <button
                    className="stats-button"
                    onClick={() => setIsStatsModalOpen(true)}
                >
                    누적 통계
                </button>
            </div>

            <div className="summary-box">
                <div className="summary-left">
                    {grade == '0' ? (classNo == '0' ? '여자' : '남자') : classNo}반 {teacherReport?.name} 쌤
                </div>
                <div className="summary-right">
                    출석 <span className="present-count">{normalPresentCount}</span>명
                    <span className="separator">|</span> 재적 {normalTotalCount}명
                </div>
            </div>

            <DateSelector selectedDate={selectedDate} onChange={(d) => {
                if (new Date(d + 'T12:00:00').getDay() !== 0) {
                    alert('일요일만 선택이 가능합니다.');
                    setSelectedDate(snapToSunday(d));
                } else {
                    setSelectedDate(d);
                }
            }} />

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
                        {normalStudents.map((studentCheck) => (
                            <StudentAttendanceRow
                                key={studentCheck.id}
                                studentCheck={studentCheck}
                                onToggle={toggleStudentAttendance}
                                onCommentChange={updateStudentAttendanceComment}
                            />
                        ))}
                    </div>

                    {newStudents.length > 0 && (
                        <>
                            <hr className="section-divider" />
                            <div className="summary-box new-friend">
                                <div className="summary-left" style={{ color: '#f57c00' }}>🌱 새친구</div>
                                <div className="summary-right">
                                    출석 <span className="new-present-count">{newPresentCount}</span>명
                                    <span className="separator">|</span> 총인원 {newTotalCount}명
                                </div>
                            </div>
                            <div className="student-list">
                                {newStudents.map((studentCheck) => (
                                    <StudentAttendanceRow
                                        key={studentCheck.id}
                                        studentCheck={studentCheck}
                                        onToggle={toggleStudentAttendance}
                                        onCommentChange={updateStudentAttendanceComment}
                                        sheetDate={selectedDate}
                                    />
                                ))}
                            </div>
                        </>
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

                    <button className="submit-btn" onClick={submitAttendance}>
                        제출하기
                    </button>
                </>
            )}

            {/* 2. 모달 컴포넌트 마운트 */}
            <ClassroomCumulativeStatisticsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                grade={Number(grade)}
                classNo={classNo!}
            />
        </div>
    );
};

export default ClassroomSheet;