import {useNavigate} from "react-router-dom";

const StatisticsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="content">
            <button className="go-back-btn" onPointerUp={() => navigate(-1)}>← 뒤로가기</button>
            <h3>통계</h3>
            개발중인 페이지입니다.
        </div>
    );
}

export default StatisticsPage;