import { SimpleChatMessage } from "@/app/types";

export class AiLeadsClient {
    private baseUrl: string = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000";

    private internalCall = false;

    constructor(_internalCall: boolean = false) {
        this.internalCall = _internalCall;
    }

    async generate(history: SimpleChatMessage[], promptConfig: any) {
        const response = await fetch(`${!this.internalCall ? this.baseUrl : ""}/api/ai-leads-gen`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history,
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
