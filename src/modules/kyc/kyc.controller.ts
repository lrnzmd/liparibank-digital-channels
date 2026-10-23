import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import prisma from "../../config/prisma";
import { ValidationError } from "../../routes/errors";
import { asyncHandler } from "../../utils/asyncHandler";

// Allowed MIME types e loro magic numbers
const ALLOWED_MIMES = {
  "application/pdf": [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
  "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])], // FFD8FF
  "image/png": [Buffer.from([0x89, 0x50, 0x4e, 0x47])], // 89504E47
};

/**
 * Valida il magic number del file contro il MIME type dichiarato
 */
const validateMagicNumber = async (
  buffer: Buffer,
  declaredMimeType: string
): Promise<boolean> => {
  const detectedType = await fileTypeFromBuffer(buffer);

  if (!detectedType) {
    return false; // Tipo non riconosciuto
  }

  return detectedType.mime === declaredMimeType;
};

export const uploadKycDocument = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params as { customerId: string };
    const file = req.file;

    if (!file) {
      throw new ValidationError("File non fornito", { field: "file" });
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.mimetype)) {
      throw new ValidationError("MIME type non supportato", { field: "file" });
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError("File troppo grande (max 5MB)", {
        field: "file",
      });
    }

    // Validazione magic number
    const magicNumberValid = await validateMagicNumber(
      file.buffer,
      file.mimetype
    );
    if (!magicNumberValid) {
      throw new ValidationError(
        "Contenuto file non corrisponde al tipo dichiarato",
        { field: "file" }
      );
    }

    // Verifica che il customer esista
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new ValidationError("Customer non trovato", {
        field: "customerId",
      });
    }

    // Salva il file localmente
    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    const storageUrl = `/uploads/${fileName}`;

    await fs.writeFile(filePath, file.buffer);

    // Salva metadati in DB
    const kycDocument = await prisma.kycDocument.create({
      data: {
        customerId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageUrl,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      data: kycDocument,
      meta: {
        uploadedAt: new Date().toISOString(),
      },
    });
  }
);

/**
 * Elenca tutti i documenti KYC per un customer
 */
export const listKycDocuments = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params as { customerId: string };

    const documents = await prisma.kycDocument.findMany({
      where: { customerId },
      orderBy: { uploadedAt: "desc" },
    });

    res.json({
      data: documents,
      meta: {
        total: documents.length,
      },
    });
  }
);

/**
 * Elimina un documento KYC
 */
export const deleteKycDocument = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { documentId } = req.params as { documentId: string };

    const document = await prisma.kycDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new ValidationError("Documento non trovato", { field: "id" });
    }

    // Elimina il file fisico
    const filePath = path.join(process.cwd(), "uploads", path.basename(document.storageUrl));
    try {
      await fs.unlink(filePath);
    } catch (e) {
      // Ignora errore se file non esiste
    }

    // Elimina dal DB
    await prisma.kycDocument.delete({
      where: { id: documentId },
    });

    res.status(204).send();
  }
);
