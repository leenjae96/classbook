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

type View = 'active' | 'deleted';

const StudentDetailPage = () => {
    // 1. 상태 관리
    const [students, setStudents] = useState<StudentSummary[]>([]);
    const [deletedStudents, setDeletedStudents] = useState<StudentSummary[]>([]);
    const [view, setView] = useState<View>('active'); // 재적 / 삭제 탭
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

    // 삭제(status=5) 학생 목록
    const fetchDeletedStudents = async () => {
        setLoading(true);
        try {
            const data: StudentSummary[] = await apiFetch('/api/administrator/students/deleted');
            setDeletedStudents(data);
        } catch (error) {
            console.error("삭제된 학생 목록을 불러오는데 실패했습니다.", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (view === 'active') fetchAllStudentsSummary();
        else fetchDeletedStudents();
    }, [view]);

    // 3. 데이터를 '학년 반' 문자열을 Key로 하여 그룹핑 (화면 렌더링용)
    const groupedStudents = useMemo(() => {
        const groups: Record<string, StudentSummary[]> = {};
        const removed: StudentSummary[] = []; // 별분(status=3) → 별도 그룹

        students.forEach(student => {
            if (student.status === 3) {
                removed.push(student);
                return;
            }

            // 학년/반 정보가 없는 학생은 '미지정' 그룹으로
            const groupName = (student.grade === null || student.grade === undefined)
                ? '미지정'
                : (() => {
                    const gradeName = student.grade === 0 ? '1부' : `${student.grade}학년`;
                    const className = student.grade === 0
                        ? (student.classNo === '0' ? '여자반' : '남자반')
                        : (student.classNo ? `${student.classNo}반` : '반 미지정');
                    return `${gradeName} ${className}`;
                })();

            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(student);
        });

        // 별분반은 항상 맨 아래에 묶어서 표시
        if (removed.length > 0) {
            groups['별분반'] = removed;
        }

        return groups;
    }, [students]);

    // 현재 탭에 따라 렌더링할 그룹 목록 (재적: 학년/반 그룹, 삭제: 단일 그룹)
    const displayEntries: [string, StudentSummary[]][] = view === 'active'
        ? Object.entries(groupedStudents)
        : (deletedStudents.length > 0 ? [[`삭제됨 (${deletedStudents.length}명)`, deletedStudents]] : []);

    // ✨ 4. 학생 버튼 클릭 시 상세 정보 단건 조회 후 모달 띄우기
    const handleStudentClick = async (studentSummary: StudentSummary) => {
        setIsDetailLoading(true);
        try {
            // 백엔드 단건 상세 조회 API 호출
            const detailData: StudentInfo = await apiFetch(`/api/attendances/student?id=${studentSummary.id}`);
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
            // 백엔드(EditStudentInfo)는 수정 사유를 comments 로 받음 → editReason 매핑
            const { editReason, ...rest } = data;
            const payload = { ...rest, comments: editReason };

            // 인적사항 및 상태 변경 API 호출 (PUT)
            await apiFetch(`/api/administrator/students`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            alert('학생 정보가 성공적으로 수정되었습니다.');
            setIsModalOpen(false);
            // 현재 탭 새로고침 (삭제/복원 시 해당 탭에서 즉시 반영)
            if (view === 'active') fetchAllStudentsSummary();
            else fetchDeletedStudents();
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

            {/* 재적 / 삭제 탭 토글 (출석 누적 통계 시트 선택 버튼과 동일 크기) */}
            <div style={{display: 'flex', gap: '4px', marginBottom: '14px'}}>
                {([['active', '재적 학생'], ['deleted', '삭제된 학생']] as const).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setView(key)}
                        style={{
                            padding: '6px 16px', borderRadius: '5px', fontSize: '13px', fontWeight: 500,
                            border: view === key ? '1px solid #4361ee' : '1px solid #dee2e6',
                            background: view === key ? '#4361ee' : '#f8f9fa',
                            color: view === key ? '#fff' : '#495057',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

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
            ) : displayEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: '#adb5bd' }}>
                    {view === 'deleted' ? '삭제된 학생이 없습니다.' : '학생이 없습니다.'}
                </div>
            ) : (
                <div className={styles.container}>
                    {view === 'deleted' && (
                        <p style={{ fontSize: '13px', color: '#868e96', marginTop: 0 }}>
                            학생을 눌러 학적 상태를 바꾸면 복원됩니다. (예: '삭제됨' → '일반')
                        </p>
                    )}
                    {/* Object의 Key(그룹명)를 순회하며 렌더링 */}
                    {displayEntries.map(([groupName, groupStudents]) => (
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
                mode="admin"
                studentInfo={selectedStudent}
                onSave={handleSave}
            />
        </div>
    );
};

export default StudentDetailPage;