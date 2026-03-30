import {useAttendance} from "../../hooks/useAttendance.ts"; // Hook 사용
import {StudentAttendanceRow} from "../../components/attendance/StudentAttendanceRow.tsx"; // Component 사용
import {useState} from "react";
import type {StudentAttendance, StudentInfo} from "../../constants/types.tsx";
import {StudentInfoModal} from "../../components/attendance/StudentInfoModal.tsx";
import {apiFetch} from "../../hooks/api.ts";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {getMostRecentSunday} from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const NewFriend = () => {
    const {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
        submitAttendance
    } = useAttendance({
        apiEndpoint: '/api/attendances/new-friend/sheet',
        initialDate: getMostRecentSunday()
    });

    // 모달 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentInfo | null>(null); // 수정할 학생 객체

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
            <BackButton/>

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

            {/* ✨ 교체된 날짜 선택기 UI */}
            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

            <div className="student-list">
                {studentAttendances.map((studentCheck) => (
                    <StudentAttendanceRow
                        key={studentCheck.id}
                        studentCheck={studentCheck}
                        onToggle={toggleStudentAttendance}
                        onCommentChange={updateStudentAttendanceComment}
                        // ★ 새친구 페이지 전용: 우측에 수정 버튼(⚙️) 배치
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

            <button
                className="submit-btn"
                onClick={submitAttendance}
            >
                제출하기
            </button>

            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}

                studentInfo={targetStudent}
                onSave={async (data) => {
                    try {
                        // id가 있으면 기존 학생 수정(PUT), 없으면 새친구 추가(POST)
                        const isEdit = !!data.id;
                        const method = isEdit ? 'PUT' : 'POST';
                        const url = '/api/attendances/new-friend';
                        await fetch(url, {
                            method: method,
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(data),
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
        </div>
    );
};

export default NewFriend;