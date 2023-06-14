import Image from "next/image";
import { useEffect, useState } from "react";

export default function ImageWithFallback({ src, altText, fallbackSrc, ...rest }) {
    const [imgSrc, set_imgSrc] = useState(src);

    useEffect(() => {
        set_imgSrc(src);
    }, [src]);

    return (
        <Image
            {...rest}
            src={imgSrc}
            alt={altText}
            onLoadingComplete={(result) => {
                if (result.naturalWidth === 0) {
                    // Broken image
                    set_imgSrc(fallbackSrc);
                }
            }}
            onError={() => {
                set_imgSrc(fallbackSrc);
            }}
        />
    );
}
