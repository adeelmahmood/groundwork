export class AiReceptionistClient {
    private baseUrl: string = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000";

    constructor() {}

    async reply(input: string, history: string[], business: any, promptConfig: any) {
        const { business_prompts, business_settings, ...b } = business;

        const response = await fetch(`${this.baseUrl}/api/ai-receptionist`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input,
                history,
                business: b,
                promptConfig,
            }),
        });

        const data = await response.json();

        if (response.status !== 200) {
            console.log(`error in calling ai receptionist ${data.error}`);
            throw new Error(`error in calling ai receptionist ${data.error}`);
        }

        // return the AI response
        return data.response;
    }
}
