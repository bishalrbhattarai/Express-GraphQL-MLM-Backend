import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import prisma from "../models/index.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticatedUser.js";
const route = express.Router();
import path from "path";
import { upload } from "./deals.routes.js";

// Define the route to handle the POST request
route.post(
  "/add-payment",
  isAuthenticatedUser,
  upload.single("receipt"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentDate, receivedAmount, remarks, dealId } = req.body;
      const { id: userId, organizationId } = (req as any).user;

      const filename = (req as any).file ? (req as any).file.filename : null;

      const payment = await prisma.payment.create({
        data: {
          paymentDate: new Date(paymentDate),
          receivedAmount: parseFloat(receivedAmount),
          remarks,
          receiptImage: filename ? `uploads/receipts/${filename}` : null,
          organizationId,
          dealId,
        },
      });

      return res.status(201).json({
        status: { success: true, message: "Payment Added" },
        payment,
      });
    } catch (error) {
      return res.status(500).json({
        status: {
          success: false,
          message: error.message || "An unknown error occurred.",
        },
      });
    }
  }
);

route.put(
  "/edit-payment/:paymentId",
  isAuthenticatedUser,
  upload.single("receipt"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.params;
      const { paymentDate, receivedAmount, remarks, dealId } = req.body;
      const { id: userId, organizationId } = (req as any).user;

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return res.status(404).json({
          status: {
            success: false,
            message: "Payment not found",
          },
        });
      }

      if (payment.organizationId !== organizationId) {
        return res.status(403).json({
          status: {
            success: false,
            message: "Unauthorized to edit this payment",
          },
        });
      }

      const paymentStatus = "PENDING";

      const filename = (req as any).file ? (req as any).file.filename : null;

      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymentDate: paymentDate
            ? new Date(paymentDate)
            : payment.paymentDate,
          receivedAmount: receivedAmount
            ? parseFloat(receivedAmount)
            : payment.receivedAmount,
          remarks: remarks || payment.remarks,
          receiptImage: filename
            ? `uploads/receipts/${filename}`
            : payment.receiptImage,
          dealId: dealId || payment.dealId,
          isEdited: true,
          paymentStatus: paymentStatus,
        },
      });

      // Send a success response
      return res.status(200).json({
        status: { success: true, message: "Payment Updated" },
        data: updatedPayment,
      });
    } catch (error) {
      return res.status(500).json({
        status: {
          success: false,
          message: error.message || "An unknown error occurred.",
        },
      });
    }
  }
);

route.put(
  "/add-payment-confirmation-voucher", upload.single("receipt"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.body;
      const { organizationId } = (req as any).user;
      const filename = (req as any).file ? (req as any).file.filename : null;
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          confirmationVoucher: filename ? `uploads/receipts/${filename}` : null,
        },
      });
      return res.status(200).json({
        status: { success: true, message: "Confirmation Voucher Added" },
      });
    } catch (error) {
      return res.status(500).json({
        status: {
          success: false,
          message: error.message || "An unknown error occurred.",
        },
      });
    }
  }
);

export default route;
