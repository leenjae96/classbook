import {useState, useEffect} from 'react';
import {generatePath, useNavigate} from 'react-router-dom';
import type {TeacherInfo} from "../constants/types.tsx";
import {paths} from "../constants/paths.tsx";

const AdministrativeSelect = () => {
    const [teachers, setTeachers] = useState<TeacherInfo[]>();
    const navigate = useNavigate();

    useEffect(() => {
        // --- 가상의 서버 통신 로직 ---
        fetch('/api/attendances/administrative')
            .then(res => res.json()) // 서버가 준 JSON을 해석
            .then(data => {
                // 성공하면 서버 데이터를 넣음

                console.log("서버에서 온 데이터:", data);
                setTeachers(data);
            })
            .catch(err => {
                // ★ 아직 서버가 없으니 에러가 나겠죠?
                // 테스트를 위해 여기서 임시 데이터를 넣어줍니다.
                console.log("서버 연결 실패 : " + err);
                setTeachers([]); // 그 외
            });
    }, []);

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>선생님 선택</h3>
            <div className="half-btn-group">
                {teachers?.map((teacher) => (
                    <button key={teacher.id} className="menu-btn"
                            onPointerUp={() => navigate(generatePath(paths.administrativeTeacherSheet.url, {teacherId: teacher.id.toString()}))}>
                        {teacher.name} 쌤
                    </button>
                ))}
            </div>
        </div>
    );
}

export default AdministrativeSelect;