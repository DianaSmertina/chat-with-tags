import {
    Dispatch,
    FormEvent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Api, ITag } from "../../api/api";
import { Typeahead } from "react-bootstrap-typeahead";
import { Option } from "react-bootstrap-typeahead/types/types";

interface IChatProps {
    activeTags: Array<number>;
    tags: Array<ITag>;
    setTags: Dispatch<SetStateAction<Array<ITag>>>;
}

interface IChatMessage {
    id: number;
    message: string;
    event: string;
    tags?: Array<{
        tag_id: number | null;
        tag: string | null;
    }>;
}

function Chat({ activeTags, tags, setTags }: IChatProps) {
    const [messages, setMessages] = useState<Array<IChatMessage>>([]);
    const [typingMessage, setTypingMessage] = useState("");
    const [selectedTags, setSelectedTags] = useState<Array<Option>>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

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
        const messageInfo = await addMessageInBd();
        const messageId = messageInfo?.messageID;
        const message = {
            id: messageId,
            message: typingMessage,
            event: "message",
        };
        socket.send(JSON.stringify(message));
        setTypingMessage("");
        if (messageInfo?.newTags.length && messageInfo?.newTags.length > 0) {
            setTags((prev) => [...prev, ...messageInfo.newTags])
        }
        setSelectedTags([]);
    };

    const getMessages = useCallback(async () => {
        try {
            const queryParams = new URLSearchParams({
                tagIds: activeTags.join(","),
            });
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
        const tags = (selectedTags as Array<ITag>).map((el: ITag) => el.tag);
        try {
            const data = await Api.addMessage({
                message: typingMessage,
                tags: tags,
            });
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    useEffect(() => {
        getMessages();
    }, [getMessages]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <Col md={9} className="border p-3">
            <Container className="d-flex flex-column justify-content-between h-100">
                <Container
                    ref={containerRef}
                    className="h-100"
                    style={{ overflowY: "scroll", maxHeight: "90vh" }}
                >
                    <Row>
                        {messages.map((message) => (
                            <Row
                                key={`message${message.id}`}
                                style={{ borderRadius: "5px" }}
                                className="bg-light mb-2 mx-0"
                            >
                                <Row>
                                    {message.tags?.map((tag) => (
                                        <Col
                                            key={`tag${tag.tag_id}`}
                                            style={{ borderRadius: "5px" }}
                                            md={2}
                                            className="bg-warning m-1 text-center"
                                        >
                                            {tag.tag}
                                        </Col>
                                    ))}
                                </Row>
                                <Row>{message.message}</Row>
                            </Row>
                        ))}
                    </Row>
                </Container>
                <Container fluid className="h-50">
                    <Row className="h-100">
                        <Form onSubmit={(e) => sendMessage(e)} className="flex">
                            <Form.Control
                                as="textarea"
                                placeholder="Enter message"
                                value={typingMessage}
                                onChange={(e) =>
                                    setTypingMessage(e.target.value)
                                }
                                className="my-2"
                                style={{ height: "50%" }}
                            ></Form.Control>
                            <Form.Group className="d-flex w-100">
                                <Typeahead
                                    id="basic-typeahead-multiple"
                                    labelKey="tag"
                                    multiple
                                    onChange={setSelectedTags}
                                    options={tags}
                                    placeholder="Add tags"
                                    selected={selectedTags}
                                    dropup={true}
                                    allowNew={true}
                                    newSelectionPrefix="Add new: "
                                    style={{ width: "90%" }}
                                />
                                <Button
                                    type="submit"
                                    variant="primary"
                                    value="Send"
                                    className="mr-2"
                                >
                                    Send
                                </Button>
                            </Form.Group>
                        </Form>
                    </Row>
                </Container>
            </Container>
        </Col>
    );
}

export default Chat;
