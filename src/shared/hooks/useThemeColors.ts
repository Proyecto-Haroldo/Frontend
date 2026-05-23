import { useEffect, useState } from "react";

export const useThemeColors = () => {
    const [colors, setColors] = useState({
        base: "#e5e7eb",
        highlight: "#f3f4f6",
    });

    useEffect(() => {
        // Get the computed CSS variables from the current theme
        const root = document.documentElement;
        const baseColor = getComputedStyle(root).getPropertyValue("--color-base-200")?.trim();
        const highlightColor = getComputedStyle(root).getPropertyValue("--color-base-100")?.trim();

        if (baseColor && highlightColor) {
            setColors({
                base: baseColor,
                highlight: highlightColor,
            });
        }
    }, []);

    return colors;
};
