import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

export const uploadIdnet = async (filePath, filename) => {
  try {
    if (!filename) {
      filename = path.basename(filePath);
    }

    const stream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append("file", stream, { filename });

    const { data } = await axios.post(
      "https://file.idnet.my.id/api/upload.php",
      formData,
      { headers: formData.getHeaders() }
    );

    if (data && data.file && data.file.url) {
      return {
        error: null,
        data: data.file.url,
        info: data.file,
      };
    } else {
      return {
        error: data?.message || "IDNet upload failed",
        data: null,
      };
    }
  } catch (err) {
    return {
      error: err.message || "IDNet upload failed",
      data: null,
    };
  }
};

export const uploadLitterbox = async (filePath, filename, time = "72h") => {
  try {
    if (!filename) {
      filename = path.basename(filePath);
    }

    const stream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("time", time);
    formData.append("fileToUpload", stream, { filename });

    const { data } = await axios.post(
      "https://litterbox.catbox.moe/resources/internals/api.php",
      formData,
      { headers: formData.getHeaders() }
    );

    if (typeof data === "string" && data.startsWith("https://")) {
      return {
        error: null,
        data: data.trim(),
      };
    } else {
      return {
        error: "Litterbox upload failed",
        data: null,
      };
    }
  } catch (err) {
    return {
      error: err.message || "Litterbox upload failed",
      data: null,
    };
  }
};

export const uploadFile = async (filePath, filename, time = "72h") => {
  try {
    // Cek apakah file exists
    if (!fs.existsSync(filePath)) {
      return {
        error: "File not found",
        data: null,
        provider: null,
      };
    }

    // Coba upload ke IDNet dulu
    const idnetResult = await uploadIdnet(filePath, filename);

    if (!idnetResult.error) {
      console.log("IDNet upload successful");
      return {
        error: null,
        data: idnetResult.data,
        provider: "IDNet",
        info: idnetResult.info,
      };
    }

    console.log("IDNet failed, trying Litterbox...");
    console.log("IDNet error:", idnetResult.error);

    // Jika IDNet gagal, coba Litterbox
    const litterboxResult = await uploadLitterbox(filePath, filename, time);

    if (!litterboxResult.error) {
      console.log("Litterbox upload successful");
      return {
        error: null,
        data: litterboxResult.data,
        provider: "Litterbox",
        info: { expires: time },
      };
    }

    console.log("Both upload methods failed", { idnetResult, litterboxResult });

    // Jika kedua-duanya gagal
    return {
      error: `Upload failed: IDNet (${idnetResult.error}), Litterbox (${litterboxResult.error})`,
      data: null,
      provider: null,
    };
  } catch (err) {
    return {
      error: err.message || "Upload failed",
      data: null,
      provider: null,
    };
  }
};
