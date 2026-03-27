// Path: Rive_Animation/Scroll_Section.tsx
// Code file ID: mvZUv8R
// Type: Code Override
// Purpose: Appends class "get-actions-scroll-container" to any wrapped component.
//          Used to mark the scroll container that mobile Rive animations use as their
//          scroll reference via document.querySelector(".get-actions-scroll-container")

import type { ComponentType } from "react"

export function withClass(Component): ComponentType {
    return (props) => {
        props.className += " get-actions-scroll-container" // Remember to add a space
        return <Component {...props} />
    }
}
