import { useEffect, useRef } from "react"

type ContextMenuProps = {
  x: number
  y: number
  onSaveCamera: () => void
  onClearCamera: () => void
  onAddMark: () => void
  onClearMarks: () => void
  onClose: () => void
}

export const ContextMenu = ({
  x,
  y,
  onSaveCamera,
  onClearCamera,
  onAddMark,
  onClearMarks,
  onClose,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const menuStyle: React.CSSProperties = {
    position: "absolute",
    left: x,
    top: y,
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: 4,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    padding: 0,
    zIndex: 1000,
    minWidth: 180,
  }

  const menuItemStyle: React.CSSProperties = {
    padding: "8px 12px",
    cursor: "pointer",
    userSelect: "none",
  }

  const handleItemHover = (e: React.MouseEvent) => {
    e.currentTarget.style.backgroundColor = "#f5f5f5"
  }

  const handleItemLeave = (e: React.MouseEvent) => {
    e.currentTarget.style.backgroundColor = ""
  }

  return (
    <div ref={menuRef} style={menuStyle}>
      <div
        style={menuItemStyle}
        onClick={() => {
          onSaveCamera()
          onClose()
        }}
        onMouseEnter={handleItemHover}
        onMouseLeave={handleItemLeave}
      >
        Save Camera Position
      </div>
      <div
        style={menuItemStyle}
        onClick={() => {
          onClearCamera()
          onClose()
        }}
        onMouseEnter={handleItemHover}
        onMouseLeave={handleItemLeave}
      >
        Clear Saved Camera Position
      </div>
      <div
        style={menuItemStyle}
        onClick={() => {
          onAddMark()
          onClose()
        }}
        onMouseEnter={handleItemHover}
        onMouseLeave={handleItemLeave}
      >
        Add Mark
      </div>
      <div
        style={menuItemStyle}
        onClick={() => {
          onClearMarks()
          onClose()
        }}
        onMouseEnter={handleItemHover}
        onMouseLeave={handleItemLeave}
      >
        Clear Marks
      </div>
    </div>
  )
}
