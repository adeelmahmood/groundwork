import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain";
import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";

export async function POST(req: Request) {
    const { conversation, promptConfig } = await req.json();
    console.log({ conversation, promptConfig });

    try {
        const parser = StructuredOutputParser.fromNamesAndDescriptions({
            name: "Name of the customer",
            jobDetails: "Any details about the job/project",
            timing: "Any timing information that the customer mentioned towards the start or completion of the project",
            address: "Address of the job site",
            email: "Email of the customer",
            availability: "Customer availability for an appointment",
        });

        const formatInstructions = parser.getFormatInstructions();

        const prompt = new PromptTemplate({
            template: promptConfig.prompt,
            inputVariables: ["conversation"],
            partialVariables: { format_instructions: formatInstructions },
        });
        const input = await prompt.format({ conversation: conversation.join("\n") });
        console.log(input);

        const llm = new OpenAI({ temperature: promptConfig.temperature });
        const response = await llm.call(input);
        const json = JSON.parse(response);
        console.log(">> response", response);
        console.log(">> json", json);

        return new Response(JSON.stringify({ response: json }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const runtime = "edge";
