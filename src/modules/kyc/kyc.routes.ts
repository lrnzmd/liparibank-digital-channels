import express, { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import {
  uploadKycDocument,
  listKycDocuments,
  deleteKycDocument,
} from "./kyc.controller";

const router: Router = express.Router();

// Configura multer con memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("MIME type non supportato"));
    }
  },
});

/**
 * @openapi
 * /api/customers/{customerId}/kyc:
 *   post:
 *     summary: Upload documento KYC
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Documento caricato con successo
 *       400:
 *         description: Errore validazione
 *       401:
 *         description: Non autenticato
 */
router.post(
  "/:customerId/kyc",
  authenticate,
  upload.single("file"),
  uploadKycDocument
);

/**
 * @openapi
 * /api/customers/{customerId}/kyc:
 *   get:
 *     summary: Elenca documenti KYC
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista documenti
 *       401:
 *         description: Non autenticato
 */
router.get("/:customerId/kyc", authenticate, listKycDocuments);

/**
 * @openapi
 * /api/customers/{customerId}/kyc/{documentId}:
 *   delete:
 *     summary: Elimina documento KYC
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Documento eliminato
 *       401:
 *         description: Non autenticato
 */
router.delete("/:customerId/kyc/:documentId", authenticate, deleteKycDocument);

export default router;
