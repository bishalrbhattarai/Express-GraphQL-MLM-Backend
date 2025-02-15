import path from "path";
import { createWriteStream } from "fs";
import { finished } from "stream/promises";
// import { FileUpload } from "graphql-upload-minimal";
import fs from "fs"

export const fileUpload = async (filePromise: Promise<any> /** Promise<FileUpload> */ ) => {
    const { filename, mimetype, encoding, createReadStream } = await filePromise;
    if (!filename) {
      throw new Error("File details are missing or improperly formatted.");
    }
  
    const uniqueFilename = `${Date.now()}-${filename}`;
    const uploadDir = path.join(process.cwd(), "uploads/payment");
    const filePath = path.join(uploadDir, uniqueFilename);
  
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  
    const stream = createReadStream();
    const out = createWriteStream(filePath);
    stream.pipe(out);
    await finished(out);
  
    const url = `uploads/payment/${uniqueFilename}`;
    return { uniqueFilename, mimetype, encoding, url };
  };