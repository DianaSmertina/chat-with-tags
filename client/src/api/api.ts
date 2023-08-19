interface IMessage {
    message_id: number;
    text: string;
    date: string;
}

export class Api {
    private static base = "http://localhost:5000/api";

    static async getMessages(): Promise<Array<IMessage>> {
        const response = await fetch(`${Api.base}/messages`);
        const data = await response.json();
        return data;
    }

    static async addMessage(data: {
        message: string;
        tags: Array<string>;
    }): Promise<number> {
        const response = await fetch(`${Api.base}/messages`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}
