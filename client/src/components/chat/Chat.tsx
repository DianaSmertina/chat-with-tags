import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { Api } from "../../api/api";

interface IChatProps {
    activeTags:  Array<number>;
}

function Chat({activeTags}: IChatProps) {
    const [messages, setMessages] = useState<
        Array<{
            id: number;
            message: string;
            event: string;
            tags?: Array <{
                tag_id: number | null;
                tag: string | null;
            }>
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

    const getMessages = useCallback(async () => {
        try {
            const queryParams = new URLSearchParams({ tagIds: activeTags.join(',') });
            const data = await Api.getMessages(queryParams);
            setMessages(
                data.map((message) => {
                    return {
                        id: message.message_id,
                        message: message.text,
                        tags: message.tags,
                        event: "message",
                    };
                })
            );
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }, [activeTags]);

    const addMessageInBd = async () => {
        try {
            const data = await Api.addMessage({
                message: typingMessage,
                tags: [],
            });
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getMessages();
    }, [getMessages]);

    return (
        <Col md={8} className="border p-3">
            <Row>
                {messages.map((message) => (
                    <div key={message.id}>{message.message}</div>
                ))}
            </Row>
            <Row>
                <Form
                    onSubmit={(e) => sendMessage(e)}
                    className="d-flex align-items-center justify-content-center gap-3"
                >
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
            </Row>
        </Col>
    );
}

export default Chat;
