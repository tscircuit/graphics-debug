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
  const { x, y, text, color, fontSize, anchorSide } = textObj
  const screenPos = applyToPoint(realToScreen, { x, y })

  const transformMap: Record<Types.NinePointAnchor, string> = {
    top_left: "translate(0%, 0%)",
    top_center: "translate(-50%, 0%)",
    top_right: "translate(-100%, 0%)",
    center_left: "translate(0%, -50%)",
    center: "translate(-50%, -50%)",
    center_right: "translate(-100%, -50%)",
    bottom_left: "translate(0%, -100%)",
    bottom_center: "translate(-50%, -100%)",
    bottom_right: "translate(-100%, -100%)",
  }
  const transform =
    transformMap[(anchorSide ?? "center") as Types.NinePointAnchor]

  return (
    <div
      style={{
        position: "absolute",
        left: screenPos.x,
        top: screenPos.y,
        transform,
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
