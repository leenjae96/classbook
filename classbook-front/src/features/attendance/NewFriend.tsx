import {useAttendance} from "../../hooks/useAttendance.ts";
import {StudentAttendanceRow} from "../../components/attendance/StudentAttendanceRow.tsx";
import {useState} from "react";
import type {StudentAttendance, StudentInfo} from "../../constants/types.tsx";
import {StudentInfoModal} from "../../components/attendance/StudentInfoModal.tsx";
import {NewFriendCumulativeModal} from "../../components/attendance/NewFriendCumulativeModal.tsx";
import {apiFetch} from "../../hooks/api.ts";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {getMostRecentSunday, snapToSunday} from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const NewFriend = () => {
    const {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
        submitAttendance,
        loading
    } = useAttendance({
        apiEndpoint: '/api/attendances/new-friend/sheet',
        initialDate: getMostRecentSunday()
    });

    const isLocked = new Date().getDay() !== 0 || selectedDate !== new Date().toLocaleDateString('en-CA');

    // 학생 정보 모달 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentInfo | null>(null);

    // 누적 통계 모달 상태
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    const handleEditClick = async (student: StudentAttendance) => {
        try {
            const studentDetail = await apiFetch(`/api/attendances/student?id=${student.id}`);
            setTargetStudent(studentDetail);
            setIsModalOpen(true);
        } catch (error) {
            console.error("학생 정보 조회 실패:", error);
            alert("학생 상세 정보를 불러오는데 실패했습니다.");
        }
    };

    // 새친구 추가 버튼 클릭 시
    const handleAddClick = () => {
        setTargetStudent(null); // null이면 추가 모드
        setIsModalOpen(true);
    };

    return (
        <div className="content">
            <div className="header-buttons">
                <BackButton />
                <button
                    className="stats-button"
                    onClick={() => setIsStatsModalOpen(true)}
                >
                    누적 통계
                </button>
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4>새친구 관리</h4>
                <button
                    onClick={handleAddClick}
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
            </div>

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
                                sheetDate={selectedDate}
                                renderRightAction={(s) => (
                                    <button
                                        onClick={() => handleEditClick(s)}
                                        style={{
                                            padding: '10px', background: '#6c757d', color: 'white',
                                            border: 'none', borderRadius: '5px', cursor: 'pointer'
                                        }}
                                    >
                                        ⚙️
                                    </button>
                                )}
                            />
                        ))}
                    </div>
                    <hr style={{margin: '20px 0'}}/>
                    <button className="submit-btn" onClick={submitAttendance}>
                        제출하기
                    </button>
                </>
            )}

            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="newFriend"
                studentInfo={targetStudent}
                onSave={async (data) => {
                    try {
                        // id가 있으면 기존 학생 수정(PUT), 없으면 새친구 추가(POST)
                        const isEdit = !!data.id;
                        const method = isEdit ? 'PUT' : 'POST';
                        const url = '/api/attendances/new-friend';
                        // 백엔드(EditStudentInfo)는 수정 사유를 comments 로 받음 → editReason 매핑
                        const { editReason, ...rest } = data;
                        await fetch(url, {
                            method: method,
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ ...rest, comments: editReason }),
                        });
                        alert(isEdit ? '정보가 수정되었습니다.' : '새친구가 등록되었습니다.');
                        setIsModalOpen(false);
                        // 저장 후 목록을 갱신하기 위해 페이지 새로고침 (또는 fetch 함수 재호출)
                    } catch (error) {
                        console.error("학생 정보 저장 실패:", error);
                        alert("저장에 실패했습니다. 다시 시도해주세요.");
                    }
                }}
            />

            <NewFriendCumulativeModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
            />
        </div>
    );
};

export default NewFriend;