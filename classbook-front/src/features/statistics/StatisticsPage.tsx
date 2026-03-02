import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {apiFetch} from "../../hooks/api.ts";
// import { paths } from '../../constants/paths.tsx'; // 나중에 하단 버튼 주석 해제 시 사용

// 1. DTO 타입 정의
interface ClassStats {
    grade: number;
    classNo: string;
    attendance: number;
    total: number;
    date: string;
}

const StatisticsPage = () => {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
    const [classStats, setClassStats] = useState<ClassStats[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 백엔드 Controller의 엔드포인트와 파라미터(date)에 맞춰 요청
            const data = await apiFetch(`/api/statistics/class-stats?date=${selectedDate}`);

            // 받아온 실제 데이터를 상태에 저장
            setClassStats(data);
        } catch (error) {
            console.error("통계 데이터를 불러오는데 실패했습니다.", error);
            // 에러 발생 시 빈 배열로 초기화하여 화면이 깨지지 않게 방어
            setClassStats([]);
        } finally {
            // 성공/실패 여부와 상관없이 로딩 상태 해제
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const handlePrevWeek = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 7);
        setSelectedDate(date.toLocaleDateString('en-CA'));
    };

    const handleNextWeek = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 7);
        setSelectedDate(date.toLocaleDateString('en-CA'));
    };

    const overallStats = classStats.reduce((acc, current) => {
        acc.attendance += current.attendance;
        acc.total += current.total;
        return acc;
    }, { attendance: 0, total: 0 });

    const renderPercent = (att: number, tot: number) => {
        if (tot === 0) return '0%';
        const percent = Math.round((att / tot) * 100);
        return `${percent}%`;
    };

    // --- 시각적 스타일 정의 ---
    const colors = {
        primary: '#007bff',
        accent: '#4dd0e1',
        bgGrey: '#f8f9fa',
        textMain: '#333',
        textSub: '#555',
    };

    const rowPillStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: colors.bgGrey,
        padding: '12px 20px',
        borderRadius: '25px',
        alignItems: 'center',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        marginBottom: '10px'
    };

    return (
        <div className="content" style={{ position: 'relative' }}>
            {/* 상단 헤더 (다른 페이지와 통일) */}
            <button className="go-back-btn" onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>
                ← 뒤로가기
            </button>
            <h3>출석 통계</h3>

            {/* 날짜 선택 영역 */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '25px',
                marginTop: '15px'
            }}>
                <button onClick={handlePrevWeek} style={{ border: 'none', background: colors.primary, color: 'white', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}>◀</button>
                <div style={{ margin: '0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{
                            border: 'none',
                            fontSize: '17px',
                            fontWeight: '500',
                            color: colors.textMain,
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                        }}
                    />
                </div>
                <button onClick={handleNextWeek} style={{ border: 'none', background: colors.primary, color: 'white', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}>▶</button>
            </div>

            {/* 통계 데이터 목록 영역 */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>데이터를 불러오는 중...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {classStats.map((stat, index) => (
                        <div key={index} style={rowPillStyle}>
                            <span style={{ fontWeight: '600', fontSize: '16px', color: colors.textMain }}>
                                {stat.grade}학년 {stat.classNo}반
                            </span>
                            <span style={{ fontSize: '16px', fontWeight: '500', color: colors.textSub }}>
                                {stat.attendance}/{stat.total}
                                <span style={{ color: colors.accent, marginLeft: '8px', fontSize: '14px', fontWeight: '600' }}>
                                    {renderPercent(stat.attendance, stat.total)}
                                </span>
                            </span>
                        </div>
                    ))}

                    {/* 전체 카운트 행 */}
                    <div style={{...rowPillStyle, backgroundColor: '#e8f0fe', marginTop: '15px'}}>
                        <span style={{ fontWeight: '700', fontSize: '16px', color: colors.textMain }}>
                            전체카운트
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: '600', color: colors.textSub }}>
                            {overallStats.attendance}/{overallStats.total}
                            <span style={{ color: colors.accent, marginLeft: '8px', fontSize: '14px', fontWeight: '700' }}>
                                {renderPercent(overallStats.attendance, overallStats.total)}
                            </span>
                        </span>
                    </div>
                </div>
            )}

            {/* 하단 네비게이션 버튼 (주석 처리) */}
            {/* <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: '40px',
                padding: '20px 0',
                borderTop: '2px solid #eee',
                backgroundColor: 'white'
            }}>
                <button
                    onPointerUp={() => navigate(paths.root)}
                    style={{ border: 'none', background: 'none', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', color: colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏠 홈으로가기
                </button>
                <button
                    onPointerUp={() => navigate(paths.administrativeTeacherSelect.url)}
                    style={{ border: 'none', background: 'none', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', color: colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📝 목양관리
                </button>
            </div>
            */}
        </div>
    );
};

export default StatisticsPage;