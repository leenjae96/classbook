import {useEffect, useRef, useState} from 'react';

interface Props {
    src: string;
    alt?: string;
    onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// 화면 최상단에 뜨는 이미지 뷰어 (확대/축소 + 드래그 이동)
const ImageViewer = ({src, alt, onClose}: Props) => {
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({x: 0, y: 0});
    const stageRef = useRef<HTMLDivElement | null>(null);
    // 드래그 상태 (리렌더가 필요 없어 ref 로 관리)
    const drag = useRef<{ active: boolean; startX: number; startY: number; baseX: number; baseY: number }>({
        active: false, startX: 0, startY: 0, baseX: 0, baseY: 0,
    });

    const reset = () => { setScale(1); setOffset({x: 0, y: 0}); };
    const zoomBy = (delta: number) => setScale(s => {
        const next = clamp(s + delta, MIN_SCALE, MAX_SCALE);
        if (next === 1) setOffset({x: 0, y: 0}); // 원래 크기로 돌아오면 위치도 가운데로
        return next;
    });

    // ESC 로 닫기 + 열려 있는 동안 뒤쪽 스크롤 잠금
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    // 휠 확대/축소 (passive 리스너로는 기본 스크롤을 막을 수 없어 직접 등록)
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setScale(s => {
                const next = clamp(s + (e.deltaY < 0 ? 0.25 : -0.25), MIN_SCALE, MAX_SCALE);
                if (next === 1) setOffset({x: 0, y: 0});
                return next;
            });
        };
        el.addEventListener('wheel', onWheel, {passive: false});
        return () => el.removeEventListener('wheel', onWheel);
    }, []);

    const onPointerDown = (e: React.PointerEvent) => {
        if (scale <= 1) return; // 확대 상태에서만 이동
        drag.current = {active: true, startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y};
        (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onPointerMove = (e: React.PointerEvent) => {
        if (!drag.current.active) return;
        setOffset({
            x: drag.current.baseX + (e.clientX - drag.current.startX),
            y: drag.current.baseY + (e.clientY - drag.current.startY),
        });
    };
    const endDrag = () => { drag.current.active = false; };

    const btnStyle: React.CSSProperties = {
        width: '40px', height: '40px', borderRadius: '50%', border: 'none',
        background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '18px', fontWeight: 700,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', touchAction: 'none',
        }}>
            {/* 닫기 (왼쪽 위) */}
            <button
                onClick={onClose}
                aria-label="닫기"
                style={{...btnStyle, position: 'absolute', top: '16px', left: '16px', zIndex: 2}}
            >
                ✕
            </button>

            {/* 확대/축소 */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: '10px', alignItems: 'center', zIndex: 2,
            }}>
                <button onClick={() => zoomBy(-0.5)} aria-label="축소" style={btnStyle}>−</button>
                <span style={{
                    color: '#fff', fontSize: '13px', minWidth: '48px', textAlign: 'center',
                    background: 'rgba(0,0,0,0.6)', borderRadius: '14px', padding: '6px 10px',
                }}>
                    {Math.round(scale * 100)}%
                </span>
                <button onClick={() => zoomBy(0.5)} aria-label="확대" style={btnStyle}>+</button>
                <button onClick={reset} aria-label="원래 크기"
                        style={{...btnStyle, width: 'auto', padding: '0 14px', borderRadius: '20px', fontSize: '13px'}}>
                    원래 크기
                </button>
            </div>

            {/* 이미지 영역 */}
            <div
                ref={stageRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onDoubleClick={() => (scale > 1 ? reset() : setScale(2))}
                style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: scale > 1 ? 'grab' : 'zoom-in',
                }}
            >
                <img
                    src={src}
                    alt={alt ?? ''}
                    draggable={false}
                    style={{
                        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        transition: drag.current.active ? 'none' : 'transform 0.12s ease-out',
                        userSelect: 'none',
                    }}
                />
            </div>
        </div>
    );
};

export default ImageViewer;
