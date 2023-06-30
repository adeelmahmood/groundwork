import { Vector } from "@pinecone-database/pinecone";
import en from "javascript-time-ago/locale/en.json";
import ru from "javascript-time-ago/locale/ru.json";
import TimeAgo from "javascript-time-ago";

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

export const truncateStringByBytes = (str: string, bytes: number) => {
    const enc = new TextEncoder();
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

export const sliceIntoChunks = (arr: Vector[], chunkSize: number) => {
    return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
        arr.slice(i * chunkSize, (i + 1) * chunkSize)
    );
};

export const chunkSubstr = (str: string, size: number) => {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);
    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
        chunks[i] = str.substring(o, size);
    }
    return chunks;
};

export function formatPhoneNumber(phone: string) {
    var cleaned = ("" + phone).replace(/\D/g, "");
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        var intlCode = match[1] ? "+1 " : "";
        return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
    }
    return null;
}

const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
    { unit: "year", ms: 31536000000 },
    { unit: "month", ms: 2628000000 },
    { unit: "day", ms: 86400000 },
    { unit: "hour", ms: 3600000 },
    { unit: "minute", ms: 60000 },
    { unit: "second", ms: 1000 },
];
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function relativeTimeFromDates(relative: Date | null, pivot: Date = new Date()): string {
    if (!relative) return "";
    const elapsed = relative.getTime() - pivot.getTime();
    return relativeTimeFromElapsed(elapsed);
}

export function relativeTimeFromElapsed(elapsed: number): string {
    for (const { unit, ms } of units) {
        if (Math.abs(elapsed) >= ms || unit === "second") {
            return rtf.format(Math.round(elapsed / ms), unit);
        }
    }
    return "";
}

export const displayDate = (date: string) => {
    return (date ? new Date(date) : new Date()).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
    });
};

export const displayDateShort = (date: string) => {
    return (date ? new Date(date) : new Date()).toLocaleDateString("en-us", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    });
};
