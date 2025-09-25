export const reportApi = {
    async importExcel(file: File): Promise<void> {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/reports/inspection/import", {
            method: "POST",
            body: form,
        });

        if (!res.ok) {
            let msg = "Tải lên thất bại";
            try {
                const txt = await res.text();
                msg = txt || msg;
            } catch { }
            throw new Error(msg);
        }
    },
};


