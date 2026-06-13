import {useEffect, useState} from 'react';
import type {ClassroomSummary, Sheet, StudentAttendance} from '../../constants/types.tsx';
import {apiFetch} from '../../hooks/api.ts';
import {StudentAttendanceRow} from '../../components/attendance/StudentAttendanceRow.tsx';
import {DateSelector} from '../../components/common/DateSelector.tsx';
import {getMostRecentSunday, snapToSunday} from '../../util/dateUtils.tsx';
import BackButton from '../../components/common/BackButton.tsx';
import '../attendance/ClassroomSheet.css';

// 변경된 학생 + 사유 입력용
interface ChangedItem {
    id: number;
    name: string;
    status: boolean;
    comments: string;
    reason: string;
}

const grades: number[] = [1, 2, 3, 0];

const AdminAttendanceEdit = () => {
    const [grade, setGrade] = useState<number | undefined>(undefined);
    const [classNo, setClassNo] = useState<string | undefined>(undefined);
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(getMostRecentSunday());

    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [original, setOriginal] = useState<StudentAttendance[]>([]);
    const [loading, setLoading] = useState(false);

    // 사유 입력 모달 상태
    const [changedItems, setChangedItems] = useState<ChangedItem[] | null>(null);

    // 학년 변경 시 반 목록 로드
    useEffect(() => {
        if (grade === undefined) {
            setClassrooms([]);
            setClassNo(undefined);
            return;
        }
        apiFetch(`/api/attendances/classroom?grade=${grade}`)
            .then((data: ClassroomSummary[]) => setClassrooms(data))
            .catch(err => {
                alert(err.message || '반 목록을 불러오지 못했습니다.');
                setClassrooms([]);
            });
        setClassNo(undefined);
    }, [grade]);

    // 학년·반·날짜가 모두 정해지면 출석부 로드 (잠금 없음)
    useEffect(() => {
        if (grade === undefined || classNo === undefined) {
            setStudents([]);
            setOriginal([]);
            return;
        }
        setLoading(true);
        apiFetch(`/api/attendances/sheet?grade=${grade}&classNo=${classNo}&date=${selectedDate}`)
            .then((data: Sheet) => {
                const list = data.studentAttendances || [];
                setStudents(list);
                setOriginal(list.map(s => ({...s}))); // 스냅샷
            })
            .catch(err => {
                console.error(err);
                alert('출석부를 불러오지 못했습니다.');
            })
            .finally(() => setLoading(false));
    }, [grade, classNo, selectedDate]);

    const toggle = (id: number) =>
        setStudents(prev => prev.map(s => s.id === id ? {...s, status: !s.status} : s));

    const changeComment = (id: number, comments: string) =>
        setStudents(prev => prev.map(s => s.id === id ? {...s, comments} : s));

    // 수정하기 → 변경 학생 추출
    const handleEditClick = () => {
        const origMap = new Map(original.map(s => [s.id, s]));
        const changed: ChangedItem[] = students
            .filter(s => {
                const o = origMap.get(s.id);
                if (!o) return false;
                const statusChanged = s.status !== o.status;
                const commentChanged = (s.comments || '') !== (o.comments || '');
                return statusChanged || commentChanged;
            })
            .map(s => ({id: s.id, name: s.studentName, status: s.status, comments: s.comments || '', reason: ''}));

        if (changed.length === 0) {
            alert('수정된 데이터가 없습니다.');
            return;
        }
        setChangedItems(changed);
    };

    const setReason = (id: number, reason: string) =>
        setChangedItems(prev => prev ? prev.map(c => c.id === id ? {...c, reason} : c) : prev);

    const submitEdit = async () => {
        if (!changedItems) return;
        if (changedItems.some(c => !c.reason.trim())) {
            alert('변경된 모든 학생의 수정 사유를 입력해주세요.');
            return;
        }
        try {
            await apiFetch('/api/administrator/attendances', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    date: selectedDate,
                    items: changedItems.map(c => ({
                        studentId: c.id,
                        status: c.status,
                        comments: c.comments,
                        reason: c.reason.trim(),
                    })),
                }),
            });
            alert('수정되었습니다.');
            setChangedItems(null);
            // 스냅샷 갱신 (현재 상태를 원본으로)
            setOriginal(students.map(s => ({...s})));
        } catch (e) {
            console.error(e);
            alert('수정에 실패했습니다.');
        }
    };

    const normalStudents = students.filter(s => s.studentStatus !== 0);
    const newStudents = students.filter(s => s.studentStatus === 0);

    return (
        <div className="content" style={{position: 'relative'}}>
            <BackButton/>
            <h4>출석 수정</h4>

            {/* 학년 / 반 선택 */}
            <div style={{display: 'flex', gap: '10px', marginBottom: '12px'}}>
                <select
                    value={grade ?? ''}
                    onChange={(e) => setGrade(e.target.value === '' ? undefined : Number(e.target.value))}
                    style={{flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                >
                    <option value="">학년 선택</option>
                    {grades.map(g => (
                        <option key={g} value={g}>{g === 0 ? '1부' : `${g}학년`}</option>
                    ))}
                </select>
                <select
                    value={classNo ?? ''}
                    onChange={(e) => setClassNo(e.target.value === '' ? undefined : e.target.value)}
                    disabled={grade === undefined}
                    style={{flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                >
                    <option value="">{grade === undefined ? '학년을 먼저 선택' : '반 선택'}</option>
                    {classrooms.map(c => (
                        <option key={c.id} value={c.classNo}>
                            {c.grade === 0 ? (c.classNo === '1' ? '남자반' : '여자반') : `${c.classNo}반`}
                        </option>
                    ))}
                </select>
            </div>

            <DateSelector selectedDate={selectedDate} onChange={(d) => {
                if (new Date(d + 'T12:00:00').getDay() !== 0) {
                    alert('일요일만 선택이 가능합니다.');
                    setSelectedDate(snapToSunday(d));
                } else {
                    setSelectedDate(d);
                }
            }}/>

            {grade === undefined || classNo === undefined ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#adb5bd'}}>
                    학년과 반을 선택하세요.
                </div>
            ) : loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#adb5bd'}}>불러오는 중...</div>
            ) : (
                <>
                    <div className="student-list">
                        {normalStudents.map(s => (
                            <StudentAttendanceRow
                                key={s.id}
                                studentCheck={s}
                                onToggle={toggle}
                                onCommentChange={changeComment}
                            />
                        ))}
                    </div>

                    {newStudents.length > 0 && (
                        <>
                            <hr className="section-divider"/>
                            <div className="summary-box new-friend">
                                <div className="summary-left" style={{color: '#f57c00'}}>🌱 새친구</div>
                            </div>
                            <div className="student-list">
                                {newStudents.map(s => (
                                    <StudentAttendanceRow
                                        key={s.id}
                                        studentCheck={s}
                                        onToggle={toggle}
                                        onCommentChange={changeComment}
                                        sheetDate={selectedDate}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <hr style={{margin: '20px 0'}}/>
                    <button className="submit-btn" onClick={handleEditClick}>
                        수정하기
                    </button>
                </>
            )}

            {/* 변경 학생 사유 입력 모달 */}
            {changedItems && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: 'var(--card-bg, #fff)', color: 'var(--text-color, #000)',
                        borderRadius: '10px', padding: '20px', width: '100%', maxWidth: '480px',
                        maxHeight: '80vh', overflowY: 'auto'
                    }}>
                        <h4 style={{marginTop: 0}}>수정 사유 입력</h4>
                        <p style={{fontSize: '13px', color: '#868e96', marginTop: '-6px'}}>
                            변경된 학생별로 사유를 입력해주세요. (히스토리에 기록됩니다)
                        </p>
                        {changedItems.map(c => (
                            <div key={c.id} style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                                <span style={{flexBasis: '90px', flexShrink: 0, fontWeight: 600}}>{c.name}</span>
                                <input
                                    type="text"
                                    value={c.reason}
                                    onChange={(e) => setReason(c.id, e.target.value)}
                                    placeholder="수정 사유"
                                    style={{flexGrow: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
                                />
                            </div>
                        ))}
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px'}}>
                            <button onClick={() => setChangedItems(null)}
                                    style={{padding: '8px 16px', borderRadius: '5px', border: '1px solid #ccc', background: 'transparent'}}>
                                취소
                            </button>
                            <button onClick={submitEdit}
                                    style={{padding: '8px 16px', borderRadius: '5px', border: 'none', background: '#007bff', color: '#fff'}}>
                                확정
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendanceEdit;
