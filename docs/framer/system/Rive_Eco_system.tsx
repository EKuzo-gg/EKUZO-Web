// Path: Rive_Animation/Eco_system.tsx
// Code file ID: Xdh5h_y
// Used on: Home page (desktop ecosystem section)
// Rive file: ekuso_creative_web__brand__ecosystem_desktop_V02riv.riv
// Artboard: "Main - Desktop" | State Machine: "State Machine 1" | Input: "ScrollProgressIllo"
// SCROLL_PX_FOR_FULL_PROGRESS = 10000 | PROGRESS_MAX = 1000 | START_DELAY_PX = 650

import React, { useEffect, useRef, useState } from "react"
import rive from "@rive-app/react-canvas"
import { useInView } from "react-intersection-observer"
import { useScroll, useMotionValueEvent } from "framer-motion"

const RIVE_URL =
    "https://ucarecdn.com/bd3c483c-3091-435f-95fc-a3000425b676/ekuso_creative_web__brand__ecosystem_desktop_V02riv.riv"
const IMAGE_PLACEHOLDER =
    "https://ucarecdn.com/2a1f2380-75f3-4948-8fda-e8abc808e1ca/GenericPlaceholder.png"

const ART_BOARD = "Main - Desktop"
const STATE_MACHINE_NAME = "State Machine 1"
const INPUT_NAME = "ScrollProgressIllo"
const DEBUG = false

const PROGRESS_MAX = 1000
const SCROLL_PX_FOR_FULL_PROGRESS = 10000
const PROGRESS_PER_PX = PROGRESS_MAX / SCROLL_PX_FOR_FULL_PROGRESS

const START_DELAY_PX = 650

export default function HomeDesktop() {
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    const [sectionRef, isInView] = useInView({
        triggerOnce: false,
        threshold: 0.2,
    })

    const { scrollY } = useScroll()

    const { RiveComponent, rive: riveInstance } = rive.useRive({
        src: RIVE_URL,
        artboard: ART_BOARD,
        stateMachines: STATE_MACHINE_NAME,
        autoplay: false,
        enablePointerEvents: true,
        shouldDisableRiveListeners: false as any,
    } as any)

    const scrollInput = rive.useStateMachineInput(
        riveInstance,
        STATE_MACHINE_NAME,
        INPUT_NAME,
        0
    )

    const [progress, setProgress] = useState(0)
    const progressRef = useRef(0)

    const lastYRef = useRef<number | null>(null)
    const inViewRef = useRef(false)

    const enteredScrollYRef = useRef<number | null>(null)

    useEffect(() => {
        inViewRef.current = isInView
    }, [isInView])

    useEffect(() => {
        if (!riveInstance) return
        if (isInView) riveInstance.play()
        else riveInstance.pause()
    }, [riveInstance, isInView])

    useEffect(() => {
        if (!scrollInput) return

        if (isInView) {
            progressRef.current = 0
            setProgress(0)
            scrollInput.value = 0

            const y = scrollY.get()
            lastYRef.current = y
            enteredScrollYRef.current = y
        } else {
            lastYRef.current = null
            enteredScrollYRef.current = null
        }
    }, [isInView, scrollInput, scrollY])

    useMotionValueEvent(scrollY, "change", (latestY) => {
        if (!inViewRef.current) return

        const lastY = lastYRef.current
        lastYRef.current = latestY
        if (lastY === null) return

        const enteredY = enteredScrollYRef.current
        if (enteredY === null) return

        const scrolledSinceEnter = Math.abs(latestY - enteredY)
        if (scrolledSinceEnter < START_DELAY_PX) {
            if (progressRef.current !== 0) {
                progressRef.current = 0
                setProgress(0)
            }
            return
        }

        const delta = latestY - lastY

        let next = progressRef.current + delta * PROGRESS_PER_PX
        next = Math.max(0, Math.min(PROGRESS_MAX, next))

        if (next !== progressRef.current) {
            progressRef.current = next
            setProgress(next)
        }
    })

    useEffect(() => {
        if (!scrollInput) return
        scrollInput.value = progress
    }, [progress, scrollInput])

    useEffect(() => {
        if (!riveInstance) return
        const wrapper = wrapperRef.current
        if (!wrapper) return

        const canvas = wrapper.querySelector("canvas") as HTMLCanvasElement | null
        if (!canvas) return

        const rectToCanvasXY = (touch: Touch) => {
            const rect = canvas.getBoundingClientRect()
            const cssX = touch.clientX - rect.left
            const cssY = touch.clientY - rect.top
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            return { x: cssX * scaleX, y: cssY * scaleY }
        }

        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches?.length) return
            const { x, y } = rectToCanvasXY(e.touches[0])
            ;(riveInstance as any).pointerDown?.(x, y)
        }

        const onTouchMove = (e: TouchEvent) => {
            if (!e.touches?.length) return
            const { x, y } = rectToCanvasXY(e.touches[0])
            ;(riveInstance as any).pointerMove?.(x, y)
        }

        const onTouchEnd = (e: TouchEvent) => {
            const t = e.changedTouches?.[0]
            if (!t) return
            const { x, y } = rectToCanvasXY(t)
            ;(riveInstance as any).pointerUp?.(x, y)
        }

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
        <section
            ref={sectionRef}
            style={{
                textAlign: "center",
                width: "100%",
                height: "100vh",
                position: "relative",
                touchAction: "pan-y",
            }}
        >
            <div ref={wrapperRef} style={{ width: "100%", height: "100%" }}>
                <RiveComponent style={{ width: "100%", height: "100%" }} />
            </div>

            {!isInView && (
                <img
                    src={IMAGE_PLACEHOLDER}
                    alt="Placeholder"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
            )}
        </section>
    )
}
