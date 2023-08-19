import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { Api } from "../../api/api";

function Chat() {
    const [messages, setMessages] = useState<
        Array<{
            id: number;
            message: string;
            event: string;
        }>
    >([]);
    const [typingMessage, setTypingMessage] = useState("");

    const socket = useMemo(() => new WebSocket("ws://localhost:5000"), []);

    useEffect(() => {
        socket.onopen = () => {};
        socket.onmessage = (event: MessageEvent) => {
            const blob = event.data;
            const reader = new FileReader();
            reader.onload = function () {
                const text = reader.result as string;
                const message = JSON.parse(text);
                setMessages((prev) => [...prev, message]);
            };
            reader.readAsText(blob);
        };
        socket.onclose = () => {
            console.log("Socket was closed");
        };
        socket.onerror = () => {
            console.log("Socket error ocurred");
        };
    }, [socket]);

    const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const messageId = await addMessageInBd();
        const message = {
            id: messageId,
            message: typingMessage,
            event: "message",
        };
        socket.send(JSON.stringify(message));
        setTypingMessage("");
    };

    const getMessages = async () => {
        try {
            const data = await Api.getMessages();
            setMessages(
                data.map((message) => {
                    return {
                        id: message.message_id,
                        message: message.text,
                        event: "message",
                    };
                })
            );
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const addMessageInBd = async () => {
        try {
            const data = await Api.addMessage({
                message: typingMessage,
                tags: ["tag1", "tag9"],
            });
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getMessages();
    }, []);

    return (
        <Container>
            <Form onSubmit={(e) => sendMessage(e)}>
                <Form.Control
                    placeholder="Enter message"
                    value={typingMessage}
                    onChange={(e) => setTypingMessage(e.target.value)}
                ></Form.Control>
                <Button
                    type="submit"
                    variant="primary"
                    value="Send"
                    className="mr-2"
                >
                    Send
                </Button>
            </Form>
            <Container>
                {messages.map((message) => (
                    <div key={message.id}>{message.message}</div>
                ))}
            </Container>
        </Container>
    );
}

export default Chat;
