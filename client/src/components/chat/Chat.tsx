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
import { Api, ITag, IMessage } from "../../api/api";
import { Typeahead } from "react-bootstrap-typeahead";
import { Option } from "react-bootstrap-typeahead/types/types";
import "./chat.css";

interface IChatProps {
    activeTags: Array<number>;
    tags: Array<ITag>;
    setTags: Dispatch<SetStateAction<Array<ITag>>>;
}

function Chat({ activeTags, tags, setTags }: IChatProps) {
    const [messages, setMessages] = useState<Array<IMessage>>([]);
    const [typingMessage, setTypingMessage] = useState("");
    const [selectedTags, setSelectedTags] = useState<Array<Option>>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const socket = useMemo(() => new WebSocket("wss://chat-with-tags.onrender.com"), []);

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
            message_id: messageId,
            text: typingMessage,
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
            setMessages(data);
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
                    className="scroll"
                >
                    <Row>
                        {messages.map((message) => (
                            <Row
                                key={`message${message.message_id}`}
                                className="bg-light mb-3 mx-0 round"
                            >
                                <Row>
                                    {message.tags?.map((tag) => (
                                        <Col
                                            key={`tag${tag.tag_id}`}
                                            md={2}
                                            className="bg-primary text-white m-1 text-center round"
                                        >
                                            {tag.tag}
                                        </Col>
                                    ))}
                                </Row>
                                <Row className="d-flex px-3 pb-2">{message.text}</Row>
                            </Row>
                        ))}
                    </Row>
                </Container>
                <Container fluid className="h-40 my-3 p-0">
                    <Row className="h-100">
                        <Form onSubmit={(e) => sendMessage(e)} className="flex">
                            <Form.Control
                                as="textarea"
                                placeholder="Enter message"
                                value={typingMessage}
                                onChange={(e) =>
                                    setTypingMessage(e.target.value)
                                }
                                className="my-2 h-50"
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
                                    className="w-100"
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
