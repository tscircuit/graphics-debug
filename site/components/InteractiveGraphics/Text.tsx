import type * as Types from "lib/types"
import { applyToPoint } from "transformation-matrix"
import type { InteractiveState } from "./InteractiveState"

export const Text = ({
  textObj,
  interactiveState,
  index,
}: {
  textObj: Types.Text
  interactiveState: InteractiveState
  index: number
}) => {
  const { realToScreen, onObjectClicked } = interactiveState
  const { position, text, color, fontSize } = textObj
  const screenPos = applyToPoint(realToScreen, position)

  return (
    <div
      style={{
        position: "absolute",
        left: screenPos.x,
        top: screenPos.y,
        transform: "translate(-50%, -50%)",
        color: color || "black",
        fontSize: fontSize ?? 12,
        whiteSpace: "pre",
        cursor: "default",
      }}
      onClick={() =>
        onObjectClicked?.({ type: "text", index, object: textObj })
      }
    >
      {text}
    </div>
  )
}
