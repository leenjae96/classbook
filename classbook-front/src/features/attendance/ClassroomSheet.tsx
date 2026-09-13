import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TeacherReportRow } from "../../components/attendance/TeacherReportRow.tsx";
import { useAttendance } from "../../hooks/useAttendance.ts";
import { StudentAttendanceRow } from "../../components/attendance/StudentAttendanceRow.tsx";
import { DateSelector } from "../../components/common/DateSelector.tsx";
import { getMostRecentSunday, snapToSunday } from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import './ClassroomSheet.css';
import {ClassroomCumulativeStatisticsModal} from "../../components/attendance/ClassroomCumulativeStatisticsModal.tsx";
import {StudentInfoModal} from "../../components/attendance/StudentInfoModal.tsx";
import type {StudentInfo} from "../../constants/types.tsx";
import {apiFetch} from "../../hooks/api.ts";

const ClassroomSheet = () => {
    const { grade, classNo } = useParams();

    // 모달 열림/닫힘 상태 관리
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const {
        selectedDate, setSelectedDate, studentAttendances,
        toggleStudentAttendance, updateStudentAttendanceComment,
        teacherReport, handleWorshipChange, handleOtnChange,
        handleDawnPrayChange, handleTeacherReportCommentChange, submitAttendance,
        loading, serverOffsetMs, refreshStudents
    } = useAttendance({
        apiEndpoint: `/api/attendances/sheet?grade=${grade}&classNo=${classNo}`,
        initialDate: getMostRecentSunday()
    });

    // 이 반으로 새친구 등록 → 출석부 명단만 갱신 (저장 전 체크는 유지)
    const handleAddNewFriend = async (data: Partial<StudentInfo> & { editReason?: string }) => {
        try {
            const { editReason, ...rest } = data;
            await apiFetch('/api/attendances/new-friend', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ ...rest, comments: editReason }),
            });
            alert('새친구가 등록되었습니다.');
            setIsAddModalOpen(false);
            refreshStudents();
        } catch (error) {
            console.error("새친구 등록 실패:", error);
            alert(error instanceof Error && error.message ? error.message : "저장에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const todayStr = new Date().toLocaleDateString('en-CA');
    // 서버 시각 기준 당일 14:00 까지 무제한 저장/수정 허용, 이후 잠금
    const cutoffMs = new Date(`${selectedDate}T14:00:00+09:00`).getTime();
    const afterCutoff = Date.now() + (serverOffsetMs ?? 0) >= cutoffMs;
    const isLocked =
        new Date().getDay() !== 0 ||
        selectedDate !== todayStr ||
        afterCutoff;

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
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            padding: '5px 10px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px'
                        }}
                    >
                        + 추가
                    </button>
                    <button
                        className="stats-button"
                        onClick={() => setIsStatsModalOpen(true)}
                    >
                        누적 통계
                    </button>
                </div>
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
                        {afterCutoff && selectedDate === todayStr
                            ? '오후 2시가 지나 저장할 수 없습니다.'
                            : '저장은 당일 오후 2시까지만 가능합니다.'}
                    </div>
                    <div style={{ fontSize: '13px' }}>
                        수정이 필요한 경우 관리자에게 문의하세요.
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
                        저장하기
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

            {/* 새친구 추가: 학년/반은 이 반으로 고정, 첫 출석일 기본값은 보고 있는 날짜 */}
            <StudentInfoModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                mode="newFriend"
                studentInfo={null}
                onSave={handleAddNewFriend}
                fixedClassroom={grade !== undefined && classNo !== undefined
                    ? { grade: Number(grade), classNo }
                    : undefined}
                defaultRegisteredAt={selectedDate}
            />
        </div>
    );
};

export default ClassroomSheet;