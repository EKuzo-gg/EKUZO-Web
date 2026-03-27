// Path: Rive_Animation/Home_Schools_Mobile.tsx
// Code file ID: mpHBfzw
// Used on: Programs/Parents/Schools pages (mobile) — same logic as Eco_system_Mobile.tsx
// Rive file: ekuso_creative_web__brand__ecosystem_mobileriv.riv
// Artboard: "Main - Mobile" | State Machine: "State Machine 1" | Input: "ScrollProgressIllo"
// Scroll progress: 0–500 (rawProgress * 500), based on .get-actions-scroll-container element
// triggerOnce: true

import React, { useEffect, useRef, useState } from "react"
import rive from "@rive-app/react-canvas"
import { useInView } from "react-intersection-observer"
import { useScroll, useMotionValueEvent } from "framer-motion"

const RIVE_URL =
    "https://ucarecdn.com/225a3e68-12b9-41bc-ab0b-0c5ec40bd732/ekuso_creative_web__brand__ecosystem_mobileriv.riv"
const IMAGE_PLACEHOLDER =
    "https://ucarecdn.com/2a1f2380-75f3-4948-8fda-e8abc808e1ca/GenericPlaceholder.png"

const ART_BOARD = "Main - Mobile"
const STATE_MACHINE_NAME = "State Machine 1"
const INPUT_NAME = "ScrollProgressIllo"
const DEBUG = false

export default function HomeMobile() {
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const [sectionRef, isInView] = useInView({ triggerOnce: true, threshold: 0.2 })

    const { RiveComponent, rive: riveInstance } = rive.useRive({
        src: RIVE_URL,
        autoplay: true,
        stateMachines: STATE_MACHINE_NAME,
        artboard: ART_BOARD,
        enablePointerEvents: true,
        shouldDisableRiveListeners: false as any,
    } as any)

    const scrollPctInput = rive.useStateMachineInput(riveInstance, STATE_MACHINE_NAME, INPUT_NAME, 0)

    const [containerEl, setContainerEl] = useState<HTMLElement | null>(null)
    useEffect(() => {
        const el = document.querySelector(".get-actions-scroll-container") as HTMLElement | null
        setContainerEl(el)
    }, [])

    const { scrollY } = useScroll()
    const [scrollPct, setScrollPct] = useState(0)

    useMotionValueEvent(scrollY, "change", (latestY) => {
        if (!containerEl) return
        const top = containerEl.offsetTop
        const height = containerEl.offsetHeight
        const windowH = window.innerHeight
        const start = top - windowH
        const end = top + height - windowH
        let rawProgress = (latestY - start) / (end - start)
        rawProgress = Math.max(0, Math.min(1, rawProgress))
        setScrollPct(rawProgress * 500)
    })

    useEffect(() => { if (scrollPctInput) scrollPctInput.value = scrollPct }, [scrollPct, scrollPctInput])

    useEffect(() => {
        if (!riveInstance) return
        const wrapper = wrapperRef.current
        if (!wrapper) return
        const canvas = wrapper.querySelector("canvas") as HTMLCanvasElement | null
        if (!canvas) return

        const toCanvasXY = (touch: Touch) => {
            const rect = canvas.getBoundingClientRect()
            const cssX = touch.clientX - rect.left
            const cssY = touch.clientY - rect.top
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            return { x: cssX * scaleX, y: cssY * scaleY }
        }

        const onTouchStart = (e: TouchEvent) => { if (!e.touches?.length) return; const { x, y } = toCanvasXY(e.touches[0]); (riveInstance as any).pointerDown?.(x, y) }
        const onTouchMove = (e: TouchEvent) => { if (!e.touches?.length) return; const { x, y } = toCanvasXY(e.touches[0]); (riveInstance as any).pointerMove?.(x, y) }
        const onTouchEnd = (e: TouchEvent) => { const t = e.changedTouches?.[0]; if (!t) return; const { x, y } = toCanvasXY(t); (riveInstance as any).pointerUp?.(x, y) }

        canvas.addEventListener("touchstart", onTouchStart, { passive: true })
        canvas.addEventListener("touchmove", onTouchMove, { passive: true })
        canvas.addEventListener("touchend", onTouchEnd, { passive: true })
        canvas.addEventListener("touchcancel", onTouchEnd, { passive: true })

        return () => {
            canvas.removeEventListener("touchstart", onTouchStart as any)
            canvas.removeEventListener("touchmove", onTouchMove as any)
            canvas.removeEventListener("touchend", onTouchEnd as any)
            canvas.removeEventListener("touchcancel", onTouchEnd as any)
        }
    }, [riveInstance])

    return (
        <section ref={sectionRef} style={{ textAlign: "center", width: "100%", height: "100vh", position: "relative", touchAction: "pan-y" }}>
            {isInView ? (
                <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
                    <RiveComponent style={{ width: "100%", height: "100%", pointerEvents: "auto" }} />
                </div>
            ) : (
                <img src={IMAGE_PLACEHOLDER} alt="Placeholder" style={{ width: "100%", height: "100%" }} />
            )}
        </section>
    )
}
