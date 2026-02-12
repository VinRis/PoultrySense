
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  UploadCloud,
  Send,
  Loader2,
  X,
  Camera,
  Video,
  Mic,
  Square,
  Trash2,
} from "lucide-react";
import { isToday } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/lib/hooks/use-local-storage";
import { diagnosePoultryAction, diagnosePoultryByAudioAction } from "@/app/actions";
import type { Diagnosis } from "@/lib/types";
import { DiagnosisResult } from "@/app/components/DiagnosisResult";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ACCEPTED_AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/mpeg"];

const diagnosisSchema = z
  .object({
    diagnosisMethod: z.enum(["image", "description", "live", "audio"]),
    symptomDescription: z.string().optional(),
    image: z.any().optional(),
    audio: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.diagnosisMethod === "image" || data.diagnosisMethod === "live") {
      if (!data.image) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            data.diagnosisMethod === "image"
              ? "Please upload an image."
              : "Please capture a photo.",
          path: ["image"],
        });
        return;
      }
      if (data.image.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Max image size is 5MB.`,
          path: ["image"],
        });
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(data.image.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
          path: ["image"],
        });
      }
    }
    if (data.diagnosisMethod === "description") {
      if (
        !data.symptomDescription ||
        data.symptomDescription.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please describe the symptoms.",
          path: ["symptomDescription"],
        });
      }
    }
    if (data.diagnosisMethod === "audio") {
      if (!data.audio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please record or upload audio.",
          path: ["audio"],
        });
        return;
      }
      if (data.audio.size > MAX_AUDIO_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Max audio size is 10MB.`,
          path: ["audio"],
        });
      }
      if (!ACCEPTED_AUDIO_TYPES.includes(data.audio.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Unsupported audio format.",
          path: ["audio"],
        });
      }
    }
  });

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<Diagnosis | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [history, setHistory] = useLocalStorage<Diagnosis[]>(
    "diagnosisHistory",
    []
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [hasCameraPermission, setHasCameraPermission] = React.useState<
    boolean | null
  >(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Audio recording state
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = React.useState<boolean|null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const diagnosesToday = history.filter((d) =>
    isToday(new Date(d.timestamp))
  ).length;
  const diagnosesLeft = Math.max(0, 10 - diagnosesToday);

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    mode: "onChange",
    defaultValues: {
      diagnosisMethod: "image",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = form;

  const diagnosisMethod = watch("diagnosisMethod");

  const clearImage = () => {
    setValue("image", null, { shouldValidate: true });
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAudio = () => {
    setValue("audio", null, { shouldValidate: true });
    setAudioUrl(null);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleMethodChange = (value: "image" | "description" | "live" | "audio") => {
    setValue("diagnosisMethod", value, { shouldValidate: false });
    clearImage();
    clearAudio();
    setValue("symptomDescription", "", { shouldValidate: false });
  };


  // Camera Effect
  React.useEffect(() => {
    const streamCurrent = videoRef.current?.srcObject as MediaStream | null;
    if (diagnosisMethod !== 'live' || preview) {
      if (streamCurrent) {
        streamCurrent.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
      }
      return;
    }

    let stream: MediaStream;
    const getCameraPermission = async () => {
      try {
        setHasCameraPermission(null);
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description:
            "Please enable camera permissions in your browser settings to use this feature.",
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [diagnosisMethod, preview, toast]);

  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue("image", file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setValue("image", file, { shouldValidate: true });
          setPreview(canvas.toDataURL("image/jpeg"));
        }
      }, "image/jpeg");
    }
  };

  // Audio recording handlers
  const handleStartRecording = async () => {
    try {
      setHasMicPermission(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setValue("audio", audioBlob, { shouldValidate: true });
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setHasMicPermission(false);
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions in your browser settings.",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const onSubmit = async (data: DiagnosisFormValues) => {
    if (diagnosesLeft <= 0) {
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description:
          "You have reached the limit of 10 diagnoses for today. Please try again tomorrow.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      let diagnosisResult;
      const baseDiagnosis: Omit<Diagnosis, keyof z.infer<typeof diagnosisSchema>> = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };

      if (data.diagnosisMethod === "audio" && data.audio) {
        const audioDataUri = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.audio);
        });
        diagnosisResult = await diagnosePoultryByAudioAction({ audioDataUri });
        const newDiagnosis: Diagnosis = {
          ...baseDiagnosis,
          ...diagnosisResult,
          audioDataUri,
        };
        setResult(newDiagnosis);
        setHistory((prev) => [newDiagnosis, ...prev]);

      } else {
        let photoDataUri: string | undefined;
        if ((data.diagnosisMethod === "image" || data.diagnosisMethod === "live") && data.image) {
          photoDataUri = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(data.image);
          });
        }
        diagnosisResult = await diagnosePoultryAction({
          photoDataUri,
          symptomDescription: data.symptomDescription,
        });

        const newDiagnosis: Diagnosis = {
          ...baseDiagnosis,
          ...diagnosisResult,
          symptomDescription: data.symptomDescription,
          photoDataUri,
        };
        setResult(newDiagnosis);
        setHistory((prevHistory) => [newDiagnosis, ...prevHistory]);
      }

    } catch (error) {
      console.error("Diagnosis failed:", error);
      toast({
        variant: "destructive",
        title: "Diagnosis Failed",
        description:
          "There was an error processing your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            PoultrySense AI
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Your AI-powered assistant for poultry health diagnostics.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {!result && !isLoading && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>New Diagnosis</CardTitle>
                <CardDescription>
                  {isClient ? (
                    <>
                      You have {diagnosesLeft}{" "}
                      {diagnosesLeft === 1 ? "diagnosis" : "diagnoses"} left for
                      today.
                    </>
                  ) : (
                    "Checking daily limit..."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <Controller
                    name="diagnosisMethod"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>Diagnosis Method</Label>
                        <RadioGroup
                          onValueChange={(value: "image" | "description" | "live" | "audio") => handleMethodChange(value)}
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-2 rounded-lg bg-muted p-1"
                        >
                           <div>
                            <RadioGroupItem value="image" id="method-image" className="peer sr-only" />
                            <Label
                              htmlFor="method-image"
                              className="flex items-center justify-center rounded-md p-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-background/50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-sm"
                            >
                              Upload Image
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="live" id="method-live" className="peer sr-only" />
                            <Label
                              htmlFor="method-live"
                              className="flex items-center justify-center rounded-md p-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-background/50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-sm"
                            >
                              Live Capture
                            </Label>
                          </div>
                           <div>
                            <RadioGroupItem value="audio" id="method-audio" className="peer sr-only" />
                            <Label
                              htmlFor="method-audio"
                              className="flex items-center justify-center rounded-md p-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-background/50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-sm"
                            >
                              Record Audio
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="description" id="method-description" className="peer sr-only" />
                            <Label
                              htmlFor="method-description"
                              className="flex items-center justify-center rounded-md p-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-background/50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-sm"
                            >
                              Describe
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  />

                  {diagnosisMethod === 'image' && (
                    <div className="space-y-2">
                      <Label htmlFor="image-upload">Image</Label>
                      <div
                        className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          id="image-upload"
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                        {preview ? (
                          <>
                            <Image
                              src={preview}
                              alt="Image preview"
                              fill
                              className="object-contain rounded-lg p-2"
                            />
                           <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearImage();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          </>
                        ) : (
                          <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                     {errors.image && <p className="text-sm text-destructive">{errors.image.message as string}</p>}
                    </div>
                  )}

                  {diagnosisMethod === 'live' && (
                    <div className="space-y-2">
                      <Label htmlFor="live-capture">Live Camera</Label>
                      <div className="relative flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg bg-muted overflow-hidden">
                        {preview ? (
                           <>
                            <Image
                              src={preview}
                              alt="Image preview"
                              fill
                              className="object-contain rounded-lg p-2"
                            />
                           <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 rounded-full z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearImage();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          </>
                        ) : (
                          <div className="w-full h-full relative">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            {hasCameraPermission && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                                    <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Capture Photo
                                    </Button>
                                </div>
                            )}
                            {hasCameraPermission === false && (
                               <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <Alert variant="destructive">
                                  <Video className="h-4 w-4" />
                                  <AlertTitle>Camera Access Required</AlertTitle>
                                  <AlertDescription>
                                    Please allow camera access to use this feature.
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}
                            {hasCameraPermission === null && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <p className="mt-2 text-muted-foreground">Requesting camera access...</p>
                                </div>
                            )}
                          </div>
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                      {errors.image && <p className="text-sm text-destructive">{errors.image.message as string}</p>}
                    </div>
                  )}

                  {diagnosisMethod === "audio" && (
                    <div className="space-y-2">
                       <Label htmlFor="audio-recording">Audio Recording</Label>
                      <div className="flex flex-col justify-center items-center w-full h-64 border-2 border-dashed rounded-lg transition-colors space-y-4">
                        {audioUrl ? (
                          <div className="p-4 space-y-4 text-center">
                            <p className="font-medium">Recording Complete</p>
                            <audio src={audioUrl} controls className="w-full" />
                            <Button type="button" variant="destructive" onClick={clearAudio}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Recording
                            </Button>
                          </div>
                        ) : isRecording ? (
                          <div className="text-center space-y-4">
                             <Mic className="mx-auto h-16 w-16 text-destructive animate-pulse" />
                             <p className="text-muted-foreground">Recording...</p>
                            <Button type="button" variant="destructive" onClick={handleStopRecording}>
                              <Square className="mr-2 h-4 w-4" />
                              Stop Recording
                            </Button>
                          </div>
                        ) : (
                           <div className="text-center space-y-4">
                            {hasMicPermission === false ? (
                               <Alert variant="destructive">
                                  <Mic className="h-4 w-4" />
                                  <AlertTitle>Microphone Access Required</AlertTitle>
                                  <AlertDescription>
                                    Please allow microphone access to record audio.
                                  </AlertDescription>
                                </Alert>
                            ) : (
                              <>
                                <Mic className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Record poultry sounds (coughs, sneezes, etc.)</p>
                                <Button type="button" onClick={handleStartRecording} disabled={hasMicPermission === null}>
                                   {hasMicPermission === null ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mic className="mr-2 h-4 w-4" />}
                                  Start Recording
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.audio && <p className="text-sm text-destructive">{errors.audio.message as string}</p>}
                    </div>
                  )}

                  {diagnosisMethod === "description" && (
                    <div className="space-y-2">
                      <Label htmlFor="symptom-description">Symptom Description</Label>
                      <Controller
                        name="symptomDescription"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="symptom-description"
                            placeholder="Describe the symptoms, behavior, or any other relevant details..."
                            className="resize-none h-64"
                            disabled={isLoading}
                          />
                        )}
                      />
                      {errors.symptomDescription && <p className="text-sm text-destructive">{errors.symptomDescription.message as string}</p>}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !isClient || !isValid || diagnosesLeft <= 0}
                  >
                    {isLoading ? (
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Diagnose
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[400px]">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-semibold tracking-tight">
                Analyzing...
              </h2>
              <p className="text-muted-foreground max-w-md">
                Our AI veterinarian is examining the case. This may take a moment.
              </p>
            </div>
          )}

          {result && (
            <div>
              <DiagnosisResult diagnosis={result} />
              <div className="text-center mt-8">
                <Button onClick={() => setResult(null)}>
                  Start New Diagnosis
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
