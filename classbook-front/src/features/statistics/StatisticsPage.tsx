import {useEffect, useMemo, useState} from 'react';
import {apiFetch} from "../../hooks/api.ts";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {getMostRecentSunday} from "../../util/dateUtils.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import styles from './StatisticsPage.module.css'; // CSS 모듈 임포트

// 1. 백엔드 DTO에 맞춘 인터페이스 정의
interface StudentStats {
    grade: number;
    classNo: string;
    attendance: number;
    male: number;
    female: number;
    total: number;
    date: string;
    isSummited: boolean;
}

interface NewFriendStats {
    attendance: number;
    total: number;
}

interface StatisticsResponse {
    classStats: StudentStats[];
    newFriendStats: NewFriendStats;
}

const StatisticsPage = () => {
    const [selectedDate, setSelectedDate] = useState<string>(getMostRecentSunday());

    // 2. 상태 분리: 반별 통계 배열과 새친구 객체
    const [classStats, setClassStats] = useState<StudentStats[]>([]);
    const [newFriendStats, setNewFriendStats] = useState<NewFriendStats>({attendance: 0, total: 0});
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 백엔드가 StatisticsResponse 객체 형태로 내려줌
            const data: StatisticsResponse = await apiFetch(`/api/statistics/student-stats?date=${selectedDate}`);

            // 각각의 상태에 나누어 저장
            setClassStats(data.classStats || []);
            setNewFriendStats(data.newFriendStats || {attendance: 0, total: 0});
        } catch (error) {
            console.error("통계 데이터를 불러오는데 실패했습니다.", error);
            setClassStats([]);
            setNewFriendStats({attendance: 0, total: 0});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    // 학년별 데이터 그룹화
    const groupedStats = useMemo(() => {
        const groups: Record<number, StudentStats[]> = {};
        classStats.forEach(stat => {
            if (!groups[stat.grade]) groups[stat.grade] = [];
            groups[stat.grade].push(stat);
        });
        return groups;
    }, [classStats]);

    // 일반 학생 전체 총계 계산
    const overallStats = classStats.reduce((acc, current) => {
        acc.male += current.male;
        acc.female += current.female;
        acc.attendance += current.attendance;
        acc.total += current.total;
        return acc;
    }, {attendance: 0, total: 0, male: 0, female: 0});

    const renderPercent = (att: number, tot: number) => {
        if (tot === 0) return '0%';
        const percent = Math.round((att / tot) * 100);
        return `${percent}%`;
    };

    const getGradeName = (grade: number) => grade === 0 ? '1부' : `${grade}학년`;
    const getClassName = (grade: number, classNo: string) => {
        if (grade === 0) return classNo === '0' ? '여자반' : '남자반';
        return `${classNo}반`;
    };

    // 학년별 소계 계산 함수
    const getSubTotal = (stats: StudentStats[]) => {
        return stats.reduce((acc, curr) => {
            acc.attendance += curr.attendance;
            acc.total += curr.total;
            return acc;
        }, {attendance: 0, total: 0});
    };

    return (
        <div className="content" style={{position: 'relative', paddingBottom: '40px'}}>
            <BackButton/>
            <h4>출석 통계</h4>

            <DateSelector
                selectedDate={selectedDate}
                onChange={setSelectedDate}
            />

            {loading ? (
                <div className={styles.loading}>데이터를 불러오는 중...</div>
            ) : (
                <div className={styles.container}>
                    {/* 반별/학년별 통계 렌더링 (새친구 미포함) */}
                    {Object.keys(groupedStats).sort((a, b) => Number(a) - Number(b)).map(gradeKey => {
                        const grade = Number(gradeKey);
                        const stats = groupedStats[grade];
                        const subTotal = getSubTotal(stats);

                        return (
                            <div key={grade} style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                {/* 학년 전체 소계 Row */}
                                <div className={styles.gradeTotalRow}>
                                    <span className={styles.gradeTitle}>
                                        {getGradeName(grade)} 전체
                                    </span>
                                    <span className={styles.gradeStats}>
                                        {subTotal.attendance}/{subTotal.total}
                                        <span className={styles.percent}>
                                            {renderPercent(subTotal.attendance, subTotal.total)}
                                        </span>
                                    </span>
                                </div>

                                {/* 반별 디테일 Row */}
                                {stats.map((stat, idx) => {
                                    const isMissing = stat.attendance === 0;

                                    return (
                                        <div key={idx}
                                             className={`${styles.classRow} ${isMissing ? styles.classRowMissing : ''}`}>
                                            <span
                                                className={`${styles.className} ${isMissing ? styles.classNameMissing : ''}`}>
                                                {getClassName(grade, stat.classNo)}
                                            </span>
                                            <span
                                                className={`${styles.classStats} ${isMissing ? styles.classStatsMissing : ''}`}>
                                                {stat.attendance}/{stat.total}
                                                <span
                                                    className={`${styles.percent} ${isMissing ? styles.classNameMissing : styles.percentAccent}`}>
                                                    {renderPercent(stat.attendance, stat.total)}
                                                </span>
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {/* 3. 제일 하단: 전체 통계 */}
                    <div className={styles.overallRow}>
                        <span className={styles.overallTitle}>전체</span>
                        <span className={styles.overallStats}>
                            <span className={styles.genderStats}>
                                (남 {overallStats.male} / 여 {overallStats.female})
                            </span>
                            {overallStats.attendance} / {overallStats.total}
                        </span>
                    </div>

                    {/* 4. 새친구 서브 통계 (전체 통계 바로 아래 붙음) */}
                    {newFriendStats.total > 0 && (
                        <div className={styles.newFriendSubRow}>
                                <span className={styles.newFriendText}>
                                    (+ 새친구 {newFriendStats.attendance} / {newFriendStats.total})
                                </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;