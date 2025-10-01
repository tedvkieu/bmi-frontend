"use client";

import { useState } from "react";
import GuideOver from "./components/GuideOver";
import { HelpCircle } from "lucide-react";

export default function GuideOverWrapper() {
    const [runGuide, setRunGuide] = useState(false);

    return (
        <>
            {/* Nút nổi */}
            <button
                onClick={() => setRunGuide(true)}
                className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                <HelpCircle size={24} />
            </button>

            {/* Guide component */}
            <GuideOver run={runGuide} onTourEnd={() => setRunGuide(false)} />
        </>
    );
}
