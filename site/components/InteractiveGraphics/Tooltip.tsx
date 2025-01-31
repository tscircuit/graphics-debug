export const Tooltip = ({ text }: { text: string }) => {
  return (
    <div className="inline-block">
      <div
        style={{
          background: "white",
          border: "1px solid #ccc",
          boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "12px",
          maxWidth: "300px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </div>
    </div>
  )
}
