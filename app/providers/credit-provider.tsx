"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface CreditContextType {
    credits: number | null;
    maxCredits: number;
    planName: string;
    refreshCredits: () => Promise<void>;
    deductCredits: (amount: number) => void;
    refundCredits: (amount: number) => void;
}

const CreditContext = createContext<CreditContextType>({
    credits: null,
    maxCredits: 15,
    planName: "Free",
    refreshCredits: async () => { },
    deductCredits: () => { },
    refundCredits: () => { },
});

export function useCredits() {
    return useContext(CreditContext);
}

export function CreditProvider({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState<number | null>(null);
    const [maxCredits, setMaxCredits] = useState<number>(15);
    const [planName, setPlanName] = useState<string>("Free");

    const refreshCredits = async () => {
        try {
            const res = await fetch("/api/credits");
            if (res.ok) {
                const data = await res.json();
                setCredits(data.credits);
                if (data.maxCredits) setMaxCredits(data.maxCredits);
                if (data.planName) setPlanName(data.planName);
            }
        } catch (error) {
            console.error("Failed to fetch credits", error);
        }
    };

    useEffect(() => {
        refreshCredits();
    }, []);

    const deductCredits = (amount: number) => {
        setCredits((prev) => (prev !== null ? prev - amount : null));
    };

    const refundCredits = (amount: number) => {
        setCredits((prev) => (prev !== null ? prev + amount : null));
    };

    return (
        <CreditContext.Provider
            value={{
                credits,
                maxCredits,
                planName,
                refreshCredits,
                deductCredits,
                refundCredits,
            }}
        >
            {children}
        </CreditContext.Provider>
    );
}
