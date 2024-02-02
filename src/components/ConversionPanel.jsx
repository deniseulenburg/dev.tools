import React, { useEffect, useState } from "react";
import { Pane, Alert, Spinner } from "evergreen-ui";
// import EditorPanel, { EditorPanelProps } from "../components/EditorPanel";
import EditorPanel from "../components/EditorPanel";
import PrettierWorker from "../../typings.d.ts";
import { getWorker } from "../utils/workerWrapper";
import { useData } from "../hooks/useData";

let prettierWorker;

function getEditorLanguage(lang) {
    const mapping = {
        flow: "typescript"
    };

    return mapping[lang] || lang;
}

export const Transformer = async ({ value, splitEditorValue }) => {
    // Your transformer logic here
};

const ConversionPanel = function ({
    splitEditorProps,
    editorProps,
    resultEditorProps,
    transformer,
    splitLanguage,
    splitTitle,
    editorLanguage,
    editorTitle,
    resultLanguage,
    resultTitle,
    editorSettingsElement,
    settings,
    editorDefaultValue,
    splitEditorDefaultValue,
    resultSettingsElement
}) {
    const [value, setValue] = useData(editorDefaultValue || editorLanguage);
    const [splitValue, setSplitValue] = useData(
        splitEditorDefaultValue || splitLanguage
    );
    const [result, setResult] = useState("");
    const [message, setMessage] = useState("");
    const [showUpdateSpinner, toggleUpdateSpinner] = useState(false);

    let packageDetails;

    useEffect(() => {
        async function transform() {
            try {
                toggleUpdateSpinner(true);
                prettierWorker = prettierWorker || getWorker(PrettierWorker);

                const result = await transformer({
                    value,
                    splitEditorValue: splitTitle ? splitValue : undefined
                });

                let prettyResult = await prettierWorker.send({
                    value: result,
                    language: resultLanguage
                });

                // Fix for #319
                if (prettyResult.startsWith(";<")) {
                    prettyResult = prettyResult.slice(1);
                }
                setResult(prettyResult);
                setMessage("");
            } catch (e) {
                console.error(e);
                setMessage(e.message);
            }
            toggleUpdateSpinner(false);
        }

        transform();
    }, [splitValue, value, splitTitle, settings]);

    return (
        <>
            <Pane
                display="flex"
                flexDirection="row"
                overflow="hidden"
                flex={1}
                height={"calc(100vh - 40px)"}
            >
                <Pane
                    display="flex"
                    flex={1}
                    borderRight
                    flexDirection="column"
                    overflow="hidden"
                >
                    <EditorPanel
                        language={getEditorLanguage(editorLanguage)}
                        onChange={setValue}
                        hasLoad
                        defaultValue={value}
                        id={1}
                        hasCopy={false}
                        title={editorTitle}
                        settingElement={editorSettingsElement}
                        hasClear
                        {...editorProps}
                    />

                    {splitTitle && (
                        <Pane display="flex" flex={1} borderTop>
                            <EditorPanel
                                title={splitTitle}
                                defaultValue={splitValue}
                                language={getEditorLanguage(splitLanguage)}
                                id={2}
                                hasCopy={false}
                                onChange={setSplitValue}
                                hasLoad
                                hasClear
                                {...splitEditorProps}
                            />
                        </Pane>
                    )}
                </Pane>
                <Pane display="flex" flex={1} position="relative">
                    {showUpdateSpinner && (
                        <Pane
                            display="inline-flex"
                            position="absolute"
                            backgroundColor="#fff"
                            zIndex={9}
                            borderRadius={"50%"}
                            paddingX={8}
                            paddingY={8}
                            elevation={1}
                            top={50}
                            right={30}
                        >
                            <Spinner
                                css={{
                                    "& circle": {
                                        stroke: "#0e7ccf"
                                    }
                                }}
                                size={32}
                            />
                        </Pane>
                    )}
                    <EditorPanel
                        title={resultTitle}
                        defaultValue={result}
                        language={getEditorLanguage(resultLanguage)}
                        id={3}
                        editable={false}
                        hasPrettier={false}
                        settingElement={resultSettingsElement}
                        packageDetails={packageDetails}
                        {...resultEditorProps}
                    />
                </Pane>
            </Pane>

            {message && (
                <Alert
                    paddingY={15}
                    paddingX={20}
                    left={240}
                    right={0}
                    position="absolute"
                    intent="danger"
                    bottom={0}
                    title={message}
                    backgroundColor="#FAE2E2"
                    zIndex={3}
                />
            )}
        </>
    );
};

export default React.memo(ConversionPanel);
