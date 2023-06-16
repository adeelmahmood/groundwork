import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions";
import { crawler } from "@/inngest/crawlFunction";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve(inngest, [
    helloWorld,
    crawler /* your functions will be passed here later! */,
]);
