export default function Board() {
    return (
        <div className="t2048-boardShell">
            {/* Build #1: Board scaffold only (no grid/tiles yet) */}
            <div style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)" }} />
        </div>
    );
}
