import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import multer from "multer";
import fs from "fs";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Only allow image uploads; extension is derived from the verified MIME type,
// never from the client-supplied filename.
const ALLOWED_IMAGE_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "uploads/");
  },
  filename: function (_req, file, cb) {
    const ext = ALLOWED_IMAGE_MIME[file.mimetype] ?? ".jpg";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (_req, file, cb) {
    if (!ALLOWED_IMAGE_MIME[file.mimetype]) {
      cb(new Error("Only JPEG, PNG, or WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

// Keyword-based car symptom diagnosis engine
const symptomRules: {
  keywords: string[];
  issue: string;
  description: string;
  severity: "low" | "medium" | "high";
  action: string;
}[] = [
  {
    keywords: ["brake", "braking", "squeal", "screech", "stop"],
    issue: "Brake System Issue",
    description: "Unusual braking sounds may indicate worn brake pads or rotor damage.",
    severity: "high",
    action: "Inspect brake pads and rotors immediately. Do not drive at high speed.",
  },
  {
    keywords: ["engine", "knocking", "ticking", "clicking", "rattling"],
    issue: "Engine Noise",
    description: "Internal engine noises can signal low oil pressure or worn bearings.",
    severity: "high",
    action: "Check engine oil level. Stop driving if knocking is severe. See a mechanic ASAP.",
  },
  {
    keywords: ["overheat", "temperature", "hot", "smoke", "steam", "coolant"],
    issue: "Engine Overheating",
    description: "High engine temperature can cause serious damage if not addressed.",
    severity: "high",
    action: "Pull over, turn off AC, and let engine cool. Check coolant levels.",
  },
  {
    keywords: ["battery", "crank", "start", "dead", "click"],
    issue: "Battery or Starter Issue",
    description: "Difficulty starting or clicking sounds often point to a weak battery or faulty starter motor.",
    severity: "medium",
    action: "Test the battery voltage. Jump-start the vehicle or replace the battery.",
  },
  {
    keywords: ["tire", "flat", "pressure", "wobble", "vibration", "steering"],
    issue: "Tire or Wheel Issue",
    description: "Vibrations or pulling to one side may indicate tire pressure problems or alignment issues.",
    severity: "medium",
    action: "Check tire pressure and inspect for damage. Visit a tire shop for balancing/alignment.",
  },
  {
    keywords: ["oil", "leak", "drip", "puddle", "fluid"],
    issue: "Fluid Leak",
    description: "Visible leaks under your vehicle may indicate an oil, coolant, or brake fluid leak.",
    severity: "medium",
    action: "Identify the fluid color. Dark brown = oil, green/orange = coolant, clear = water. See a mechanic.",
  },
  {
    keywords: ["ac", "air", "conditioning", "cool", "cold", "heat", "heater"],
    issue: "HVAC System Issue",
    description: "Insufficient cooling or heating may be due to a refrigerant leak or faulty blower.",
    severity: "low",
    action: "Have the AC system inspected and recharged by a qualified technician.",
  },
  {
    keywords: ["light", "warning", "dashboard", "check", "indicator"],
    issue: "Warning Light",
    description: "Dashboard warning lights indicate a system fault that needs diagnosis.",
    severity: "medium",
    action: "Use an OBD-II scanner to read the error code, or visit a mechanic for a diagnostic scan.",
  },
];

// POST /diagnostics/analyze
router.post("/analyze", authenticate, (req: Request, res: Response) => {
  const { symptoms } = req.body as { symptoms: string[] };

  if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
    res.status(400).json({ message: "Please provide a list of symptoms" });
    return;
  }

  const lowerSymptoms = symptoms.map((s) => s.toLowerCase());
  const matched: {
    name: string;
    probability: number;
    description: string;
    severity: "low" | "medium" | "high";
    recommendedAction: string;
  }[] = [];

  for (const rule of symptomRules) {
    const hits = rule.keywords.filter((kw) =>
      lowerSymptoms.some((s) => s.includes(kw))
    ).length;

    if (hits > 0) {
      const probability = Math.min(hits / rule.keywords.length, 1);
      matched.push({
        name: rule.issue,
        probability: Math.round(probability * 100) / 100,
        description: rule.description,
        severity: rule.severity,
        recommendedAction: rule.action,
      });
    }
  }

  // Sort by probability descending
  matched.sort((a, b) => b.probability - a.probability);

  res.json({ possibleIssues: matched });
});

// POST /diagnostics/scan
router.post("/scan", authenticate, upload.single("image"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: "No image file uploaded" });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Mock AI Vision analysis
  const mockAnalysis = {
    resultSummary: "Minor surface scratch on front bumper",
    details: {
      part: "Front Bumper",
      issue: "Scratch",
      confidence: 0.89,
    },
    severity: "LOW",
  };

  try {
    const report = await prisma.diagnosticReport.create({
      data: {
        customerId: userId,
        imageUrl: `/uploads/${req.file.filename}`,
        resultSummary: mockAnalysis.resultSummary,
        details: mockAnalysis.details,
        severity: mockAnalysis.severity,
      },
    });

    res.status(201).json({ message: "Scan complete", report });
  } catch (error) {
    console.error("Error creating diagnostic report:", error);
    res.status(500).json({ message: "Internal server error during scan" });
  }
});

export default router;
