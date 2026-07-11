import {useMemo, useRef, useState} from 'react';
import {apiFetch} from '../../hooks/api.ts';
import './StudentQuickSearch.css';

interface SearchInfo {
    id: number;
    name: string;
    birthday: string | null;
    school: string | null;
    grade: number | null;
    classNo: string | null;
    status: number;
}

const STATUS_LABEL: Record<number, string> = {
    0: '새친구', 1: '일반', 2: '졸업', 3: '별분', 4: '휴직',
};

const classLabel = (grade: number | null, classNo: string | null): string => {
    if (grade === null || grade === undefined) return '학년 미지정';
    if (grade === 0) return classNo === '0' ? '1부 여자' : '1부 남자';
    return classNo ? `${grade}학년 ${classNo}반` : `${grade}학년 반미지정`;
};

// 이름에서 검색어와 일치하는 부분만 굵게
const highlight = (name: string, q: string) => {
    if (!q) return name;
    const idx = name.indexOf(q);
    if (idx < 0) return name;
    return (
        <>
            {name.slice(0, idx)}
            <strong>{name.slice(idx, idx + q.length)}</strong>
            {name.slice(idx + q.length)}
        </>
    );
};

const StudentQuickSearch = () => {
    const [all, setAll] = useState<SearchInfo[]>([]);
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const fetchedRef = useRef(false); // 이 페이지에 머무는 동안 1회만 로드

    // 검색창을 처음 눌렀을 때만 전체 학생 리스트를 가져와 캐시 (홈 진입만으로는 로드 안 함)
    const ensureLoaded = () => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        setLoading(true);
        apiFetch('/api/attendances/students/search')
            .then((data: SearchInfo[]) => setAll(data))
            .catch(err => {
                console.error('학생 검색 목록 로드 실패:', err);
                fetchedRef.current = false; // 실패 시 다음 포커스에 재시도
            })
            .finally(() => setLoading(false));
    };

    const q = query.trim();
    const results = useMemo(() => {
        if (!q) return [];
        // 백엔드가 이미 별분(3) 맨 아래 + 이름 오름차순으로 정렬해 내려줌 (전체 매칭, 스크롤로 확인)
        return all.filter(s => s.name.includes(q));
    }, [all, q]);

    const open = focused && q.length > 0;

    return (
        <div className="qs-wrap">
            <input
                className="qs-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    setFocused(true);
                    ensureLoaded();
                }}
                onBlur={() => setFocused(false)}
                placeholder="학생 이름 검색"
            />
            {open && (
                <div className="qs-results">
                    {loading && all.length === 0 ? (
                        <div className="qs-empty">불러오는 중...</div>
                    ) : results.length === 0 ? (
                        <div className="qs-empty">검색 결과가 없습니다.</div>
                    ) : (
                        results.map(s => {
                            const sub = [
                                classLabel(s.grade, s.classNo),
                                s.school ? `${s.school}중` : null,
                            ].filter(Boolean).join(' · ');
                            return (
                                <div key={s.id} className={`qs-item${s.status === 3 ? ' qs-item-special' : ''}`}>
                                    <div className="qs-name">
                                        {highlight(s.name, q)}
                                        <span className="qs-badge">({STATUS_LABEL[s.status] ?? '기타'})</span>
                                    </div>
                                    <div className="qs-sub">{sub}</div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentQuickSearch;
