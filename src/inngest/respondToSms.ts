import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import { AiReceptionist } from "@/modules/ai/ai-receptionist";

export const respondToSms = inngest.createFunction(
    {
        name: "Respond to SMS",
        cancelOn: [
            {
                event: "sms/respond/cancel",
                if: "async.data.fromPhone == event.data.fromPhone && async.data.toPhone == event.data.toPhone",
            },
        ],
    },

    { event: "sms/respond" },

    async ({ event, step }) => {
        const aiReceptionist = new AiReceptionist();

        // incoming sms data
        const { fromPhone, toPhone, responseDelay } = event.data;
        console.log(">> RespondToSMS", fromPhone, toPhone, responseDelay);

        event.data.responseDelay > 0 && (await step.sleep(event.data.responseDelay + "s"));

        const aiMessage = await step.run("Generate AI response", async () => {
            console.log(">>> Now generating AI response...");

            try {
                return await aiReceptionist.generateResponse(fromPhone, toPhone);
            } catch (e) {
                throw new NonRetriableError("error in generating ai response", { cause: e });
            }
        });

        aiMessage &&
            (await step.run("Respond with AI message", async () => {
                console.log(">>> Now sending AI response...");
                console.log(aiMessage);

                try {
                    await aiReceptionist.sendResponse(fromPhone, toPhone, aiMessage);
                } catch (e) {
                    throw new NonRetriableError("error in sending ai response", { cause: e });
                }
            }));
    }
);
