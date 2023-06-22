"use client";

import { useEffect, useState } from "react";
import styles from "./answer.module.css";

interface AnswerProps {
    text: string;
}

export const Answer: React.FC<AnswerProps> = ({ text }) => {
    const [words, setWords] = useState<string[]>([]);

    useEffect(() => {
        if (text) {
            setWords(text.split(" "));
        }
    }, [text]);

    return (
        <div
            className={`prose-sm lg:prose-xl w-full lg:text-xl ${styles.fadeIn}`}
            dangerouslySetInnerHTML={{ __html: text }}
        />
    );
};
