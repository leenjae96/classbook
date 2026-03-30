import {generatePath, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {ClassroomSummary} from "../../constants/types.tsx";
import {paths} from "../../constants/paths.tsx";
import {apiFetch} from "../../hooks/api.ts";
import {ErrorMessage} from "../../components/common/ErrorMessage.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const ClassroomSelect = () => {
    const navigate = useNavigate();

    const {grade} = useParams<{ grade: string }>();
    const [classrooms, setClassrooms] = useState<ClassroomSummary[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadClassroomList = () => {
        apiFetch(`/api/attendances/classroom?grade=${grade}`)
            .then((data: ClassroomSummary[]) => {
                setClassrooms(data);
            })
            .catch(err => {
                console.log("서버 연결 실패/ " + err);
                setErrorMessage(err.message || "알 수 없는 오류가 발생했습니다.");
                setClassrooms([]);
            });
    };

    useEffect(() => {
        loadClassroomList();
    }, [grade]);

    return (
        <div className="content">
            <BackButton/>
            <h4>{grade == '0' ? `1부` : `${grade}학년`} - 반 선택</h4>

            {errorMessage ? (
                <ErrorMessage message={errorMessage}/>
            ) : (
                <div className="selection-grid">
                    {classrooms.map((classroom) => (
                        <div
                            key={classroom.id}
                            className="selection-card"
                            onPointerUp={() => navigate(generatePath(paths.classroomSheet.url, {
                                grade: classroom.grade.toString(),
                                classNo: classroom.classNo
                            }))}
                        >
                            <span>
                                {grade === '0' ?
                                    (classroom.classNo === '1' ? '남자반' : '여자반')
                                    : `${classroom.classNo}반`}
                            </span>
                            <span className="sub-text">{classroom.teacherName} 선생님</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ClassroomSelect;