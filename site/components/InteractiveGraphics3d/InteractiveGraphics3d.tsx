import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { GraphicsObject, Rect3d } from "../../../lib"

type HoverInfo = { label: string; x: number; y: number } | null

const DEFAULT_COLOR = new THREE.Color("#4a90e2")

function getRectColor(rect: Rect3d): THREE.Color {
  if (rect.fill) return new THREE.Color(rect.fill)
  if (rect.color) return new THREE.Color(rect.color)
  return DEFAULT_COLOR.clone()
}

export function InteractiveGraphics3d({
  graphics,
}: {
  graphics: GraphicsObject
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rectMeshesRef = useRef<
    Array<{
      rect: Rect3d
      mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>
    }>
  >([])
  const animationFrameRef = useRef<number | null>(null)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null)
  const [sliceEnabled, setSliceEnabled] = useState(false)
  const [sliceZ, setSliceZ] = useState(() => {
    const firstRect = graphics.rects3d?.[0]
    return firstRect ? firstRect.center.z : 0
  })
  const [fadeDepth, setFadeDepth] = useState(40)

  const rects = useMemo(() => graphics.rects3d ?? [], [graphics.rects3d])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 600
    const height = container.clientHeight || 400

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f4f4f4")

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000)
    camera.position.set(0, 0, 250)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enablePan = true

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(150, 200, 250)
    scene.add(directionalLight)

    cameraRef.current = camera
    rendererRef.current = renderer

    rectMeshesRef.current = []

    if (rects.length > 0) {
      const group = new THREE.Group()
      const boundingBox = new THREE.Box3()

      for (const rect of rects) {
        const geometry = new THREE.BoxGeometry(
          rect.width,
          rect.height,
          rect.depth,
        )
        const material = new THREE.MeshStandardMaterial({
          color: getRectColor(rect),
          transparent: true,
          opacity: 1,
          depthWrite: true,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(rect.center.x, rect.center.y, rect.center.z)
        mesh.userData = { rect }
        group.add(mesh)
        rectMeshesRef.current.push({ rect, mesh })
        boundingBox.expandByObject(mesh)
      }

      scene.add(group)

      if (!boundingBox.isEmpty()) {
        const center = new THREE.Vector3()
        boundingBox.getCenter(center)
        controls.target.copy(center)
        controls.update()

        const size = new THREE.Vector3()
        boundingBox.getSize(size)
        const maxSize = Math.max(size.x, size.y, size.z)
        const distance = maxSize * 2.5
        camera.position.set(
          center.x + distance,
          center.y + distance,
          center.z + distance,
        )
        camera.lookAt(center)
      }
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const handlePointerMove = (event: PointerEvent) => {
      if (!rendererRef.current || !cameraRef.current) return

      const bounds = rendererRef.current.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)

      raycaster.setFromCamera(pointer, cameraRef.current)
      const meshes = rectMeshesRef.current.map(({ mesh }) => mesh)
      const intersects = raycaster.intersectObjects(meshes)

      if (intersects.length > 0) {
        const rect: Rect3d | undefined = intersects[0].object.userData.rect
        if (rect?.label) {
          setHoverInfo({
            label: rect.label,
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          })
        } else {
          setHoverInfo(null)
        }
      } else {
        setHoverInfo(null)
      }
    }

    const handlePointerLeave = () => {
      setHoverInfo(null)
    }

    renderer.domElement.addEventListener("pointermove", handlePointerMove)
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave)

    const resizeObserver = new ResizeObserver((entries) => {
      if (!rendererRef.current || !cameraRef.current) return
      for (const entry of entries) {
        if (entry.target !== container) continue
        const newWidth = entry.contentRect.width
        const newHeight = entry.contentRect.height
        rendererRef.current.setSize(newWidth, newHeight)
        cameraRef.current.aspect = newWidth / newHeight
        cameraRef.current.updateProjectionMatrix()
      }
    })

    resizeObserver.observe(container)

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      resizeObserver.disconnect()

      renderer.domElement.removeEventListener("pointermove", handlePointerMove)
      renderer.domElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      )

      for (const { mesh } of rectMeshesRef.current) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
      rectMeshesRef.current = []

      controls.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [rects])

  useEffect(() => {
    for (const { rect, mesh } of rectMeshesRef.current) {
      const material = mesh.material
      if (!("opacity" in material)) continue
      const boxMaterial = material as THREE.MeshStandardMaterial

      if (!sliceEnabled) {
        boxMaterial.opacity = 1
        boxMaterial.transparent = false
        boxMaterial.depthWrite = true
        continue
      }

      const halfDepth = rect.depth / 2
      const minZ = rect.center.z - halfDepth
      const maxZ = rect.center.z + halfDepth

      let opacity = 1

      if (sliceZ < minZ || sliceZ > maxZ) {
        const distanceToMin = Math.abs(sliceZ - minZ)
        const distanceToMax = Math.abs(sliceZ - maxZ)
        const distance = Math.min(distanceToMin, distanceToMax)
        const depth = Math.max(fadeDepth, 0.0001)
        const ratio = Math.min(distance / depth, 1)
        opacity = Math.max(0, 1 - ratio)
      }

      boxMaterial.opacity = opacity
      boxMaterial.transparent = opacity < 1
      boxMaterial.depthWrite = opacity === 1
    }
  }, [sliceEnabled, sliceZ, fadeDepth])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        background: "#f4f4f4",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          zIndex: 2,
          padding: "8px 12px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "6px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={sliceEnabled}
            onChange={(event) => setSliceEnabled(event.target.checked)}
          />
          Slice
        </label>
        {sliceEnabled ? (
          <>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              sliceZ
              <input
                type="number"
                value={sliceZ}
                onChange={(event) => setSliceZ(Number(event.target.value))}
                style={{ width: 80 }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              fadeDepth
              <input
                type="number"
                min={0}
                value={fadeDepth}
                onChange={(event) =>
                  setFadeDepth(Math.max(0, Number(event.target.value)))
                }
                style={{ width: 80 }}
              />
            </label>
          </>
        ) : null}
      </div>

      {hoverInfo ? (
        <div
          style={{
            position: "absolute",
            left: hoverInfo.x,
            top: hoverInfo.y,
            transform: "translate(8px, 8px)",
            padding: "6px 10px",
            background: "rgba(0, 0, 0, 0.75)",
            color: "#fff",
            borderRadius: "4px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 3,
            fontFamily: "system-ui, sans-serif",
            fontSize: 12,
          }}
        >
          {hoverInfo.label}
        </div>
      ) : null}
    </div>
  )
}
