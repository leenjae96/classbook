import {useParams} from 'react-router-dom';
import {TeacherReportRow} from "../../components/attendance/TeacherReportRow.tsx";
import {useAttendance} from "../../hooks/useAttendance.ts";
import {StudentAttendanceRow} from "../../components/attendance/StudentAttendanceRow.tsx";
import {DateSelector} from "../../components/common/DateSelector.tsx"; // 공통 날짜 선택기 임포트
import {getMostRecentSunday} from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx"; // 유틸 임포트
import './ClassroomSheet.css';

const ClassroomSheet = () => {
    const { grade, classNo } = useParams();
    const {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
        teacherReport,
        handleWorshipChange,
        handleOtnChange,
        handleDawnPrayChange,
        handleTeacherReportCommentChange,
        submitAttendance
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?grade=${grade}&classNo=${classNo}`,
        // ✨ 핵심: 오늘 날짜가 아니라 가장 최근 주일로 기본 세팅!
        initialDate: getMostRecentSunday()
    });

    const normalStudents = studentAttendances.filter(student => student.studentStatus !== 0);
    const newStudents = studentAttendances.filter(student => student.studentStatus === 0);


    // 기존 학생 통계
    const normalTotalCount = normalStudents.length;
    const normalPresentCount = normalStudents.filter(student => student.status).length;

    // 새친구 통계
    const newTotalCount = newStudents.length;
    const newPresentCount = newStudents.filter(student => student.status).length;

    return (
        <div className="content" style={{ position: 'relative' }}>
            <BackButton/>
            {/* 한 줄로 얇게 만든 요약 박스 */}
            <div className="summary-box">
                {/* 왼쪽: 반 정보 및 선생님 이름 */}
                <div className="summary-left">
                    {grade == '0' ? (classNo == '0' ? '여자' : '남자') : classNo}반 {teacherReport?.name} 쌤
                </div>

                {/* 오른쪽: 출석/재적 인원 요약 */}
                <div className="summary-right">
                    출석 <span className="present-count">{normalPresentCount}</span>명
                    <span className="separator">|</span>
                    재적 {normalTotalCount}명
                </div>
            </div>

            {/* 교체된 날짜 선택기 UI */}
            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

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
                        <div className="summary-left" style={{ color: '#f57c00' }}>
                            🌱 새친구
                        </div>
                        <div className="summary-right">
                            출석 <span className="new-present-count">{newPresentCount}</span>명
                            <span className="separator">|</span>
                            총인원 {newTotalCount}명
                        </div>
                    </div>

                    <div className="student-list">
                        {newStudents.map((studentCheck) => (
                            <StudentAttendanceRow
                                key={studentCheck.id}
                                studentCheck={studentCheck}
                                onToggle={toggleStudentAttendance}
                                onCommentChange={updateStudentAttendanceComment}
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

            <button
                className="submit-btn"
                onClick={submitAttendance}
            >
                제출하기
            </button>
        </div>
    );
};

export default ClassroomSheet;