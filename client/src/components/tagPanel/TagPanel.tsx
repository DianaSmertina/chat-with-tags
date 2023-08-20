import { Dispatch, SetStateAction } from "react";
import { Button, Col } from "react-bootstrap";
import { ITag } from "../../api/api";

interface ITagPanelProps {
    setActiveTags:  Dispatch<SetStateAction<Array<number>>>;
    tags: Array<ITag>;
    setTags: Dispatch<SetStateAction<Array<ITag>>>;
}

function TagPanel({ setActiveTags, tags, setTags }: ITagPanelProps) {
    const tagClickHandler = (id: number) => {
        setTags((prev) => {
            return prev.map((tag) => {
                if (tag.tag_id === id) {
                    let newStyle: string;
                    if (tag.buttonStyle === "secondary") {
                        newStyle = "primary";
                        setActiveTags((prev) => [...prev, id]);
                    } else {
                        newStyle = "secondary";
                        setActiveTags((prev) => prev.filter((el) => el !== id));
                    }
                    return {
                        ...tag,
                        buttonStyle: newStyle
                    };
                }
                return tag;
            });
        });
    };

    return (
        <Col md={3} className="border p-3">
            {tags.map((tag) => (
                <Button
                    key={tag.tag_id}
                    className="m-1"
                    variant={tag.buttonStyle}
                    onClick={() => tagClickHandler(tag.tag_id)}
                >
                    {tag.tag}
                </Button>
            ))}
        </Col>
    );
}

export default TagPanel;
