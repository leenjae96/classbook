import {useState, useEffect} from 'react';
import type {StudentInfo, ClassroomSummary} from '../../constants/types.tsx';
import {apiFetch} from "../../hooks/api.ts";
import styles from './StudentInfoModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    studentInfo: StudentInfo | null;
    onSave: (data: Partial<StudentInfo> & { editReason?: string }) => void;
}

export const StudentInfoModal = ({isOpen, onClose, studentInfo, onSave}: Props) => {
    const grades: number[] = [1, 2, 3, 0];
    const [grade, setGrade] = useState<number | undefined>(undefined);
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);

    const [formData, setFormData] = useState<Partial<StudentInfo> & { editReason?: string }>({
        classroomId: undefined,
        name: '',
        gender: true,
        phone: '',
        parentPhone: '',
        address: '',
        school: '',
        status: 0,
        remark: '',
        birthday: undefined,
        registeredAt: undefined,
        promotedAt: undefined,
        editReason: ''
    });

    useEffect(() => {
        if (studentInfo) {
            setFormData({...studentInfo, editReason: ''});
            setGrade(studentInfo.grade === null ? undefined : studentInfo.grade);
        } else {
            setFormData({
                name: '',
                grade: undefined,
                classNo: undefined,
                classroomId: undefined,
                gender: true,
                phone: '',
                parentPhone: '',
                address: '',
                school: '',
                status: 0,
                remark: '',
                birthday: undefined,
                registeredAt: new Date(),
                promotedAt: undefined,
                editReason: ''
            });
            setGrade(undefined);
            setClassrooms([]);
        }
    }, [studentInfo, isOpen]);

    useEffect(() => {
        if (grade === undefined) {
            setClassrooms([]);
            return;
        }
        apiFetch(`/api/attendances/classroom?grade=${grade}`)
            .then((data: ClassroomSummary[]) => {
                setClassrooms(data);
            })
            .catch(err => {
                alert(err.message || "알 수 없는 오류가 발생했습니다.");
                setClassrooms([]);
            });
    }, [grade]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        setFormData(prev => {
            let parsedValue: any = value;

            if (name === 'phone' || name === 'parentPhone') {
                const onlyNums = value.replace(/[^0-9]/g, '');
                if (onlyNums.length <= 3) {
                    parsedValue = onlyNums;
                } else if (onlyNums.length <= 7) {
                    parsedValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
                } else {
                    parsedValue = `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;
                }
            } else if (name === 'status' || name === 'classroomId') {
                parsedValue = Number(value);
            } else if (name === 'gender') {
                parsedValue = value === 'true';
            }

            const updatedData = {...prev, [name]: parsedValue};

            if (name === 'status' && parsedValue !== 1) {
                updatedData.promotedAt = undefined;
            }

            return updatedData;
        });
    };

    const handleSubmit = () => {
        if (!formData.name?.trim()) return alert('이름을 입력해주세요.');
        if (formData.gender === undefined) return alert('성별을 선택해주세요.');
        if (formData.status === undefined) return alert('학적 상태를 선택해주세요.');
        if (studentInfo && !formData.editReason?.trim()) return alert('수정 사유를 입력해주세요.');

        onSave(formData);
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalContent}>
                <h3 className={styles.header}>
                    {studentInfo ? '학생 정보 수정' : '새친구 추가'}
                </h3>

                {/* 1열: 이름, 성별 등 */}
                <div className={styles.formGrid}>
                    <div>
                        <label className={styles.label}>이름 <span className={styles.required}>*</span></label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={styles.inputField} />
                    </div>
                    <div>
                        <label className={styles.label}>성별 <span className={styles.required}>*</span></label>
                        <select name="gender" value={String(formData.gender)} onChange={handleChange} className={styles.inputField}>
                            <option value="true">남자</option>
                            <option value="false">여자</option>
                        </select>
                    </div>
                    <div>
                        <label className={styles.label}>학년 (선택)</label>
                        <select value={grade ?? ''} onChange={(e) => {
                            const gradeVal = e.target.value === '' ? undefined : Number(e.target.value);
                            setGrade(gradeVal);
                            setFormData(prev => ({...prev, grade: gradeVal, classroomId: undefined}));
                        }} className={styles.inputField}>
                            <option value="">미지정</option>
                            {grades.map(g => (
                                <option key={g} value={g}>{g === 0 ? '1부' : `${g}학년`}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={styles.label}>반 (선택)</label>
                        <select name="classroomId" value={formData.classroomId || ''} onChange={(e) => {
                            setFormData(prev => ({...prev, classroomId: Number(e.target.value)}));
                        }} disabled={grade === undefined} className={styles.inputField}>
                            <option value="">{grade === undefined ? '학년을 먼저 선택하세요' : '미지정'}</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.grade === 0 ? (c.classNo === '1' ? '남자' : '여자') : `${c.classNo}반`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={styles.label}>학적 상태 <span className={styles.required}>*</span></label>
                        <select name="status" value={formData.status ?? 0} onChange={handleChange} className={styles.inputField}>
                            <option value={0}>새친구(출석중)</option>
                            <option value={1}>등반</option>
                        </select>
                    </div>

                    {formData.status === 1 && (
                        <div>
                            <label className={styles.label}>등반일</label>
                            <input type="date" name="promotedAt" value={formData.promotedAt ? String(formData.promotedAt) : ''} onChange={handleChange} className={styles.inputField} />
                        </div>
                    )}
                </div>

                {/* 2열: 연락처 */}
                <div className={styles.formGrid}>
                    <div>
                        <label className={styles.label}>본인 연락처</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="010-0000-0000" className={styles.inputField} />
                    </div>
                    <div>
                        <label className={styles.label}>부모님 연락처</label>
                        <input type="text" name="parentPhone" value={formData.parentPhone || ''} onChange={handleChange} placeholder="010-0000-0000" className={styles.inputField} />
                    </div>
                </div>

                {/* 3열: 날짜 */}
                <div className={styles.formGrid}>
                    <div>
                        <label className={styles.label}>생년월일</label>
                        <input type="date" name="birthday" value={formData.birthday ? String(formData.birthday) : ''} onChange={handleChange} className={styles.inputField} />
                    </div>
                    <div>
                        <label className={styles.label}>첫 출석일</label>
                        <input type="date" name="registeredAt" value={formData.registeredAt ? String(formData.registeredAt) : ''} onChange={handleChange} className={styles.inputField} />
                    </div>
                </div>

                {/* 단일 열 입력 항목들 */}
                <div className={styles.formGroup}>
                    <label className={styles.label}>학교</label>
                    <div className={styles.schoolInputContainer}>
                        <input type="text" name="school" value={formData.school || ''} onChange={handleChange} placeholder="예: 하남" className={styles.schoolInput} />
                        <span className={styles.schoolSuffix}>중학교</span>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>주소</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={styles.inputField} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>특이사항 (비고)</label>
                    <textarea name="remark" value={formData.remark || ''} onChange={handleChange} className={styles.textareaField} />
                </div>

                {/* 수정 사유 (히스토리) */}
                {studentInfo && (
                    <div className={styles.historySection}>
                        <label className={styles.historyLabel}>
                            수정 사유 <span className={styles.required}>*</span> <span className={styles.historySubText}>(히스토리 기록용)</span>
                        </label>
                        <input type="text" name="editReason" value={formData.editReason || ''} onChange={handleChange} placeholder="예: 연락처 변경, 등반 처리 등" className={styles.inputField} />
                    </div>
                )}

                <div className={styles.buttonContainer}>
                    <button onClick={onClose} className={styles.btnCancel}>취소</button>
                    <button onClick={handleSubmit} className={styles.btnSave}>저장하기</button>
                </div>
            </div>
        </div>
    );
};