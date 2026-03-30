import {useState, useEffect} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';
import type {TeacherInfo} from "../../constants/types.tsx";
import {paths} from "../../constants/paths.tsx";
import {ErrorMessage} from "../../components/common/ErrorMessage.tsx";
import {apiFetch} from "../../hooks/api.ts";
import BackButton from "../../components/common/BackButton.tsx";

const AdministrativeSelect = () => {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadAdministrativeList = () => {
        apiFetch('/api/attendances/administrative')
            .then((data: TeacherInfo[]) => {
                setTeachers(data);
            })
            .catch(err => {
                console.error("서버 연결 실패/ ", err);
                setErrorMessage(err.message || "알 수 없는 오류가 발생했습니다.");
                setTeachers([]);
            });
    };
    useEffect(() => {
        loadAdministrativeList();
    }, []);

    return (
        <div className="content">
            <BackButton/>
            <h4>선생님 선택</h4>
            {errorMessage ? (
                <ErrorMessage
                    message={errorMessage}/>
            ) : teachers && teachers.length > 0 ? (
                <div
                    className="selection-grid"
                >
                    {teachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="selection-card"
                            onPointerUp={() => navigate(generatePath(paths.administrativeTeacherSheet.url, {teacherId: teacher.id.toString()}))}
                        >
                            <span>
                               {teacher.name} 쌤
                            </span>
                        </div>
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