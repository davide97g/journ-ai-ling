"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, Square, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface AudioRecorderProps {
  onAudioUploaded: (url: string) => void;
  audioUrl?: string | null;
}

export function AudioRecorder({
  onAudioUploaded,
  audioUrl,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("[v0] Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        onAudioUploaded(data.url);
        setAudioBlob(null);
      }
    } catch (error) {
      console.error("[v0] Error uploading audio:", error);
      alert("Failed to upload audio. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    onAudioUploaded("");
  };

  if (audioUrl) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
        <audio src={audioUrl} controls className="flex-1" />
        <Button variant="ghost" size="icon" onClick={clearAudio}>
          <X className="h-4 w-4" />
          <span className="sr-only">Remove audio</span>
        </Button>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
        <audio
          src={URL.createObjectURL(audioBlob)}
          controls
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={clearAudio}
          disabled={isUploading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear recording</span>
        </Button>
        <Button onClick={uploadAudio} disabled={isUploading} size="sm">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "ghost"}
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      className={cn("h-8 w-8", isRecording && "animate-pulse")}
    >
      {isRecording ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      <span className="sr-only">
        {isRecording ? "Stop recording" : "Record audio"}
      </span>
    </Button>
  );
}
