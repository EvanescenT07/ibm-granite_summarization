"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, History, FileText } from "lucide-react";

type HistoryItem = {
  id: string;
  fileName: string;
  summary: string | null;
  createdAt: string;
};

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/history");
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <History className="mr-2 h-6 w-6" />
        Your History
      </h2>
      {history.length === 0 ? (
        <p className="text-muted-foreground">
          No summaries found. Upload a document to get started!
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="mr-2 h-5 w-5" />
                  {item.fileName}
                </CardTitle>
                <CardDescription>
                  {new Date(item.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
