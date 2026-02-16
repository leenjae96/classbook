import type {TeacherCheck} from '../../constants/types';

interface Props {
    teacher: TeacherCheck;
    onWorshipChange: (worship: number) => void;
    onOtnChange: (otn: number) => void;
    onDawnPrayChange: (dawnPray: number) => void;
    onCommentsChange: (comment: string) => void;
}

export const TeacherRow = ({teacher, onWorshipChange, onOtnChange, onDawnPrayChange, onCommentsChange}: Props) => {
    return (
        <div className="content" style={{position: 'relative'}}>
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>주일 예배 참석 <span
                    style={{color: 'red'}}>*</span></label>
                <select
                    value={teacher.worship ?? -1}
                    onChange={(e) => onWorshipChange(Number(e.target.value))}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                    }}
                >
                    <option value={-1} disabled hidden>선택하세요</option>
                    <option value={1}>1부</option>
                    <option value={2}>2부</option>
                    <option value={3}>3부</option>
                    <option value={4}>4부</option>
                    <option value={5}>5부</option>
                    <option value={6}>6부</option>
                    <option value={0}>안 드림</option>
                </select>
            </div>

            {/* 2. OTN */}
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>OTN 참석</label>
                <select
                    value={teacher?.otn ? 1 : 0}
                    onChange={(e) => onOtnChange(Number(e.target.value))}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                >
                    <option value={1}>참석</option>
                    <option value={0}>불참</option>
                </select>
            </div>

            {/* 3. 새벽기도 */}
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>새벽기도 참석</label>
                <select
                    value={teacher?.dawnPray ?? -1}
                    onChange={(e) => onDawnPrayChange(Number(e.target.value))}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '5px',
                        border: '1px solid #ccc'
                    }}
                >
                    <option value={0}>0 회</option>
                    <option value={1}>1 회</option>
                    <option value={2}>2 회</option>
                    <option value={3}>3 회</option>
                    <option value={4}>4 회</option>
                    <option value={5}>5 회</option>
                </select>
            </div>

            {/* 건의사항 */}
            <textarea
                placeholder="선생님 심방, 기도제목을 적어주세요."
                style={{width: '95%', height: '80px', marginBottom: '10px', padding: '10px', borderRadius: '5px'}}
                onChange={(e) => onCommentsChange(e.target.value)}
            />
        </div>
    )
}