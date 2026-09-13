import {useEffect, useState} from "react";
import BackButton from "../../components/common/BackButton.tsx";
import {apiFetch} from "../../hooks/api.ts";
import {DateSelector} from "../../components/common/DateSelector.tsx";
import {getMostRecentSunday, snapToSunday} from "../../util/dateUtils.tsx";
// 생일자 확인 페이지와 같은 목록 스타일 재사용
import styles from './BirthdayPage.module.css';

interface WeeklyStudent {
    id: number;
    name: string;
    grade: number | null;
    classNo: string | null;
    teacherName: string | null;
    date: string;       // yyyy-MM-dd (등록일 또는 등반일)
    status: number;
}

interface WeeklyNewFriendResponse {
    weekStart: string;
    weekEnd: string;
    registered: WeeklyStudent[];
    promoted: WeeklyStudent[];
}

const formatClassLabel = (grade: number | null, classNo: string | null): string => {
    if (grade === null || grade === undefined) return '반 미지정';
    if (grade === 0) return classNo === '0' ? '1부여' : '1부남';
    return classNo ? `${grade}-${classNo}` : `${grade}학년`;
};

// yyyy-MM-dd → M/d
const md = (d: string): string => {
    const p = d.split('-');
    return p.length === 3 ? `${Number(p[1])}/${Number(p[2])}` : d;
};

// yyyy-MM-dd 에 days 만큼 더하기
const addDays = (d: string, days: number): string => {
    const date = new Date(d + 'T12:00:00');
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-CA');
};

// 게시판 > 새친구/등반: 한 주(일~토)에 새로 온 친구와 등반한 친구
const NewFriendWeeklyPage = () => {
    const [weekStart, setWeekStart] = useState<string>(getMostRecentSunday());
    const [data, setData] = useState<WeeklyNewFriendResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/api/notice/new-friend-weekly?date=${weekStart}`)
            .then((res: WeeklyNewFriendResponse) => setData(res))
            .catch(err => console.error("새친구/등반 조회 실패:", err))
            .finally(() => setLoading(false));
    }, [weekStart]);

    const renderList = (list: WeeklyStudent[] | undefined, emptyText: string) =>
        !list?.length ? (
            <div className={styles.empty}>{emptyText}</div>
        ) : (
            <div className={styles.list}>
                {list.map(s => (
                    <div key={s.id} className={styles.item}>
                        <span className={styles.date}>{md(s.date)}</span>
                        <span className={styles.name}>{s.name}</span>
                        <span className={styles.classLabel}>
                            {formatClassLabel(s.grade, s.classNo)}{s.teacherName ? ` · ${s.teacherName}쌤` : ''}
                        </span>
                    </div>
                ))}
            </div>
        );

    return (
        <div className="content">
            <BackButton/>
            <h4>새친구/등반</h4>
            <div className={styles.container}>

                {/* 반 출석부와 같은 날짜 선택기. 어떤 날짜를 골라도 그 주의 일요일로 맞춤 */}
                <DateSelector
                    selectedDate={weekStart}
                    onChange={(d) => setWeekStart(snapToSunday(d))}
                />
                <div style={{textAlign: 'center', fontSize: '13px', color: '#868e96', margin: '6px 0 4px'}}>
                    {md(weekStart)} ~ {md(addDays(weekStart, 6))}
                </div>

                {loading ? (
                    <div className={styles.empty}>불러오는 중...</div>
                ) : (
                    <>
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>새로 온 친구 {data?.registered?.length ?? 0}명</div>
                            {renderList(data?.registered, '이 주에 새로 온 친구가 없습니다.')}
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>등반 {data?.promoted?.length ?? 0}명</div>
                            {renderList(data?.promoted, '이 주에 등반한 친구가 없습니다.')}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default NewFriendWeeklyPage;
