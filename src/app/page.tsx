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
  Image as ImageIcon,
  X,
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
import { diagnosePoultryAction } from "@/app/actions";
import type { Diagnosis } from "@/lib/types";
import { DiagnosisResult } from "@/app/components/DiagnosisResult";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const diagnosisSchema = z
  .object({
    diagnosisMethod: z.enum(["image", "description"]),
    symptomDescription: z.string().optional(),
    image: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.diagnosisMethod === "image") {
      if (!data.image) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload an image.",
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
      if (!data.symptomDescription || data.symptomDescription.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please describe the symptoms.",
          path: ["symptomDescription"],
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
  const [history, setHistory] = useLocalStorage<Diagnosis[]>("diagnosisHistory", []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const diagnosesToday = history.filter((d) => isToday(new Date(d.timestamp))).length;
  const diagnosesLeft = Math.max(0, 10 - diagnosesToday);

  const form = useForm<DiagnosisFormValues>({
    resolver: zodResolver(diagnosisSchema),
    mode: "onChange",
    defaultValues: {
      diagnosisMethod: "image",
      symptomDescription: "",
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

  const removeImage = () => {
    setValue("image", null, { shouldValidate: true });
    setPreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: DiagnosisFormValues) => {
    if (diagnosesLeft <= 0) {
      toast({
        variant: "destructive",
        title: "Daily Limit Reached",
        description: "You have reached the limit of 10 diagnoses for today. Please try again tomorrow.",
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    let photoDataUri: string | undefined;
    if (data.diagnosisMethod === "image" && data.image) {
      photoDataUri = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.image);
      });
    }

    try {
      const diagnosisResult = await diagnosePoultryAction({
        photoDataUri,
        symptomDescription: data.symptomDescription,
      });

      const newDiagnosis: Diagnosis = {
        ...diagnosisResult,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        symptomDescription: data.symptomDescription,
        photoDataUri,
      };

      setResult(newDiagnosis);
      setHistory((prevHistory) => [newDiagnosis, ...prevHistory]);
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
                          onValueChange={(value: 'image' | 'description') => {
                            field.onChange(value);
                            if (value === 'image') {
                              setValue('symptomDescription', '', { shouldValidate: false });
                            } else {
                              removeImage();
                            }
                          }}
                          value={field.value}
                          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
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
                            <RadioGroupItem value="description" id="method-description" className="peer sr-only" />
                            <Label
                              htmlFor="method-description"
                              className="flex items-center justify-center rounded-md p-2 text-sm font-medium cursor-pointer transition-colors text-muted-foreground hover:bg-background/50 peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:shadow-sm"
                            >
                              Describe Symptoms
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  />

                  {diagnosisMethod === 'image' ? (
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
                              removeImage();
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
                  ) : (
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
                          />
                        )}
                      />
                      {errors.symptomDescription && <p className="text-sm text-destructive">{errors.symptomDescription.message as string}</p>}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !isClient || !isValid}
                  >
                    <Send className="mr-2 h-4 w-4" />
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
