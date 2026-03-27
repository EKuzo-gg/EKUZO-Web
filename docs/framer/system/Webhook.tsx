import { forwardRef, type ComponentType } from "react"

export function sendToMakeWebhook(
    Component: ComponentType<any>
): ComponentType<any> {
    return forwardRef((props: any, ref: any) => {
        const handleSubmit = async (e: any) => {
            e.preventDefault()

            const formEl = e.currentTarget as HTMLFormElement
            const formData = new FormData(formEl)

            const data: Record<string, any> = {}
            formData.forEach((value, key) => {
                if (data[key] !== undefined) {
                    data[key] = Array.isArray(data[key])
                        ? [...data[key], value]
                        : [data[key], value]
                } else {
                    data[key] = value
                }
            })

            data.pageUrl = window.location.href
            data.submittedAt = new Date().toISOString()

            try {
                const res = await fetch(
                    "https://hook.us2.make.com/xl4bb6oyilsj8cugl8dgal5446a1jfj3",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data),
                    }
                )

                if (!res.ok) throw new Error(`Webhook failed: ${res.status}`)

                formEl.reset()
            } catch (err) {
                console.error("Make webhook error:", err)
            }
        }

        return <Component {...props} ref={ref} onSubmit={handleSubmit} />
    })
}
