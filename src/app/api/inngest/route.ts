import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions";
import { crawler } from "@/inngest/crawlFunction";
import { respondToSms } from "@/inngest/respondToSms";
import { generateLead } from "@/inngest/generateLead";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve(inngest, [
    /* your functions will be passed here later! */
    helloWorld,
    crawler,
    respondToSms,
    generateLead,
]);
