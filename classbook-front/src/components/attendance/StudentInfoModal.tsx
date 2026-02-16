import { useState, useEffect } from 'react';
import type {StudentInfo} from '../../constants/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // 기존 데이터 (null이면 '추가' 모드, 있으면 '수정' 모드)
    student: StudentInfo | null;
    // 저장 시 Partial(일부 데이터만 있는 상태)로 부모에게 넘겨줌
    onSave: (data: Partial<StudentInfo>) => void;
}

export const StudentInfoModal = ({ isOpen, onClose, student, onSave }: Props) => {
    const [formData, setFormData] = useState<Partial<StudentInfo>>({
        name: '',
        phone: '',
        school: '',
        status: 0,
        remark: ''
    });

    // 2. 모달이 열리거나 student가 바뀔 때 폼 데이터 채우기
    useEffect(() => {
        if (student) {
            // 수정 모드: 전달받은 학생 데이터로 채움
            setFormData({
                id: student.id,
                name: student.name || '',
                phone: student.phone || '',
                school: student.school || '',
                status: student.status ?? 0,
                remark: student.remark || ''
            });
        } else {
            // 추가 모드: 빈 폼으로 초기화
            setFormData({
                name: '', phone: '', school: '', status: 0, remark: ''
            });
        }
    }, [student, isOpen]);

    if (!isOpen) return null; // 안 열렸으면 렌더링 X

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'status' ? Number(value) : value
        }));
    };

    const handleSubmit = () => {
        if (!formData.name?.trim()) {
            alert('이름을 입력해주세요.');
            return;
        }
        onSave(formData); // 부모 컴포넌트로 데이터 전송
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white', padding: '20px', borderRadius: '12px',
                width: '90%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {student ? '학생 정보 수정' : '새친구 추가'}
                </h3>

                {/* 이름 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>이름 <span style={{color: 'red'}}>*</span></label>
                    <input type="text" name="name" value={formData.name || ''} onChange={handleChange}
                           style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                {/* 연락처 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>연락처</label>
                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange}
                           style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                {/* 학교 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>학교</label>
                    <input type="text" name="school" value={formData.school || ''} onChange={handleChange}
                           style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    />
                </div>

                {/* 상태(Status) */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>학적 상태</label>
                    <select name="status" value={formData.status ?? 0} onChange={handleChange}
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                    >
                        <option value={0}>새친구 (진행중)</option>
                        <option value={1}>등반 완료</option>
                        <option value={2}>장기 결석</option>
                    </select>
                </div>

                {/* 특이사항 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>특이사항 (기도제목 등)</label>
                    <textarea name="remark" value={formData.remark || ''} onChange={handleChange}
                              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', height: '80px' }}
                    />
                </div>

                {/* 버튼 */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} style={{ padding: '10px 15px', background: '#f8f9fa', border: '1px solid #ccc', borderRadius: '5px' }}>취소</button>
                    <button onClick={handleSubmit} style={{ padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>저장하기</button>
                </div>
            </div>
        </div>
    );
};