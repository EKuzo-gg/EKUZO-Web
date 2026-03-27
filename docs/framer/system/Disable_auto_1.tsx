import { useEffect } from "react"
import type { Override } from "framer"

function resetScroll(name: string) {
    useEffect(() => {
        const el = document.querySelector(`[data-framer-name="${name}"]`)

        if (!(el instanceof HTMLElement)) return

        const goTop = () => {
            el.scrollTop = 0
        }

        goTop()
        requestAnimationFrame(goTop)
        setTimeout(goTop, 50)
    }, [])
}

/* Modal 1 */
export function ResetModalScrollTop(): Override {
    resetScroll("ModalScroll")
    return {}
}

/* Modal 2 */
export function ResetModalScrollTop2(): Override {
    resetScroll("ModalScroll2")
    return {}
}
