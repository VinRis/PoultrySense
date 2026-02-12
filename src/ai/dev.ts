'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-treatment-recommendations.ts';
import '@/ai/flows/generate-poultry-diagnosis.ts';
import '@/ai/flows/generate-audio-diagnosis.ts';
