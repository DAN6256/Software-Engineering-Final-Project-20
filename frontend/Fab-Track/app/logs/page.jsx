"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, Download } from "lucide-react";

export default function LogsPage() {
  // State management
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Hooks
  const router = useRouter();
  const { toast } = useToast();
/**
   * Fetches logs from the API when component mounts
   */
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken"); // Get auth token from storage

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/api/borrow/logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        // Ensure there is always an array of logs
        const logData = Array.isArray(data) ? data : data.logs || [];
        setLogs(logData);
      } catch (err) {
        // Show error notification and redirect on failure
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);
// Handles downloading logs as a JSON file
  const handleDownload = () => {
    // Create a JSON blob from the logs
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    // Create download link and trigger click
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  // Renders an individual log card
  const renderLogCard = (log, index) => {
     // Destructure known log properties
    const { user, action, timestamp, status, ...rest } = log;

    return (
      <Card key={index} className="border border-gray-200 shadow-sm p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Log #{index + 1}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-sm space-y-2">
          {/* User information */}
          {user && (
            <div>
              <span className="font-medium text-gray-700">User:</span>{" "}
              <span className="text-gray-900">{user}</span>
            </div>
          )}
          {/* Action performed */}
          {action && (
            
            <div>
              <span className="font-medium text-gray-700">Action:</span>{" "}
              <span className="text-gray-900">{action}</span>
            </div>
          )}
          {/* Status with color coding */}
          {status && (
            <div>
              <span className="font-medium text-gray-700">Status:</span>{" "}
              <span
                className={`font-semibold ${
                  status.toLowerCase().includes("success")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {status}
              </span>
            </div>
          )}

          {/* Additional Dynamic Fields */}
          {Object.keys(rest).length > 0 && (
            <div className="mt-3 border-t pt-3 space-y-1 text-gray-700">
              {Object.entries(rest).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key}:</span>{" "}
                  <span className="text-gray-800">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header with navigation and download button */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleDownload}
          className="flex items-center"
          disabled={!logs.length}
        >
          <Download className="mr-2 h-4 w-4" /> Export Raw Data
        </Button>
      </div>
{/* Conditional rendering based on loading state and log data */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-500">No logs available.</p>
      ) : (
        <div className="grid gap-6">
          {logs.map((log, index) => renderLogCard(log, index))}
        </div>
      )}
    </div>
  );
}
