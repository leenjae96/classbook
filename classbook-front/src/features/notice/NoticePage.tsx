import { useEffect, useState } from "react";
import type { BirthdayResponse, StudentBirthday, TeacherBirthday } from "../../constants/types.tsx";
import BackButton from "../../components/common/BackButton.tsx";
import { apiFetch } from "../../hooks/api.ts";
import styles from './NoticePage.module.css';

const formatClassLabel = (grade: number, classNo: string): string => {
    if (grade === 0) return classNo === '0' ? '1부여' : '1부남';
    return `${grade}-${classNo}`;
};

const NoticePage = () => {
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [birthdayResponse, setBirthdayResponse] = useState<BirthdayResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        apiFetch(`/api/notice/birthday?month=${selectedMonth}`)
            .then((data: BirthdayResponse) => setBirthdayResponse(data))
            .catch(err => console.error("생일 조회 실패:", err))
            .finally(() => setLoading(false));
    }, [selectedMonth]);

    const goPrev = () => setSelectedMonth(m => (m === 1 ? 12 : m - 1));
    const goNext = () => setSelectedMonth(m => (m === 12 ? 1 : m + 1));

    return (
        <div className="content">
            <BackButton />
            <div className={styles.container}>

                {/* 월 네비게이션 */}
                <div className={styles.monthNav}>
                    <button className={styles.navBtn} onClick={goPrev}>◀</button>
                    <span className={styles.monthLabel}>{selectedMonth}월 생일</span>
                    <button className={styles.navBtn} onClick={goNext}>▶</button>
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

export default NoticePage;
