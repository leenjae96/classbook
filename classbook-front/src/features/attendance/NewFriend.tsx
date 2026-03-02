import { useNavigate } from "react-router-dom";
import { useAttendance } from "../../hooks/useAttendance.ts"; // Hook 사용
import { StudentAttendanceRow } from "../../components/attendance/StudentAttendanceRow.tsx"; // Component 사용
import { useState } from "react";
import type {StudentAttendance, StudentInfo} from "../../constants/types.tsx";
import {StudentInfoModal} from "../../components/attendance/StudentInfoModal.tsx";
import {apiFetch} from "../../hooks/api.ts";

const NewFriend = () => {
    const navigate = useNavigate();

    const {
        selectedDate,
        setSelectedDate,
        studentAttendances,
        toggleStudentAttendance,
        updateStudentAttendanceComment,
        submitAttendance
    } = useAttendance({
        apiEndpoint: '/api/attendances/new-friend/sheet' ,
        initialDate: new Date().toLocaleDateString('en-CA')
    });

    // 모달 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetStudent, setTargetStudent] = useState<StudentInfo | null>(null); // 수정할 학생 객체

    const handleEditClick = async (student: StudentAttendance) => {
        try {
            // 1. 서버에 해당 학생(id)의 전체 인적사항(StudentInfo)을 요청합니다.
            const studentDetail = await apiFetch(`/api/attendances/student?id=${student.id}`);
            // 2. 받아온 전체 데이터를 targetStudent에 넣습니다.
            setTargetStudent(studentDetail);
            // 3. 데이터가 성공적으로 준비되었으니 모달을 엽니다.
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
            <button className="go-back-btn" onClick={() => navigate(-1)}>← 뒤로가기</button>

            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>새친구 관리</h3>
                <button
                    onClick={handleAddClick}
                    style={{ padding: '5px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
                >
                    + 추가
                </button>
            </div>

            {/* 날짜 선택기 */}
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>날짜:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>
            <>개발중인 페이지입니다.</>

            {/* 학생 리스트 (StudentAttendanceRow 재사용) */}
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

            <hr style={{ margin: '20px 0' }} />

            <button className="menu-btn" onClick={submitAttendance} style={{ backgroundColor: '#28a745' }}>
                출석 제출하기
            </button>

            {/* 모달 (다음 단계에서 구현) */}
            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={targetStudent}
                onSave={async (data) => {
                    try {
                        // id가 있으면 기존 학생 수정(PUT), 없으면 새친구 추가(POST)
                        const isEdit = !!data.id;
                        const method = isEdit ? 'PUT' : 'POST';
                        // 백엔드 API 설계에 따라 경로는 맞춰주세요.
                        const url = isEdit ? `/api/attendances/student/${data.id}` : '/api/attendances/student';

                        await apiFetch(url, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data),
                        });
                        alert(isEdit ? '정보가 수정되었습니다.' : '새친구가 등록되었습니다.');
                        setIsModalOpen(false);
                        // 저장 후 목록을 갱신하기 위해 페이지 새로고침 (또는 fetch 함수 재호출)
                        window.location.reload();
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