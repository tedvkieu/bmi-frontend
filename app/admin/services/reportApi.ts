export type Company = {
    id: string;
    name: string;
};

export type CompaniesResponse = {
    content: Array<{
        id: number;
        name: string;
    }>;
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
};

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

    async getCompanies(page: number = 0, size: number = 10, searchQuery: string = ""): Promise<CompaniesResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
        });
        if (searchQuery.trim()) {
            params.append("q", searchQuery.trim());
        }

        const res = await fetch(`/api/reports/inspection/companies?${params.toString()}`, {
            cache: "no-store",
            headers: {
                'Cache-Control': 'no-cache',
            }
        });

        if (!res.ok) {
            throw new Error("Failed to load companies");
        }

        const text = await res.text();
        let json: any = {};
        try {
            json = text ? JSON.parse(text) : {};
        } catch {
            json = {};
        }

        return json;
    },
};


