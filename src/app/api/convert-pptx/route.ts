import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { fileDataUrl, fileName } = await request.json();

    if (!fileDataUrl) {
      return NextResponse.json(
        { success: false, error: "Missing fileDataUrl parameter" },
        { status: 400 }
      );
    }

    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY;
    if (!publicKey) {
      console.log("[ILOVEPDF SIMULATION] ILOVEPDF_PUBLIC_KEY not configured in .env.local.");
      return NextResponse.json(
        { 
          success: false, 
          error: "iLovePDF API keys not configured in .env.local. Add ILOVEPDF_PUBLIC_KEY to enable PowerPoint to PDF conversion." 
        },
        { status: 400 }
      );
    }

    console.log(`[ILOVEPDF] Starting conversion for file: ${fileName}`);

    // 1. Authenticate with iLovePDF to get a JWT token
    const authResponse = await fetch("https://api.ilovepdf.com/v1/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_key: publicKey }),
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      throw new Error(`Failed to authenticate with iLovePDF: ${errorText}`);
    }

    const { token } = await authResponse.json();

    // 2. Start conversion task using the Bearer token
    const startResponse = await fetch("https://api.ilovepdf.com/v1/start/officepdf", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!startResponse.ok) {
      const errorText = await startResponse.text();
      throw new Error(`Failed to start iLovePDF task: ${errorText}`);
    }

    const { server, task: taskId } = await startResponse.json();

    // 3. Prepare file upload
    const base64Data = fileDataUrl.split(";base64,").pop() || "";
    const fileBuffer = Buffer.from(base64Data, "base64");
    const fileBlob = new Blob([fileBuffer], { 
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" 
    });

    const formData = new FormData();
    formData.append("task", taskId);
    formData.append("file", fileBlob, fileName || "presentation.pptx");

    // Upload file
    const uploadResponse = await fetch(`https://${server}/v1/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Failed to upload file to iLovePDF: ${errorText}`);
    }

    const { server_filename: serverFilename } = await uploadResponse.json();

    // 4. Process the PDF conversion
    const processResponse = await fetch(`https://${server}/v1/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        task: taskId,
        tool: "officepdf",
        files: [
          {
            server_filename: serverFilename,
            filename: fileName || "presentation.pptx",
          },
        ],
      }),
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      throw new Error(`Failed to process iLovePDF conversion: ${errorText}`);
    }

    // Wait for the task to finish (usually synchronous for process endpoint)
    await processResponse.json();

    // 5. Download converted PDF file
    const downloadResponse = await fetch(`https://${server}/v1/download/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      throw new Error(`Failed to download converted PDF: ${errorText}`);
    }

    const pdfBuffer = await downloadResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
    const pdfDataUrl = `data:application/pdf;base64,${pdfBase64}`;

    console.log(`[ILOVEPDF] Conversion successful for: ${fileName}`);
    return NextResponse.json({
      success: true,
      pdfDataUrl,
    });

  } catch (error: unknown) {
    console.error("[ILOVEPDF ERROR] Failed to convert PowerPoint to PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to convert PPTX to PDF";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
