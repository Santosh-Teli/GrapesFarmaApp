"use client";

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from "@/hooks/use-store";
import { SprayForm } from "@/components/spray/SprayForm";

export default function EditSprayPage({ params }: { params: Promise<{ id: string }> }) {
    const { sprayRecords, isInitialized } = useStore();
    const [record, setRecord] = useState<any>(null);

    // Unwrap params using React.use()
    const { id } = use(params);

    useEffect(() => {
        if (isInitialized && id) {
            // Decode ID if needed, though usually string match is fine
            const found = sprayRecords.find(r => r.id === id); // id is string
            if (found) {
                setRecord(found);
            }
        }
    }, [id, sprayRecords, isInitialized]);

    if (!isInitialized) return <div>Loading...</div>;
    if (!record) return <div>Record not found</div>;

    return <SprayForm initialData={record} isEdit={true} />;
}
