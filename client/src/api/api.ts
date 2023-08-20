interface IMessage {
    message_id: number;
    text: string;
    date: string;
    tags?: Array<{tag_id: number | null; tag: string | null}>
}

export interface ITag {
    tag_id: number;
    tag: string;
    buttonStyle?: string;
}

export class Api {
    private static base = "http://localhost:5000/api";

    static async getMessages(queryParams: URLSearchParams): Promise<Array<IMessage>> {
        const response = await fetch(`${Api.base}/messages?${queryParams}`);
        const data = await response.json();
        return data;
    }
    
    static async addMessage(data: {
        message: string;
        tags: Array<string>;
    }): Promise<{
        messageID: number;
        newTags: Array<ITag>;
    }> {
        const response = await fetch(`${Api.base}/messages`, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }

    static async getTags(): Promise<Array<ITag>> {
        const response = await fetch(`${Api.base}/tags`);
        const data = await response.json();
        data.forEach((el: ITag) => {
            el.buttonStyle = "secondary"
        });
        return data;
    }
}
