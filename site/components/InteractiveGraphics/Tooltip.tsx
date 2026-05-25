export const Tooltip = ({ text }: { text: string }) => {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #ccc",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "12px",
        minWidth: "120px",
        maxWidth: "300px",
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        zIndex: 100,
      }}
    >
      {text}
    </div>
  )
}
