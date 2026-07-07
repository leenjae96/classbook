import {useState} from 'react';
import type {FormEvent} from 'react';
import {Outlet} from 'react-router-dom';
import {apiFetch} from '../../hooks/api.ts';
import {getAdminToken, setAdminToken} from '../../hooks/adminAuth.ts';
import BackButton from './BackButton.tsx';

// 관리자 라우트 가드: 유효한 토큰이 없으면 PIN 입력 화면을 먼저 보여준다.
// PIN 검증과 토큰 발급은 전부 서버(/api/administrator/login)에서 수행.
const AdminGate = () => {
    const [authed, setAuthed] = useState<boolean>(() => !!getAdminToken());
    const [pin, setPin] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (authed) return <Outlet/>;

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!pin.trim() || submitting) return;
        setSubmitting(true);
        try {
            const data = await apiFetch('/api/administrator/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pin: pin.trim()}),
            });
            setAdminToken(data.token, data.expiresAt);
            setAuthed(true);
        } catch (err) {
            alert(err instanceof Error && err.message ? err.message : 'PIN 확인에 실패했습니다.');
            setPin('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="content" style={{position: 'relative'}}>
            <BackButton/>
            <div style={{
                marginTop: '60px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            }}>
                <div style={{fontSize: '36px'}}>🔒</div>
                <h4 style={{margin: 0}}>관리자 인증</h4>
                <p style={{fontSize: '13px', color: '#868e96', margin: 0, textAlign: 'center'}}>
                    관리자 메뉴에 접근하려면 PIN을 입력하세요.
                </p>
                <form onSubmit={submit} style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '260px'}}>
                    <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        autoFocus
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="PIN 입력"
                        style={{
                            padding: '12px', borderRadius: '8px', border: '1px solid #ccc',
                            fontSize: '18px', textAlign: 'center', letterSpacing: '6px',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !pin.trim()}
                        style={{
                            padding: '12px', borderRadius: '8px', border: 'none',
                            background: submitting ? '#adb5bd' : '#007bff', color: '#fff',
                            fontSize: '15px', fontWeight: 600,
                        }}
                    >
                        {submitting ? '확인 중...' : '확인'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminGate;
