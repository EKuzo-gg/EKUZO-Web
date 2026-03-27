import { useEffect } from "react"
import type { Override } from "framer"

export function ResetModalScrollTop(): Override {
    useEffect(() => {
        const el = document.querySelector('[data-framer-name="ModalScroll"]')

        if (!(el instanceof HTMLElement)) return

        const goTop = () => {
            el.scrollTop = 0
        }

        goTop()
        requestAnimationFrame(goTop)
        setTimeout(goTop, 50)
    }, [])

    return {}
}
