import {useState, useEffect} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';
import type {TeacherInfo} from "../../constants/types.tsx";
import {paths} from "../../constants/paths.tsx";
import {ErrorMessage} from "../../components/common/ErrorMessage.tsx";
import {apiFetch} from "../../hooks/api.ts";

const AdministrativeSelect = () => {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadAdministrativeList = () => {
        apiFetch('/api/attendances/administrative')
            .then(res => res.json())
            .then((data: TeacherInfo[]) => {
                setTeachers(data);
            })
            .catch(err => {
                console.error("서버 연결 실패:", err);
                setErrorMessage(err.message || "알 수 없는 오류가 발생했습니다.");
                setTeachers([]);
            });
    };
    useEffect(() => {
        loadAdministrativeList();
    }, []);

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>선생님 선택</h3>
            {errorMessage ? (
                <ErrorMessage
                    message={errorMessage}/>
            ) : teachers && teachers.length > 0 ? (
                <div className="half-btn-group">
                    {teachers.map((teacher) => (
                        <button key={teacher.id} className="menu-btn"
                                onPointerUp={() => navigate(generatePath(paths.administrativeTeacherSheet.url, {teacherId: teacher.id.toString()}))}>
                            {teacher.name} 쌤
                        </button>
                    ))}
                </div>
            ) : (
                <div style={{textAlign: 'center', marginTop: '30px', color: '#666'}}>
                    <p>선택할 수 있는 선생님 목록이 없습니다.</p>
                </div>
            )}
        </div>
    );
}

export default AdministrativeSelect;