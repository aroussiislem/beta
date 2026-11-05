"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";

interface TimerWidgetProps {
  ticketId: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionStop?: () => void;
}

export function TimerWidget({
  ticketId,
  onSessionStart,
  onSessionStop,
}: TimerWidgetProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tickets/${ticketId}/timer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ action: "start" }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentSessionId(data.data.id);
        setIsRunning(true);
        setSeconds(0);
        onSessionStart?.(data.data.id);
      }
    } catch (error) {
      console.error("Failed to start timer:", error);
    }
  };

  const handleStop = async () => {
    if (!currentSessionId) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tickets/${ticketId}/timer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          action: "stop",
          timerSessionId: currentSessionId,
          endTime: new Date(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsRunning(false);
        setSeconds(0);
        setCurrentSessionId(null);
        onSessionStop?.();
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chronomètre</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='text-center'>
          <div className='text-5xl font-mono font-bold text-slate-900 mb-4'>
            {formatTime(seconds)}
          </div>

          <div className='flex gap-2 justify-center'>
            {!isRunning ? (
              <Button size='lg' onClick={handleStart} className='gap-2'>
                <Play className='h-5 w-5' />
                Démarrer
              </Button>
            ) : (
              <Button
                size='lg'
                onClick={handleStop}
                variant='destructive'
                className='gap-2'
              >
                <Square className='h-5 w-5' />
                Arrêter
              </Button>
            )}
          </div>

          <p className='text-xs text-slate-500 mt-4'>
            {isRunning ? "Le chronomètre tourne..." : "Chronomètre arrêté"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
