import { BathroomItemId, BATHROOM_ITEMS } from '@/constants';

// ─── Fill these in after training your Roboflow model ────────────────────────
const ROBOFLOW_API_KEY = 'YOUR_ROBOFLOW_API_KEY';
const ROBOFLOW_MODEL_ID = 'bathroom-items';   // your Roboflow project slug
const ROBOFLOW_MODEL_VERSION = '1';
const CONFIDENCE_THRESHOLD = 0.55;
// ─────────────────────────────────────────────────────────────────────────────

const ROBOFLOW_URL =
  `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_MODEL_VERSION}` +
  `?api_key=${ROBOFLOW_API_KEY}&confidence=${CONFIDENCE_THRESHOLD * 100}`;

export interface VerificationResult {
  success: boolean;
  detected: string[];
  confidence: number;
  message: string;
}

export async function verifyBathroomItem(
  base64Image: string,
  targetItemId: BathroomItemId,
): Promise<VerificationResult> {
  const targetItem = BATHROOM_ITEMS.find((i) => i.id === targetItemId)!;
  const keywords = targetItem.keywords.map((k) => k.toLowerCase());

  try {
    const response = await fetch(ROBOFLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: base64Image,
    });

    if (!response.ok) {
      return { success: false, detected: [], confidence: 0, message: `API error (${response.status})` };
    }

    const data = await response.json();
    const predictions: { class: string; confidence: number }[] = data.predictions ?? [];
    const detected = [...new Set(predictions.map((p) => p.class))];

    const match = predictions
      .filter((p) => keywords.includes(p.class.toLowerCase()))
      .sort((a, b) => b.confidence - a.confidence)[0];

    const confidence = match?.confidence ?? 0;
    const success = !!match && confidence >= CONFIDENCE_THRESHOLD;

    return {
      success,
      detected,
      confidence,
      message: success
        ? `${targetItem.label} detected! (${Math.round(confidence * 100)}%)`
        : detected.length
        ? `Saw ${detected.slice(0, 3).join(', ')} — not a ${targetItem.label}.`
        : 'Nothing detected. Try better lighting.',
    };
  } catch (err) {
    return { success: false, detected: [], confidence: 0, message: 'Network error. Try again.' };
  }
}