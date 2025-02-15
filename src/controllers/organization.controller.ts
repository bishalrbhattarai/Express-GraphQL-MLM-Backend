import prisma from "../models/index.js";
import { OrganizationType } from "../types/UserTypes.js";
import bcrypt from "bcrypt";
import { generateOTP } from "../utils/generateOTP.js";
import { otpVerification } from "../lib/mail.js";
import { isCodeExpired } from "../utils/isOTPCodeExpire.js";
import jwt from "jsonwebtoken";
import { initalData } from "../services/organizationInitalData.service.js";

// Registering Organization
export const registerOrganization = async (args: OrganizationType) => {
  try {
    const { email, password, organizationName } = args;
    if (!email || !password || !organizationName)
      return { success: false, message: "Please enter all the fields" };

    const organizationWithEmail = await prisma.organization.findUnique({
      where: { email },
    });

    if (organizationWithEmail)
      return { success: false, message: "Email already exists" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    await otpVerification({
      email,
      subject: "Verify your email",
      otp,
      organizationName,
    });

    await prisma.organization.create({
      data: {
        email,
        password: hashedPassword,
        organizationName,
      },
    });

    console.log("Code Reached")

    await prisma.organizationRegistrationOTP.create({
      data: {
        otp: otp.toString(),
        organizationEmail: email,
      },
    });
    return {
      success: true,
      message: `OTP has been sent to your email: ${email}`,
    };
  } catch (error) {
    console.log(error)
  }
};

// verify Registration OTP
export const verifyOrganizationRegistrationOtp = async (args: any) => {
  // Fetch codeData from the database by code
  const { email, otp } = args.input;
  const codeData = await prisma.organizationRegistrationOTP.findFirst({
    where: {
      otp,
      organizationEmail: email,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!codeData) {
    return { success: false, message: "Code not found" };
  }
  if (isCodeExpired(codeData.createdAt)) {
    return { success: false, message: "Code has expired" };
  }

  const organization = await prisma.organization.update({
    where: {
      email,
    },
    data: {
      isVerified: true,
    },
  });

  initalData(organization.id, organization.organizationName)

  return { success: true, message: "Registration Success" };
};

// Resend Organization OTP
export const resendOrganizationOtp = async (args: any) => {
  const { email } = args;
  const codeData = await prisma.organizationRegistrationOTP.findFirst({
    where: {
      organizationEmail: email,
    },
  });
  if (!codeData) {
    return { success: false, message: "Code not found" };
  }
  const organization = await prisma.organization.findFirst({
    where: {
      email,
    },
  });
  const newOtp = generateOTP();
  await otpVerification({
    email,
    subject: "Verify your email",
    otp: newOtp,
    organizationName: organization.organizationName,
  });
  await prisma.organizationRegistrationOTP.create({
    data: {
      otp: newOtp.toString(),
      organizationEmail: email,
    },
  });
  return { success: true, message: "OTP resent successfully" };
};

// organization login
export const organizationLogin = async (args: any) => {
  const { email, password } = args.input;
  const organization = await prisma.organization.findFirst({
    where: {
      email,
    },
  });
  if (!organization) {
    return { success: false, message: "Organization not found" };
  }
  const isValidPassword = await bcrypt.compare(password, organization.password);
  if (!isValidPassword) {
    return { success: false, message: "Invalid password" };
  }
  const token = jwt.sign(
    { organizationId: organization.id, role: "admin" },
    process.env.JWT_LOGIN_SECRET
  );
  return { success: true, token, organization, role: "admin" };
};

// Change Password
export const changeOrganizationPassword = async (args: any, orgId: any) => {
  try {
    const { oldPassword, password, confirmPassword } = args.input;

    const organization = await prisma.organization.findFirst({
      where: {
        id: orgId,
      },
    });

    if (!organization) {
      return {
        status: {
          success: false,
          message: "Organization not found"
        }
      };
    }

    const isValidPrevPw = await bcrypt.compare(
      oldPassword,
      organization.password
    );

    if (!isValidPrevPw) {
      return {
        status: {
          success: false,
          message: "Old password doesn't match",
        },
      };
    }

    if (password !== confirmPassword) {
      return {
        status: {
          success: false,
          message: "Password doesn't match",
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedOrg = await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return {
      status: {
        success: true,
        message: "Password updated successfully",
      },
      organization: updatedOrg,
    };
  } catch (error) {

    return {
      status: {
        success: false,
        message: error.message || "Failed to change password",
      },
      organization: null,
    };
  }
};

// Get Organization by ID
export const getOrgById = async (orgId) => {
  try {
    // Query the database using Prisma
    const getDetails = await prisma.organization.findFirst({
      where: {
        id: orgId, // Ensure this matches your database field
      },
      select: {
        id: true,
        email: true,
        organizationName: true,
        createdAt: true,
      },
    });

    if (!getDetails) {
      return null; // Return null if no organization is found
    }

    return {
      data: getDetails, // Return the found details directly
    };
  } catch (error) {
    console.error(error);
    throw new Error("Error retrieving organization details.");
  }
};

// Edit Organization Profile
export const editOrganizationProfile = async (args: any, orgId: string) => {
  try {
    const { organizationName, email } = args.input;

    // Check if organization exists
    const organization = await prisma.organization.findFirst({
      where: {
        id: orgId,
      },
    });

    if (!organization) {
      return {
        status: {
          success: false,
          message: "Organization not found",
        },
        data: null,
      };
    }

    // Check if new email already exists (if email is being updated)
    if (email && email !== organization.email) {
      const existingOrg = await prisma.organization.findUnique({
        where: { email },
      });

      if (existingOrg) {
        return {
          status: {
            success: false,
            message: "Email already exists",
          },
          data: null,
        };
      }
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: {
        id: orgId,
      },
      data: {
        ...(organizationName && { organizationName }),
        ...(email && { email }),
      },
    });

    return {
      status: {
        success: true,
        message: "Organization profile updated successfully",
      },
      data: updatedOrganization,
    };
  } catch (error) {
    console.error(error);
    return {
      status: {
        success: false,
        message: "An error occurred while updating the organization profile",
      },
      data: null,
    };
  }
};
