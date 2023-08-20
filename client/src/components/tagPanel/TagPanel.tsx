import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Button, Col } from "react-bootstrap";
import { Api, ITag } from "../../api/api";

interface ITagPanelProps {
    setActiveTags:  Dispatch<SetStateAction<Array<number>>>
}

function TagPanel({ setActiveTags }: ITagPanelProps) {
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
        <Col md={4} className="border p-3">
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
