"use client";

import useSWR from "swr";
import { fetcher } from "../api";

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
}

export function useKnowledgeBase() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/knowledge/active",
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    items: (data?.data || []) as KnowledgeItem[],
    faqs: (data?.data || []) as KnowledgeItem[], // backward compatibility alias
    isLoading,
    error,
    mutate,
  };
}

export const useFaqs = useKnowledgeBase;
