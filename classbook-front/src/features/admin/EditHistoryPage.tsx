import {useEffect, useState} from 'react';
import {apiFetch} from '../../hooks/api.ts';
import BackButton from '../../components/common/BackButton.tsx';

interface HistoryItem {
    id: number;
    studentName: string;
    oldClassroom: string;
    newClassroom: string;
    comments: string | null;
    statusChangeDate: string;   // yyyy-MM-dd
    createdAt: string;          // ISO LocalDateTime
}

interface HistoryResponse {
    items: HistoryItem[];
}

// 올해 1/1 ~ 오늘 기본 범위
const startOfYear = () => `${new Date().getFullYear()}-01-01`;
const today = () => new Date().toLocaleDateString('en-CA');

const formatDateTime = (iso: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EditHistoryPage = () => {
    const [startDate, setStartDate] = useState<string>(startOfYear());
    const [endDate, setEndDate] = useState<string>(today());
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const load = () => {
        setLoading(true);
        apiFetch(`/api/administrator/histories?startDate=${startDate}&endDate=${endDate}`)
            .then((data: HistoryResponse) => setItems(data.items || []))
            .catch(err => {
                console.error(err);
                alert('히스토리를 불러오지 못했습니다.');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate]);

    const th: React.CSSProperties = {
        padding: '8px 6px', borderBottom: '2px solid var(--border-color, #ccc)',
        textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 700, fontSize: '13px',
        position: 'sticky', top: 0, background: 'var(--card-bg, #f8f9fa)',
    };
    const td: React.CSSProperties = {
        padding: '7px 6px', borderBottom: '1px solid var(--border-color, #eee)',
        fontSize: '13px', verticalAlign: 'top',
    };

    return (
        <div className="content">
            <BackButton/>
            <h4>히스토리 열람</h4>

            <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap'}}>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                       style={{padding: '6px', borderRadius: '5px', border: '1px solid #ccc'}}/>
                <span>~</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                       style={{padding: '6px', borderRadius: '5px', border: '1px solid #ccc'}}/>
                <span style={{marginLeft: 'auto', fontSize: '13px', color: '#868e96'}}>총 {items.length}건</span>
            </div>

            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#adb5bd'}}>불러오는 중...</div>
            ) : items.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#adb5bd'}}>해당 기간의 기록이 없습니다.</div>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{borderCollapse: 'collapse', width: '100%', minWidth: '640px'}}>
                        <thead>
                            <tr>
                                <th style={th}>날짜</th>
                                <th style={th}>이름</th>
                                <th style={th}>이전반</th>
                                <th style={th}>새반</th>
                                <th style={{...th, width: '100%'}}>코멘트</th>
                                <th style={th}>수정일시</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => {
                                // 같은 날짜는 첫 행에만 표시 (스프레드시트 형태)
                                const showDate = idx === 0 || items[idx - 1].statusChangeDate !== it.statusChangeDate;
                                return (
                                    <tr key={it.id}>
                                        <td style={{...td, whiteSpace: 'nowrap', fontWeight: showDate ? 600 : 400}}>
                                            {showDate ? it.statusChangeDate : ''}
                                        </td>
                                        <td style={{...td, whiteSpace: 'nowrap'}}>{it.studentName}</td>
                                        <td style={{...td, whiteSpace: 'nowrap'}}>{it.oldClassroom}</td>
                                        <td style={{...td, whiteSpace: 'nowrap'}}>{it.newClassroom}</td>
                                        <td style={td}>{it.comments}</td>
                                        <td style={{...td, whiteSpace: 'nowrap', color: '#868e96'}}>
                                            {formatDateTime(it.createdAt)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EditHistoryPage;
