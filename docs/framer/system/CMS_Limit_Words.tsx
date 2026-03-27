// Path: CMS/CMS_Limit_Words.tsx
// Code file ID: LH7jPb8
// Type: Code Override
// Purpose: Truncates CMS text fields to 33 characters with ellipsis.
//          Applied to blog card titles/descriptions in the CMS-driven blog section.

import { forwardRef, type ComponentType } from "react"

export function withCharLimit(Component): ComponentType {
    return forwardRef((props, ref) => {
        const maxChars = 33 // ← change this number to your desired limit
        const originalText = props.text || ""

        const limitedText =
            originalText.length > maxChars
                ? originalText.slice(0, maxChars) + "…"
                : originalText

        return <Component ref={ref} {...props} text={limitedText} />
    })
}
