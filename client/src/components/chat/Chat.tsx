import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Container, Form } from "react-bootstrap";

function Chat() {
    const [messages, setMessages] = useState<
        Array<{
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
                setMessages((prev) => [message, ...prev]);
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
        const message = {
            message: typingMessage,
            event: "message",
        };
        socket.send(JSON.stringify(message));
    };

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
                {messages.map((message, i) => (
                    <div key={i}>{message.message}</div>
                ))}
            </Container>
        </Container>
    );
}

export default Chat;
