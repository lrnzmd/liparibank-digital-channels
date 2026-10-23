import { z } from "zod";

export const uploadKycDocumentSchema = z.object({
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.enum(["application/pdf", "image/jpeg", "image/png"]).refine(
      (mime) => ["application/pdf", "image/jpeg", "image/png"].includes(mime),
      {
        message: "MIME type non supportato. Accettati: PDF, JPEG, PNG",
      }
    ),
    size: z.number().max(5 * 1024 * 1024, "File troppo grande (max 5MB)"),
    buffer: z.instanceof(Buffer),
  }),
});

export type UploadKycDocumentRequest = z.infer<typeof uploadKycDocumentSchema>;
