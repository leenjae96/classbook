import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from "../../hooks/api.ts";
import BackButton from "../../components/common/BackButton.tsx";
import { StudentInfoModal } from "../../components/attendance/StudentInfoModal.tsx";
import type { StudentInfo } from "../../constants/types.tsx";
import styles from './StudentDetailPage.module.css';

// ✨ 백엔드에서 받을 가벼운 요약용 데이터 타입
interface StudentSummary {
    id: number;
    name: string;
    grade: number;
    classNo: string;
    status: number;
}

const StudentDetailPage = () => {
    // 1. 상태 관리
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false); // 상세 정보 로딩 상태

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);

    // 2. 전체 학생 요약 데이터 불러오기 (가벼운 쿼리)
    const fetchAllStudentsSummary = async () => {
        setLoading(true);
        try {
            const data: StudentSummary[] = await apiFetch('/api/administrator/students');
            setStudents(data);
        } catch (error) {
            console.error("학생 목록을 불러오는데 실패했습니다.", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllStudentsSummary();
    }, []);

    // 3. 데이터를 '학년 반' 문자열을 Key로 하여 그룹핑 (화면 렌더링용)
    const groupedStudents = useMemo(() => {
        const groups: Record<string, StudentSummary[]> = {};

        students.forEach(student => {
            const gradeName = student.grade === 0 ? '1부' : `${student.grade}학년`;
            const className = student.grade === 0
                ? (student.classNo === '0' ? '여자반' : '남자반')
                : `${student.classNo}반`;

            const groupName = `${gradeName} ${className}`;

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(student);
        });

        return groups;
    }, [students]);

    // ✨ 4. 학생 버튼 클릭 시 상세 정보 단건 조회 후 모달 띄우기
    const handleStudentClick = async (studentSummary: StudentSummary) => {
        setIsDetailLoading(true);
        try {
            // 백엔드 단건 상세 조회 API 호출
            const detailData: StudentInfo = await apiFetch(`/api/administrator/students/${studentSummary.id}`);
            setSelectedStudent(detailData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("상세 정보를 불러오지 못했습니다.", error);
            alert("학생 상세 정보를 불러오는데 실패했습니다.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    // 5. 모달에서 '저장하기' 클릭 시 실행될 로직 (히스토리 포함)
    const handleSave = async (data: Partial<StudentInfo> & { editReason?: string }) => {
        try {
            // 인적사항 및 상태 변경 API 호출 (PUT)
            await apiFetch(`/api/administrator/students`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            alert('학생 정보가 성공적으로 수정되었습니다.');
            setIsModalOpen(false);
            fetchAllStudentsSummary(); // 저장 성공 시 목록 새로고침
        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다.");
        }
    };

    // 버튼에 상태별 클래스 부여 로직 (새친구, 별분반 구분용)
    const getButtonClass = (status: number) => {
        if (status === 0) return `${styles.studentBtn} ${styles.statusNew}`;
        if (status === 3) return `${styles.studentBtn} ${styles.statusSpecial}`;
        return styles.studentBtn;
    };

    return (
        <div className="content">
            <BackButton />
            <h4>인적사항 수정</h4>

            {/* 화면 덮는 로딩 바 (상세 정보 불러올 때 방어용) */}
            {isDetailLoading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <strong>상세 정보를 불러오는 중입니다...</strong>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>학생 데이터를 불러오는 중...</div>
            ) : (
                <div className={styles.container}>
                    {/* Object의 Key(그룹명)를 순회하며 렌더링 */}
                    {Object.entries(groupedStudents).map(([groupName, groupStudents]) => (
                        <div key={groupName} className={styles.classGroup}>
                            <h5 className={styles.classTitle}>{groupName}</h5>
                            <div className={styles.studentGrid}>
                                {groupStudents.map(student => (
                                    <button
                                        key={student.id}
                                        className={getButtonClass(student.status)}
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        {student.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 기존에 만든 모달 재사용 */}
            <StudentInfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                studentInfo={selectedStudent}
                onSave={handleSave}
            />
        </div>
    );
};

export default StudentDetailPage;