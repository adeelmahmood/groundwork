export class AiLeadsClient {
    private baseUrl: string =
        process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
            ? "https://" + (process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL)
            : "http://localhost:3000";

    constructor() {}

    async generate(conversation: string[], promptConfig: any) {
        const response = await fetch(`${this.baseUrl}/api/ai-leads-gen`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversation,
                promptConfig,
            }),
        });

        const data = await response.json();

        if (response.status !== 200) {
            console.log(`error in calling ai leads gen ${data.error}`);
            throw new Error(`error in calling ai leads gen ${data.error}`);
        }

        // return the AI response
        return data.response;
    }
}
