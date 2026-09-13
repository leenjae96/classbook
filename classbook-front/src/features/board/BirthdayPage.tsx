import { useEffect, useState } from "react";
import type { BirthdayResponse, StudentBirthday, TeacherBirthday } from "../../constants/types.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import { apiFetch } from "../../hooks/api.ts";
import styles from './BirthdayPage.module.css';

const formatClassLabel = (grade: number, classNo: string): string => {
    if (grade === 0) return classNo === '0' ? '1부여' : '1부남';
    return `${grade}-${classNo}`;
};

// 게시판 > 생일자 확인
const BirthdayPage = () => {
    // 개인정보 보호: 이번 달과 다음 달만 볼 수 있음 (백엔드도 동일하게 제한)
    const thisMonth = new Date().getMonth() + 1;
    const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;
    const [selectedMonth, setSelectedMonth] = useState<number>(thisMonth);
    const [birthdayResponse, setBirthdayResponse] = useState<BirthdayResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/api/notice/birthday?month=${selectedMonth}`)
            .then((data: BirthdayResponse) => setBirthdayResponse(data))
            .catch(err => console.error("생일 조회 실패:", err))
            .finally(() => setLoading(false));
    }, [selectedMonth]);

    const canPrev = selectedMonth === nextMonth;
    const canNext = selectedMonth === thisMonth;
    const goPrev = () => { if (canPrev) setSelectedMonth(thisMonth); };
    const goNext = () => { if (canNext) setSelectedMonth(nextMonth); };
    const disabledStyle = {opacity: 0.3, cursor: 'not-allowed'};

    return (
        <div className="content">
            <BackButton />
            <h4>생일자 확인</h4>
            <div className={styles.container}>

                {/* 월 네비게이션 */}
                <div className={styles.monthNav}>
                    <button className={styles.navBtn} onClick={goPrev} disabled={!canPrev}
                            style={canPrev ? undefined : disabledStyle}>◀</button>
                    <span className={styles.monthLabel}>{selectedMonth}월 생일</span>
                    <button className={styles.navBtn} onClick={goNext} disabled={!canNext}
                            style={canNext ? undefined : disabledStyle}>▶</button>
                </div>

                {loading ? (
                    <div className={styles.empty}>불러오는 중...</div>
                ) : (
                    <>
                        {/* 학생 생일 */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>🎂 학생</div>
                            {!birthdayResponse?.studentBirthdays?.length ? (
                                <div className={styles.empty}>이 달에 생일인 학생이 없습니다.</div>
                            ) : (
                                <div className={styles.list}>
                                    {birthdayResponse.studentBirthdays.map((s: StudentBirthday) => (
                                        <div key={s.id} className={styles.item}>
                                            <span className={styles.date}>{s.birthday}</span>
                                            <span className={styles.name}>{s.name}</span>
                                            <span className={styles.classLabel}>
                                                {formatClassLabel(s.grade, s.classNo)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 선생님 생일 */}
                        <div className={styles.section}>
                            <div className={styles.sectionTitle}>🎂 선생님</div>
                            {!birthdayResponse?.teacherBirthdays?.length ? (
                                <div className={styles.empty}>이 달에 생일인 선생님이 없습니다.</div>
                            ) : (
                                <div className={styles.list}>
                                    {birthdayResponse.teacherBirthdays.map((t: TeacherBirthday) => (
                                        <div key={t.id} className={styles.item}>
                                            <span className={styles.date}>{t.birthday}</span>
                                            <span className={styles.name}>{t.name}</span>
                                            {t.isLunar && (
                                                <span className={styles.lunarBadge}>음력</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default BirthdayPage;
