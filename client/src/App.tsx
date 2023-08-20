import { Container, Row } from "react-bootstrap";
import Chat from "./components/chat/Chat";
import TagPanel from "./components/tagPanel/TagPanel";
import { useEffect, useState } from "react";
import { Api, ITag } from "./api/api";

function App() {
    const [activeTags, setActiveTags] = useState<Array<number>>([]);
    const [tags, setTags] = useState<Array<ITag>>([]);

    const getTags = async () => {
        try {
            const data = await Api.getTags();
            setTags(data);
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    useEffect(() => {
        getTags();
    }, []);

    return (
        <Container className="vh-100">
            <Row className="vh-100">
                <TagPanel setActiveTags={setActiveTags} tags={tags} setTags={setTags} />
                <Chat activeTags={activeTags} tags={tags} setTags={setTags} />
            </Row>
        </Container>
    );
}

export default App;
