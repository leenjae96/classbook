import {useNavigate, generatePath} from "react-router-dom";
import {paths} from "../constants/paths.tsx";
import "../App.css";
import {useEffect, useState} from "react";
import {Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {apiFetch} from "../hooks/api.ts";
import {parseMarkdown} from "../util/markdownParser.ts";

// 서버에서 받아올 5주치 데이터 타입 정의
interface WeeklyStats {
    date: string;  // "02/18", "02/25" 등 라벨용
    grade0: number;
    grade1: number;
    grade2: number;
    grade3: number;
}

const CHANGELOG_SESSION_KEY = 'changelog_seen';

const Home = () => {
    const navigate = useNavigate();
    const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [changelogHtml, setChangelogHtml] = useState<string | null>(null);

    useEffect(() => {
        if (sessionStorage.getItem(CHANGELOG_SESSION_KEY)) return;
        fetch('/changelog.md')
            .then(res => res.text())
            .then(text => setChangelogHtml(parseMarkdown(text)))
            .catch(() => {});
    }, []);

    const closeChangelog = () => {
        sessionStorage.setItem(CHANGELOG_SESSION_KEY, '1');
        setChangelogHtml(null);
    };

    useEffect(() => {
        const fetchWeeklyStats = async () => {
            try {
                setLoading(true);
                const today = new Date().toLocaleDateString('en-CA');
                const data: WeeklyStats[] = await apiFetch(`/api/statistics/for-dashboard?date=${today}`);
                setWeeklyData(data);
            } catch (error) {
                console.error("주간 통계 데이터를 불러오는 중 오류 발생:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWeeklyStats();
    }, []);

    // 커스텀 툴팁 (마우스 올렸을 때 전체 합계도 보여주기 위함)
    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
            return (
                <div style={{
                    backgroundColor: '#fff',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px'
                }}>
                    <p style={{margin: 0, fontWeight: 'bold'}}>{label} 출석</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{margin: '3px 0', color: entry.color, fontSize: '13px'}}>
                            {entry.name}: {entry.value}명
                        </p>
                    ))}
                    <hr style={{margin: '5px 0'}}/>
                    <p style={{margin: 0, fontWeight: 'bold', fontSize: '14px'}}>총합: {total}명</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-container">
            {changelogHtml && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '28px 32px',
                        maxWidth: '480px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                        position: 'relative',
                    }}>
                        <div
                            dangerouslySetInnerHTML={{ __html: changelogHtml }}
                            style={{ fontSize: '14px', lineHeight: '1.75', color: '#343a40' }}
                        />
                        <button
                            onClick={closeChangelog}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#4361ee',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            확인했습니다
                        </button>
                    </div>
                </div>
            )}

            <h2 className="dashboard-title">대시보드 홈</h2>

            <div className="dashboard-grid">
                {/* 1. 출석 교사보고서 카드 */}
                <div className="dashboard-card">
                    {/* 카드 헤더 영역: 클릭하면 해당 메인 페이지로 이동 */}
                    <div className="card-header" onClick={() => navigate(paths.attendanceCategorySelect.url)}>
                        <h3>📝 출석 교사보고서</h3>
                        <span className="arrow">➔</span>
                    </div>
                    {/* 카드 내용 영역: 자주 가는 뎁스로 바로가는 퀵 링크 */}
                    <div className="card-body">
                        <div className="quick-links">
                            <button
                                onClick={() => navigate(generatePath(paths.classroomSelect.url, {grade: '1'}))}>1학년
                            </button>
                            <button
                                onClick={() => navigate(generatePath(paths.classroomSelect.url, {grade: '2'}))}>2학년
                            </button>
                            <button
                                onClick={() => navigate(generatePath(paths.classroomSelect.url, {grade: '3'}))}>3학년
                            </button>
                            <button
                                onClick={() => navigate(generatePath(paths.classroomSelect.url, {grade: '0'}))}>1부
                            </button>
                            <button onClick={() => navigate(paths.administrativeTeacherSelect.url)}>반목 외</button>
                            <button onClick={() => navigate(paths.newfriend.url)}>새친구</button>
                        </div>
                        <hr style={{margin: '10px 0 10px 0'}}/>
                        <div className="quick-links-sub">
                            <button className="outline-btn"
                                    onClick={() => navigate(paths.worshipTeamSelect.url)}>찬양팀
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. 공지사항 카드 */}
                <div className="dashboard-card">
                    <div className="card-header" onClick={() => navigate(paths.noticeCategorySelect.url)}>
                        <h3>📢 최근 공지사항</h3>
                        <span className="arrow">➔</span>
                    </div>
                    <div className="card-body">
                        {/* 실제로는 API에서 최근 3개를 불러와서 맵핑하면 돼 */}
                        <ul className="notice-list">
                            <li><span className="badge">공지</span> 최근 공지사항이 들어갈 자리입니다.</li>
                            <li><span className="badge urgent">긴급</span> (개발 중)</li>
                            <li><span className="badge">안내</span></li>
                        </ul>
                    </div>
                </div>

                {/* ✨ 3. 출석 통계 카드 (그래프 적용) */}
                <div className="dashboard-card">
                    <div className="card-header" onClick={() => navigate(paths.statistics.url)}>
                        <h3>📊 주간 출석 통계</h3>
                        <span className="arrow">➔</span>
                    </div>
                    <div className="card-body">
                        <div style={{ width: '100%', height: '240px', marginTop: '10px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    데이터를 불러오는 중...
                                </div>
                            ) : weeklyData.length === 0 ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    표시할 통계 데이터가 없습니다.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />

                                        {/* 스택 순서를 밑에서부터 쌓고 싶다면 stackId를 활용. 현재는 a로 모두 쌓임 */}
                                        <Bar dataKey="grade1" name="1학년" stackId="a" fill="#007bff" />
                                        <Bar dataKey="grade2" name="2학년" stackId="a" fill="#4dd0e1" />
                                        <Bar dataKey="grade3" name="3학년" stackId="a" fill="#ffb74d" />
                                        {/* 가장 위에 쌓이는 1부(grade0)의 상단 모서리를 둥글게(radius) 처리 */}
                                        <Bar dataKey="grade0" name="1부" stackId="a" fill="#81c784" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. 관리자 메뉴 카드 */}
                <div className="dashboard-card">
                    <div className="card-header" onClick={() => navigate(paths.administrator.url)}>
                        <h3>⚙️ 관리자 메뉴</h3>
                        <span className="arrow">➔</span>
                    </div>
                    <div className="card-body center-content">
                        <p className="placeholder-text">출석 마감 및 시스템 설정<br/>(권한 필요)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;