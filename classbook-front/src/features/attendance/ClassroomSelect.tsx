import {generatePath, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {ClassroomSummary} from "../../constants/types.tsx";
import {paths} from "../../constants/paths.tsx";
import {apiFetch} from "../../hooks/api.ts";
import {ErrorMessage} from "../../components/common/ErrorMessage.tsx";

const ClassroomSelect = () => {
    const navigate = useNavigate();

    const {grade} = useParams<{ grade: string }>();
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadClassroomList = () => {
        // LEE: axios로 추후 변경
        apiFetch(`/api/attendances/classroom?grade=${grade}`)
            .then(res => res.json())
            .then(data => {
                setClassrooms(data);
            })
            .catch(err => {
                console.log("서버 연결 실패(테스트모드): 데모" + err);
                setErrorMessage(err.message || "알 수 없는 오류가 발생했습니다.");
                setClassrooms([]);
            });
    };
    useEffect(() => {
        loadClassroomList();
    }, [grade]);

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>{grade == '0' ? `1부` : `${grade}학년`} - 반 선택</h3>
            {errorMessage ? (
                <ErrorMessage
                    message={errorMessage}/>
            ) : classrooms.map((classroom) => (
                    <button key={classroom.id} className="menu-btn"
                            onPointerUp={() => navigate(generatePath(paths.classroomSheet.url, {
                                grade: classroom.grade.toString(),
                                classNo: classroom.classNo
                            }))}>
                        {grade === '0' ?
                            (classroom.classNo === '1' ? '남자' : '여자')
                            : `${classroom.classNo}`}반
                        ({classroom.teacherName} 쌤)
                    </button>
                )
            )}
        </div>
    );
}

export default ClassroomSelect;