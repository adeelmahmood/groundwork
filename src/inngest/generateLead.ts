import { AiLeadsHandler } from "@/modules/ai/leads-handler";
import { inngest } from "./client";

export const generateLead = inngest.createFunction(
    { name: "Generate Lead" },
    { event: "generate/lead" },
    async ({ event, step }) => {
        console.log("generate/lead event invoked");
        console.log(event);

        const leadsHandler = new AiLeadsHandler();

        const { fromPhone, toPhone } = event.data;

        console.log("attempting to generate lead");
        const saved = await leadsHandler.generateLead(fromPhone, toPhone);
        console.log("lead generated", saved);
    }
);
