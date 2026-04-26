import {generatePath, useNavigate} from "react-router-dom";
import {paths} from "../../constants/paths.tsx";
import BackButton from "../../components/common/BackButton.tsx";

const WorshipTeamSelect = () => {
    const navigate = useNavigate();
    const teams: string[] = ['싱어', '악기', '워십', '엔지니어'];

    return (
        <div className="content">
            <BackButton/>
            <h4>팀 선택</h4>
            <div className="selection-grid">
                {teams.map((teamName) => (
                    <button
                        key={teamName}
                        className="selection-card"
                        onClick={() => navigate(generatePath(paths.worshipTeamSheet.url, {teamName: teamName}))}
                    >
                        {teamName}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WorshipTeamSelect;