import React, {ChangeEventHandler, KeyboardEvent, ReactElement, useRef} from "react";

export function TextAreaModalFix(p: TextAreaProps): ReactElement {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    function textAreaKeyDownFix(e: KeyboardEvent<HTMLTextAreaElement>) {
        const area = textAreaRef.current;
        if(area == null)
            return

        const start = area.selectionStart;
        const value = area.value;

        if(e.key === 'Home') {
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            area.setSelectionRange(lineStart, lineStart);
        }
        else if (e.key === 'End') {
            const lineEnd = value.indexOf('\n', start);
            const endPosition = lineEnd === -1 ? value.length : lineEnd;
            area.setSelectionRange(endPosition, endPosition);
        }
        else if (e.key === 'ArrowUp') {
            const prevLineEnd = value.lastIndexOf('\n', start - 1);
            if (prevLineEnd === -1)
                return;
            const prevLineStart = value.lastIndexOf('\n', prevLineEnd - 1) + 1;
            const column = start - (value.lastIndexOf('\n', start - 1) + 1);
            const newCursorPos = prevLineStart + Math.min(column, prevLineEnd - prevLineStart);
            area.setSelectionRange(newCursorPos, newCursorPos);
        } else if (e.key === 'ArrowDown') {
            const currentLineEnd = value.indexOf('\n', start);
            if (currentLineEnd === -1)
                return;
            const nextLineStart = currentLineEnd + 1;
            const nextLineEnd = value.indexOf('\n', nextLineStart);
            const column = start - (value.lastIndexOf('\n', start - 1) + 1);
            const newCursorPos = nextLineStart + Math.min(column, (nextLineEnd === -1 ? value.length : nextLineEnd) - nextLineStart);
            area.setSelectionRange(newCursorPos, newCursorPos);
        }
    }

    return (
        <textarea {...p}
            ref={textAreaRef}
            onKeyDown={textAreaKeyDownFix}
        />
        )
}

interface TextAreaProps {
    className?: string,
    value: string,
    onChange: ChangeEventHandler<HTMLTextAreaElement>
}