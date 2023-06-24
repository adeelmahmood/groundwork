"use client";

import styles from "./typing.module.css";

export const Typing: React.FC = () => {
    return (
        <div className={`${styles.typing}`}>
            <span></span>
            <span></span>
            <span></span>
        </div>
    );
};
