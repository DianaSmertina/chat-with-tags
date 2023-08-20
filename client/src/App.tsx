import { Container, Row } from "react-bootstrap";
import Chat from "./components/chat/Chat";
import TagPanel from "./components/tagPanel/TagPanel";
import { useState } from "react";

function App() {
    const [activeTags, setActiveTags] = useState<Array<number>>([]);

    return (
        <Container>
            <Row>
                <TagPanel setActiveTags={setActiveTags} />
                <Chat activeTags={activeTags} />
            </Row>
        </Container>
    );
}

export default App;
