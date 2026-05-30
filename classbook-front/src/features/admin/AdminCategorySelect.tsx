import {useNavigate} from "react-router-dom";
import BackButton from "../../components/common/BackButton.tsx";
import {paths} from "../../constants/paths.tsx";

const AdminCategorySelect = () => {
    const navigate  = useNavigate();

    return (
        <div className="content">
            <BackButton/>
            <h4>관리자 페이지</h4>
            <div className="selection-grid">
                <button
                    className="selection-card"
                    onClick={()=>navigate(paths.cumulativeStatistics.url)}
                >
                    출석 누적 통계
                </button>
                <button
                    className="selection-card"
                    onClick={()=>navigate(paths.totalTeacherReports.url)}
                >
                    전체 교사보고서
                </button>
                <button
                    className="selection-card"
                    onClick={()=>navigate(paths.studentDetail.url)}
                >
                    학생 인적사항 수정
                </button>
                <button
                    className="selection-card"
                    onClick={()=>navigate(paths.teacherWeeklyReport.url)}
                >
                    선생님 주금새
                </button>
                <button
                    className="selection-card"
                    onClick={()=>navigate(paths.editHistory.url)}
                >
                    히스토리 열람
                </button>
            </div>


        </div>
    );
};

export default AdminCategorySelect;