export class TwilioClient {
    private twilio: any;

    constructor() {
        this.twilio = require("twilio")(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendMessage(from: string, to: string, message: string) {
        try {
            const sent = await this.twilio.messages.create({
                body: message,
                from: from,
                to: to,
            });

            return sent;
        } catch (e: any) {
            console.log(`error in sending message by twilio client ${e.message}`);
            throw new Error(`error in sending message by twilio client ${e.message}`);
        }
    }
}
