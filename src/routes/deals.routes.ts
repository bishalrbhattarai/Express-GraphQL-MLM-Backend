import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import multer from "multer";
import prisma from "../models/index.js";
import { isAuthenticatedUser } from "../middlewares/isAuthenticatedUser.js";
const route = express.Router();
import path from "path";
import { Prisma } from "@prisma/client";

const dir = 'uploads/receipts/'
if(!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Define the route to handle the POST request
route.post(
  "/add-deals",
  isAuthenticatedUser,
  upload.single('receipt'),
  async (req: Request, res: Response, next: NextFunction) => {
    const { 
      dealId, 
      clientId, 
      dealName, 
      workTypeId, 
      dealValue, 
      dealDate, 
      dueDate, 
      sourceTypeId, 
      remarks, 
      paymentDate, 
      receivedAmount, 
      paymentRemarks 
    } = req.body;
    
    const { id: userId, organizationId } = (req as any).user;

    try {
      // Validate required fields
      const requiredFields = {
        dealId,
        clientId,
        dealName,
        workTypeId,
        dealValue,
        dealDate,
        dueDate,
        sourceTypeId,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: { success: false, message: `Missing required fields: ${missingFields.join(", ")}` },
        });
      }

      const filename = (req as any).file ? (req as any).file.filename : null;
      const receiptPath = filename ? `uploads/receipts/${filename}` : null;

      const dealData = {
        dealId,
        clientId,
        dealName,
        workTypeId,
        dealValue: parseFloat(dealValue),
        dealDate: new Date(dealDate),
        dueDate: new Date(dueDate),
        sourceTypeId,
        remarks,
        userId,
        organizationId,
        Payment: {
          create: paymentDate && receivedAmount ? {
            paymentDate: new Date(paymentDate),
            receivedAmount: parseFloat(receivedAmount),
            remarks: paymentRemarks,
            receiptImage: receiptPath,
            organizationId,
          } : undefined
        }
      };

      const dealSelect = {
        id: true,
        dealId: true,
        dealName: true,
        dealValue: true,
        dealDate: true,
        dueDate: true,
        clientId: true,
        createdAt: true,
        updatedAt: true,
        remarks: true,
        sourceType: {
          select: {
            id: true,
            name: true
          }
        },
        workType: {
          select: {
            id: true,
            name: true
          }
        },
        Payment: {
          select: {
            id: true,
            paymentDate: true,
            paymentStatus: true,
            receivedAmount: true,
            remarks: true,
            isEdited: true,
            createdAt: true,
            updatedAt: true,
            editedAt: true,
            receiptImage: true,
          }
        },
        client: {
          select: {
            id: true,
            fullName: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      };

      const createDeal = async (dealId: string) => {
        return prisma.deal.create({
          data: { ...dealData, dealId },
          select: dealSelect
        });
      };

      let deal;
      try {
        deal = await createDeal(dealId);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          // Handle duplicate dealId
          const latestDeal = await prisma.deal.findFirst({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
            select: { dealId: true }
          });

          if (!latestDeal) {
            throw new Error("Could not generate new deal ID. No existing deals found.");
          }

          const parts = latestDeal.dealId.split('-');
          const lastNumber = parseInt(parts[parts.length - 1]);
          const newDealId = `${parts.slice(0, -1).join('-')}-${(lastNumber + 1).toString().padStart(3, '0')}`;
          
          deal = await createDeal(newDealId);
        } else {
          throw error;
        }
      }

      // Calculate verified payment and dues
      const verifiedPayment = deal.Payment
        .filter(payment => payment.paymentStatus === "VERIFIED")
        .reduce((total, payment) => total.plus(payment.receivedAmount), new Prisma.Decimal(0));
      
      const duesAmount = new Prisma.Decimal(deal.dealValue).minus(verifiedPayment);

      // Transform response
      const transformedDeal = {
        ...deal,
        payments: deal.Payment,
        // verifiedPayment: verifiedPayment.toNumber(),
        duesAmount: duesAmount.toNumber()
      };
      delete transformedDeal.Payment;

      return res.status(201).json({
        status: { success: true, message: "Deal added successfully!" },
        data: { deal: transformedDeal }
      });

    } catch (error: any) {
      return res.status(500).json({
        status: {
          success: false,
          message: error.message || "An unknown error occurred."
        }
      });
    }
  }
);

export default route;