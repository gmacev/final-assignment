import React, { useCallback, useEffect, useState, useRef } from "react";
import { Editable, withReact, Slate, useSlate, ReactEditor } from "slate-react";
import { createEditor, Editor, Transforms, Path } from "slate";
import { withHistory } from "slate-history";
import "./style.css";
import "../button/style.css";
import imageExtensions from "image-extensions";
import isUrl from "is-url";

import {
    MdFormatBold,
    MdFormatItalic,
    MdFormatListNumbered,
    MdFormatUnderlined,
    MdOutlineFormatListBulleted,
} from "react-icons/md";
import { BiHeading } from "react-icons/bi";
import { ImImage } from "react-icons/im";
import { IoLogoYoutube } from "react-icons/io";

const RichEditor = ({ getValue, setValue }) => {
    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    const editorRef = useRef();

    if (!editorRef.current)
        editorRef.current = withHistory(withReact(createEditor()));

    const editor = editorRef.current;

    const [getBtnValue, setBtnValue] = useState([false, false]);
    const [getEditorEnabled, setEditorEnabled] = useState(false);

    useEffect(() => {
        if (!getValue) {
            editor.selection = {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 0 },
            };
        }
    }, [getValue]);

    const handleChange = (e) => {
        const index = Number(e.target.parentNode.children[0].value);

        const btnValues = [...getBtnValue];
        btnValues[index] = !btnValues[index];

        if (index === 3) {
            btnValues[4] = false;
            btnValues[5] = false;
        } else if (index === 4) {
            btnValues[3] = false;
            btnValues[5] = false;
        } else if (index === 5) {
            btnValues[3] = false;
            btnValues[4] = false;
        }
        setBtnValue(btnValues);
    };

    function textInput(val) {
        if (!getEditorEnabled) setEditorEnabled(true);
        setValue(val);
    }

    return (
        <div className="w-100">
            <div
                className="box p-3"
                style={{ minHeight: "350px" }}
            >
                <Slate
                    editor={editor}
                    value={getValue}
                    onChange={textInput}
                >
                    <Toolbar>
                        <div className="d-flex flex-wrap justify-content-center gap-2">
                            <MarkButton
                                format="bold"
                                value={0}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <MdFormatBold />
                            </MarkButton>
                            <MarkButton
                                format="italic"
                                value={1}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <MdFormatItalic />
                            </MarkButton>
                            <MarkButton
                                format="underline"
                                value={2}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <MdFormatUnderlined />
                            </MarkButton>
                            <BlockButton
                                format="heading-one"
                                value={3}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <BiHeading />
                            </BlockButton>
                            <BlockButton
                                format="numbered-list"
                                value={4}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <MdFormatListNumbered />
                            </BlockButton>
                            <BlockButton
                                format="bulleted-list"
                                value={5}
                                handleChange={handleChange}
                                getBtnValue={getBtnValue}
                                getEditorEnabled={getEditorEnabled}
                            >
                                <MdOutlineFormatListBulleted />
                            </BlockButton>
                            <InsertImageButton
                                getEditorEnabled={getEditorEnabled}
                                getBtnValue={getBtnValue}
                                setBtnValue={setBtnValue}
                            >
                                <ImImage />
                            </InsertImageButton>
                            <InsertYoutubeVideoButton
                                getEditorEnabled={getEditorEnabled}
                                getBtnValue={getBtnValue}
                                setBtnValue={setBtnValue}
                            >
                                <IoLogoYoutube />
                            </InsertYoutubeVideoButton>
                        </div>
                    </Toolbar>
                    <hr />
                    <div className="pl-1">
                        <Editable
                            id="textBox"
                            renderElement={renderElement}
                            renderLeaf={renderLeaf}
                            placeholder="..."
                            spellCheck
                            tabIndex="-1"
                            autoFocus
                        />
                    </div>
                </Slate>
            </div>
        </div>
    );
};

const isImageUrl = (url) => {
    if ((!url || !isUrl(url)) && !url.includes("data:image/")) return false;
    const ext = new URL(url).pathname.split(".").pop();
    return imageExtensions.includes(ext);
};

const insertImage = (editor, url, getBtnValue, setBtnValue) => {
    const { selection } = editor;
    const image = createImageNode("Image", url, editor);

    ReactEditor.focus(editor);

    if (!!selection) {
        const [parentNode, parentPath] = Editor.parent(
            editor,
            selection.focus?.path
        );

        if (editor.isVoid(parentNode)) {
            Transforms.insertNodes(editor, image, {
                at: Path.next(parentPath),
                select: true,
            });
        } else {
            Transforms.removeNodes(editor, { at: parentPath });
            Transforms.insertNodes(editor, image, {
                at: parentPath,
                select: true,
            });
            Transforms.insertNodes(editor, parentNode, { at: parentPath });
        }
    } else {
        Transforms.insertNodes(editor, image, { select: true });
    }

    const btnValues = [...getBtnValue];

    btnValues.forEach((val, index) => {
        btnValues[index] = false;
    });

    setBtnValue(btnValues);
};

const insertYoutubeVideo = (editor, url, getBtnValue, setBtnValue) => {
    if (!url) return;

    const { selection } = editor;
    const video = createYoutubeNode(url);

    ReactEditor.focus(editor);

    if (!!selection) {
        const [parentNode, parentPath] = Editor.parent(
            editor,
            selection.focus?.path
        );
        if (editor.isVoid(parentNode)) {
            Transforms.insertNodes(editor, video, {
                at: Path.next(parentPath),
                select: true,
            });
        } else {
            Transforms.removeNodes(editor, { at: parentPath });
            Transforms.insertNodes(editor, video, {
                at: parentPath,
                select: true,
            });
            Transforms.insertNodes(editor, parentNode, { at: parentPath });
        }
    } else {
        Transforms.insertNodes(editor, video, { select: true });
    }

    const btnValues = [...getBtnValue];

    btnValues.forEach((val, index) => {
        btnValues[index] = false;
    });

    setBtnValue(btnValues);
};

export const createImageNode = (alt, src) => ({
    type: "image",
    alt,
    src,
    children: [
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ],
});

export const createYoutubeNode = (src) => ({
    type: "youtube",
    src,
    children: [
        {
            type: "paragraph",
            children: [{ text: "" }],
        },
    ],
});

const ImageElement = ({ attributes, children, element }) => {
    return (
        <div {...attributes}>
            <div
                style={{ userSelect: "none" }}
                contentEditable={false}
            >
                <img
                    alt={element.alt}
                    src={element.src}
                    className="editor-image"
                    style={{
                        userSelect: "none",
                    }}
                />
            </div>
            {children}
        </div>
    );
};

const YoutubeElement = ({ attributes, children, element }) => {
    return (
        <div {...attributes}>
            <div
                style={{ userSelect: "none" }}
                contentEditable={false}
            >
                <iframe
                    allowFullScreen={true}
                    width="560"
                    height="315"
                    src={element.src}
                    title="YouTube video player"
                    className="youtube-video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style={{
                        userSelect: "none",
                    }}
                />
            </div>
            {children}
        </div>
    );
};

export const Element = (props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>;
        case "heading-one":
            return <h1 {...attributes}>{children}</h1>;
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "numbered-list":
            return <ol {...attributes}>{children}</ol>;
        case "image":
            return <ImageElement {...props} />;
        case "youtube":
            return <YoutubeElement {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

export const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const BlockButton = ({
    format,
    children,
    value,
    handleChange,
    getBtnValue,
    getEditorEnabled,
}) => {
    const editor = useSlate();

    return (
        <div className="mt-1">
            <button
                type={format}
                value={value}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, format);
                }}
                onClick={handleChange}
                style={{ lineHeight: 1 }}
                className={`button editor-button ${
                    getBtnValue[parseInt(value)] && "button-toggled"
                } ${!getEditorEnabled && "disabled"}`}
            >
                {children}
            </button>
        </div>
    );
};

const MarkButton = ({
    format,
    children,
    value,
    handleChange,
    getBtnValue,
    getEditorEnabled,
}) => {
    const editor = useSlate();
    return (
        <div className="mt-1">
            <button
                type={format}
                value={value}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, format);
                }}
                onClick={handleChange}
                style={{ lineHeight: 1 }}
                className={`button editor-button ${
                    getBtnValue[parseInt(value)] && "button-toggled"
                } ${!getEditorEnabled && "disabled"}`}
            >
                {children}
            </button>
        </div>
    );
};

const InsertImageButton = ({
    children,
    getEditorEnabled,
    getBtnValue,
    setBtnValue,
}) => {
    const editor = useSlate();
    return (
        <div className="mt-1">
            <button
                style={{ lineHeight: "1" }}
                onMouseDown={(event) => {
                    event.preventDefault();
                    const url = window.prompt("Enter the URL of the image:");
                    if (!isImageUrl(url)) return;
                    insertImage(editor, url, getBtnValue, setBtnValue);
                }}
                className={`button editor-button ${
                    !getEditorEnabled && "disabled"
                }`}
            >
                {children}
            </button>
        </div>
    );
};

const InsertYoutubeVideoButton = ({
    children,
    getEditorEnabled,
    getBtnValue,
    setBtnValue,
}) => {
    const editor = useSlate();
    return (
        <div className="mt-1">
            <button
                style={{ lineHeight: "1" }}
                onMouseDown={(event) => {
                    event.preventDefault();
                    const url = window.prompt(
                        "Enter the URL of the Youtube video:"
                    );
                    if (!url) return;

                    function youtubeParser(url) {
                        const regExp =
                            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                        const match = url.match(regExp);
                        return match && match[7].length === 11
                            ? match[7]
                            : false;
                    }

                    const videoUrl = youtubeParser(url);

                    if (!videoUrl) return;

                    insertYoutubeVideo(
                        editor,
                        "https://www.youtube.com/embed/" + videoUrl,
                        getBtnValue,
                        setBtnValue
                    );
                }}
                className={`button editor-button ${
                    !getEditorEnabled && "disabled"
                }`}
            >
                {children}
            </button>
        </div>
    );
};

const Menu = React.forwardRef(({ children, ...props }, ref) => (
    <>
        <div className="mb-4">{children}</div>
    </>
));

const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <Menu
        {...props}
        ref={ref}
    />
));

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const isBlockActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: (n) => n.type === format,
    });
    return !!match;
};

const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) => LIST_TYPES.includes(n.type),
        split: true,
    });

    Transforms.setNodes(editor, {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
    });

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const toggleMark = (editor, format) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

export default RichEditor;
