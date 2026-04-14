export const ObjectLabelDialog = ({
  label,
  onClose,
}: {
  label: string
  onClose: () => void
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Object label"
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0, 0, 0, 0.28)",
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation()
        }}
        style={{
          width: "min(420px, 100%)",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Object label</div>
        <div
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            marginBottom: 16,
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
