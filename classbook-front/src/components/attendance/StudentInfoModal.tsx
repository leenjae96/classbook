import {useState, useEffect} from 'react';
import type {StudentInfo, ClassroomSummary} from '../../constants/types.tsx';
import {apiFetch} from "../../hooks/api.ts";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    studentInfo: StudentInfo | null;
    onSave: (data: Partial<StudentInfo>) => void;
}

export const StudentInfoModal = ({isOpen, onClose, studentInfo, onSave}: Props) => {
    const grades: number[] = [1, 2, 3, 0];
    const [grade, setGrade] = useState<number | undefined>(undefined);
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);

    // 폼 초기값 세팅 (모든 필드 포함)
    const [formData, setFormData] = useState<Partial<StudentInfo>>({
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
        promotedAt: undefined
    });
    // 모달 열릴 때 기존 데이터 세팅
    useEffect(() => {
        if (studentInfo) {
            setFormData({...studentInfo});
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
                promotedAt: undefined
            });
            setGrade(undefined);
            setClassrooms([])
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

    // 공통 입력 핸들러 (타입별로 자동 변환)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        setFormData(prev => {
            let parsedValue: any = value;

            // 숫자형 데이터 처리
            if (name === 'status' || name === 'classroomId') {
                parsedValue = Number(value);
            }
            // 불리언형 데이터 (성별) 처리
            else if (name === 'gender') {
                parsedValue = value === 'true';
            }
            return {...prev, [name]: parsedValue};
        });
    };

    // 저장 버튼 클릭 시 필수값 검증
    const handleSubmit = () => {
        if (!formData.name?.trim()) return alert('이름을 입력해주세요.');
        if (formData.gender === undefined) return alert('성별을 선택해주세요.');
        if (formData.status === undefined) return alert('학적 상태를 선택해주세요.');
        // if (!formData.classroomId) return alert('소속 반을 선택해주세요.'); // 반이 필수라면 주석 해제
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '12px',
                width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                    {studentInfo ? '학생 정보 수정' : '새친구 추가'}
                </h3>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                    {/* 이름 (필수) */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>이름 <span style={{color: 'red'}}>*</span></label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
                               style={{
                                   width: '100%',
                                   padding: '8px',
                                   borderRadius: '5px',
                                   border: '1px solid #ccc',
                                   boxSizing: 'border-box'
                               }}/>
                    </div>

                    {/* 성별 (필수) */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>성별 <span style={{color: 'red'}}>*</span></label>
                        <select name="gender" value={String(formData.gender)} onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}>
                            <option value="true">남자</option>
                            <option value="false">여자</option>
                        </select>
                    </div>

                    {/* 학년 선택 */}
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>학년
                            (선택)</label>
                        <select
                            value={grade ?? ''}
                            onChange={(e) => {
                                const gradeVal = e.target.value === '' ? undefined : Number(e.target.value);
                                setGrade(gradeVal);
                                // 학년이 바뀌면 반(classroomId)은 초기화
                                setFormData(prev => ({...prev, grade: gradeVal, classroomId: undefined}));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box'
                            }}>
                            <option value="">미지정</option>
                            {grades.map(g => (
                                <option key={g} value={g}>{g === 0 ? '1부' : `${g}학년`}</option>
                            ))}
                        </select>
                    </div>

                    {/* 반 선택 (학년 선택 전에는 비활성화) */}
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>반
                            (선택)</label>
                        <select
                            name="classroomId"
                            value={formData.classroomId || ''}
                            onChange={(e) => {
                                setFormData(prev => ({...prev, classroomId: Number(e.target.value)}));
                            }}
                            disabled={grade === undefined} // 학년 미선택 시 비활성화
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                boxSizing: 'border-box',
                                backgroundColor: grade === undefined ? '#f0f0f0' : 'white'
                            }}>
                            <option value="">{grade === undefined ? '학년을 먼저 선택하세요' : '미지정'}</option>
                            {classrooms.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.grade === 0 ? (c.classNo === '1' ? '남자' : '여자') : `${c.classNo}반`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 학적 상태 (필수) */}
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>학적
                            상태 <span style={{color: 'red'}}>*</span></label>
                        <select name="status" value={formData.status ?? 0} onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box'
                                }}>
                            <option value={0}>새친구 (진행중)</option>
                            <option value={1}>등반 완료</option>
                            <option value={2}>장기 결석</option>
                        </select>
                    </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                    {/* 연락처 */}
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>본인
                            연락처</label>
                        <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange}
                               placeholder="010-0000-0000"
                               style={{
                                   width: '100%',
                                   padding: '8px',
                                   borderRadius: '5px',
                                   border: '1px solid #ccc',
                                   boxSizing: 'border-box'
                               }}/>
                    </div>

                    {/* 부모님 연락처 */}
                    <div>
                        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>부모님
                            연락처</label>
                        <input type="text" name="parentPhone" value={formData.parentPhone || ''} onChange={handleChange}
                               placeholder="010-0000-0000"
                               style={{
                                   width: '100%',
                                   padding: '8px',
                                   borderRadius: '5px',
                                   border: '1px solid #ccc',
                                   boxSizing: 'border-box'
                               }}/>
                    </div>
                </div>

                {/* 생년월일 & 등록일 (LocalDate 처리용 input type="date") */}
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>생년월일</label>
                        <input type="date" name="birthday" value={formData.birthday ? String(formData.birthday) : ''}
                               onChange={handleChange}
                               style={{
                                   width: '100%',
                                   padding: '8px',
                                   borderRadius: '5px',
                                   border: '1px solid #ccc',
                                   boxSizing: 'border-box'
                               }}/>
                    </div>
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}>등록일</label>
                        <input type="date" name="registeredAt"
                               value={formData.registeredAt ? String(formData.registeredAt) : ''}
                               onChange={handleChange}
                               style={{
                                   width: '100%',
                                   padding: '8px',
                                   borderRadius: '5px',
                                   border: '1px solid #ccc',
                                   boxSizing: 'border-box'
                               }}/>
                    </div>
                </div>

                {/* 학교 & 주소 */}
                <div style={{marginBottom: '15px'}}>
                    <label
                        style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>학교</label>
                    <input type="text" name="school" value={formData.school || ''} onChange={handleChange}
                           style={{
                               width: '100%',
                               padding: '8px',
                               borderRadius: '5px',
                               border: '1px solid #ccc',
                               boxSizing: 'border-box'
                           }}/>
                </div>
                <div style={{marginBottom: '15px'}}>
                    <label
                        style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>주소</label>
                    <input type="text" name="address" value={formData.address || ''} onChange={handleChange}
                           style={{
                               width: '100%',
                               padding: '8px',
                               borderRadius: '5px',
                               border: '1px solid #ccc',
                               boxSizing: 'border-box'
                           }}/>
                </div>

                {/* 특이사항 */}
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px'}}>특이사항
                        (비고)</label>
                    <textarea name="remark" value={formData.remark || ''} onChange={handleChange}
                              style={{
                                  width: '100%',
                                  padding: '8px',
                                  borderRadius: '5px',
                                  border: '1px solid #ccc',
                                  boxSizing: 'border-box',
                                  height: '60px'
                              }}/>
                </div>

                {/* 버튼 */}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                    <button onClick={onClose} style={{
                        padding: '10px 15px',
                        background: '#f8f9fa',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>취소
                    </button>
                    <button onClick={handleSubmit} style={{
                        padding: '10px 15px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}>저장하기
                    </button>
                </div>
            </div>
        </div>
    );
};