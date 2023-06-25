export class TwilioClient {
    private twilio: any;

    constructor() {
        this.twilio = require("twilio")(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendMessage(from: string, to: string, message: string) {
        const sent = await this.twilio.messages.create({
            body: message,
            from: from,
            to: to,
        });

        return sent;
    }
}
