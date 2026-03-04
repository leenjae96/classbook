import type {TeacherAttendance} from "../../constants/types.tsx";

interface Props {
    teacherAttendance: TeacherAttendance;
    onToggle: (id: number) => void;
    onCommentChange: (id: number, comment: string) => void;
}

export const TeacherAttendanceRow= ({teacherAttendance, onToggle, onCommentChange}: Props) => {
    const handlePointerUp = () => {
            onToggle(teacherAttendance.id);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
            {/* 학생 버튼 */}
            <button
                onPointerUp={handlePointerUp}
                style={{
                    flex: 1,
                    padding: '15px',
                    fontSize: '13px',
                    backgroundColor: teacherAttendance.status ? '#4caf50' : '#e0e0e0',
                    color: teacherAttendance.status ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '5px',
                    marginRight: '10px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation',
                    transition: 'background-color 0.3s',
                    minWidth: '90px'
                }}
            >
                {teacherAttendance.teacherName}
            </button>

            {/* 코멘츠 입력 */}
            <input
                type="text"
                placeholder="결석 사유 및 심방 내용"
                value={teacherAttendance.comments || ''}
                onChange={(e) => onCommentChange(teacherAttendance.id, e.target.value)}
                style={{ width: '50%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginRight: '5px' }}
            />

        </div>
    );
}