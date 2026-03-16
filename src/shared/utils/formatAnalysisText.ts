export function formatAnalysisText(text: string) {
    if (!text) return "No disponible";

    let formatted = text.trim();

    // -----------------------------
    // NORMALIZAR TEXTO DE IA
    // -----------------------------

    formatted = formatted.replace(/(\S)\s(\d+\.\s)/g, "$1\n$2");
    formatted = formatted.replace(/(\S)\s\*\s/g, "$1\n* ");
    formatted = formatted.replace(/\*\*(.*?)\*\*:/g, "\n\n**$1:**");
    formatted = formatted.replace(/\n{3,}/g, "\n\n");
    formatted = formatted.replace(/\s\*\s/g, "\n* ");

    // -----------------------------
    // CAPITALIZAR PRIMERA LETRA
    // -----------------------------

    formatted = formatted.replace(/^([a-záéíóúñ])/i, (match) =>
        match.toUpperCase()
    );

    // -----------------------------
    // NEGRILLA
    // -----------------------------

    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // -----------------------------
    // LISTAS CON *
    // -----------------------------

    formatted = formatted.replace(
        /\*\s(.+?)(?=(?:\n\*|\n\d+\.|\n[A-ZÁÉÍÓÚÑ][^:\n]*:|\n\n|$))/gs,
        (_, item) => {
            const clean = item
                .replace(/\n/g, " ")
                .trim();

            return `<ul class="list-disc pl-5"><li>${clean}</li></ul>`;
        }
    );


    // -----------------------------
    // LISTAS NUMERADAS
    // -----------------------------

    formatted = formatted.replace(
        /(?:^\d+\. .+(?:\n|$))+/gm,
        (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((line) =>
                    `<li class="mb-2">${line.replace(/^\d+\. /, "").trim()}</li>`
                )
                .join("");

            return `<ol class="list-decimal pl-5">${items}</ol>`;
        }
    );

    // -----------------------------
    // BADGES SEMÁFORO
    // -----------------------------

    formatted = formatted.replace(/\b(verde|amarillo|rojo)\b/gi, (match) => {
        const color = match.toLowerCase();

        let badgeClass = "";

        if (color === "verde") badgeClass = "badge-success";
        if (color === "amarillo") badgeClass = "badge-warning";
        if (color === "rojo") badgeClass = "badge-error";

        return `<span class="badge my-2 text-sm capitalize ${badgeClass}">${match}</span>`;
    });

    // -----------------------------
    // SALTOS DE LÍNEA
    // -----------------------------

    formatted = formatted.replace(/\n/g, "<br>");

    // =============================
    // SEGUNDA PASADA DE SEGURIDAD
    // =============================

    // solo si no hay listas ya generadas
    if (formatted.includes("*") && !formatted.includes("<ul")) {
        formatted = formatted.replace(/\*\s+([^\n<br>]+)/g, (_, item) => {

            const content = item.trim();

            if (!content) return "";

            return `<ul class="list-disc pl-5"><li class="mb-2">${content}</li></ul>`;
        });
    }

    return formatted;
}