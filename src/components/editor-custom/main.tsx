"use client"

import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { EditorContext, EditorProviderProps, useEditor } from "@tiptap/react"
import { UiState } from "../tiptap-extension/ui-state-extension"
import { LoadingSpinner, EditorContentArea } from "../tiptap-templates/notion-like/notion-like-editor"
import { NotionEditorHeader } from "../tiptap-templates/notion-like/notion-like-editor-header"






// Extensiones
import { StarterKit } from "@tiptap/starter-kit"
import { Mention } from "@tiptap/extension-mention"
import { TaskList, TaskItem } from "@tiptap/extension-list"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration"
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Mathematics } from "@tiptap/extension-mathematics"
import { Ai } from "@tiptap-pro/extension-ai"
import { UniqueID } from "@tiptap/extension-unique-id"
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji"


export function EditorProvider() {

    const editor = useEditor({
        immediatelyRender: false,
        shouldRerenderOnTransaction: false,
        editorProps: {
            attributes: {
                class: "notion-like-editor",
            },
        },
        extensions: [
            StarterKit,
            HorizontalRule,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Emoji.configure({
                emojis: gitHubEmojis.filter(
                    (emoji) => !emoji.name.includes("regional")
                ),
                forceFallbackImages: true,
            }),
            Mathematics,
            Superscript,
            Subscript,
            Color,
            TextStyle,
            TaskList,
            TaskItem.configure({ nested: true }),
            Typography,
            UiState,
            Highlight.configure({ multicolor: true }),

        ],
    })

    if (!editor) {
        return <LoadingSpinner />
    }

    return (
        <div className="notion-like-editor-wrapper">
            <EditorContext.Provider value={{ editor }}>
                <NotionEditorHeader />
                <EditorContentArea />
            </EditorContext.Provider>


        </div>
    )
}