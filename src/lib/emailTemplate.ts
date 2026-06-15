import { db } from "./db";

/**
 * Email Template Utility for Housmata Academy
 * Generates beautiful, responsive HTML email wrappers for all outgoing messages.
 */

/**
 * Parses plain text email body into styled HTML paragraphs, cards, lists, and tables.
 */
function parseBodyToHtml(bodyText: string): string {
  // Split the body into paragraphs by double newlines or more
  const paragraphs = bodyText.split(/\n\n+/);
  
  return paragraphs
    .map((pText) => {
      const trimmed = pText.trim();
      if (!trimmed) return "";
      
      // 1. Check if greeting
      if (trimmed.startsWith("Hello ") || trimmed.startsWith("Dear ") || trimmed.startsWith("Congratulations")) {
        return `<p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 16px;">${trimmed.replace(/\n/g, "<br />")}</p>`;
      }
      
      // 2. Check if sign-off / signature block
      const signOffs = ["Best wishes,", "Best regards,", "Thank you,", "Sincerely,", "Warm regards,"];
      const isSignOff = signOffs.some((so) => trimmed.toLowerCase().startsWith(so.toLowerCase())) || 
                        trimmed.includes("Admissions Office") ||
                        trimmed.includes("Admissions Team") || 
                        trimmed.includes("Operations Team");
                        
      if (isSignOff) {
        return `<p style="font-size: 14px; color: #64748b; font-style: italic; margin-top: 24px; margin-bottom: 0; line-height: 1.5;">${trimmed.replace(/\n/g, "<br />")}</p>`;
      }
      
      // 3. Process normal paragraph line-by-line to detect and group embedded tables/lists
      const lines = trimmed.split("\n");
      let resultHtml = "";
      let currentList: string[] = [];
      
      const flushList = () => {
        if (currentList.length === 0) return "";
        
        let tableRows = "";
        currentList.forEach((line, idx) => {
          let key = "";
          let value = "";
          const cleanLine = line.trim();
          
          if (cleanLine.startsWith("-") || cleanLine.startsWith("•") || cleanLine.startsWith("*")) {
            const content = cleanLine.replace(/^[-•*]\s*/, "").trim();
            if (content.includes(":")) {
              const colonIdx = content.indexOf(":");
              key = content.substring(0, colonIdx).trim();
              value = content.substring(colonIdx + 1).trim();
            } else {
              key = "";
              value = content;
            }
          } else if (cleanLine.includes(":")) {
            const colonIdx = cleanLine.indexOf(":");
            key = cleanLine.substring(0, colonIdx).trim();
            value = cleanLine.substring(colonIdx + 1).trim();
          }
          
          // Wrap URLs in value field with beautiful inline styling
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          if (urlRegex.test(value)) {
            value = value.replace(urlRegex, '<a href="$1" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 600;">$1</a>');
          }
          
          const isLast = idx === currentList.length - 1;
          const borderStyle = isLast ? "" : "border-bottom: 1px solid #f1f5f9;";
          
          if (key) {
            tableRows += `
              <tr>
                <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #64748b; width: 130px; vertical-align: top; ${borderStyle}">${key}</td>
                <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #0f172a; vertical-align: top; ${borderStyle}">${value}</td>
              </tr>`;
          } else {
            tableRows += `
              <tr>
                <td colspan="2" style="padding: 10px 0; font-size: 13px; font-weight: 500; color: #334155; vertical-align: top; ${borderStyle}">${value}</td>
              </tr>`;
          }
        });
        
        currentList = [];
        return `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 6px 18px; margin: 16px 0; box-shadow: inset 0 1px 2px rgba(0,0,0,0.01);">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              ${tableRows}
            </table>
          </div>`;
      };
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          resultHtml += flushList();
          continue;
        }
        
        const startsWithBullet = trimmedLine.startsWith("-") || trimmedLine.startsWith("•") || trimmedLine.startsWith("*");
        const isKeyValue = trimmedLine.includes(":") && 
                            trimmedLine.indexOf(":") < 30 && 
                            !trimmedLine.startsWith("http");
                            
        const isListItem = startsWithBullet || isKeyValue;
        
        if (isListItem) {
          currentList.push(line);
        } else {
          resultHtml += flushList();
          
          let htmlContent = trimmedLine;
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          htmlContent = htmlContent.replace(urlRegex, '<a href="$1" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 600;">$1</a>');
          
          resultHtml += `<p style="margin-top: 0; margin-bottom: 12px;">${htmlContent}</p>`;
        }
      }
      
      resultHtml += flushList();
      return resultHtml;
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates the complete HTML page wrapper for the email.
 * 
 * @param subject Email subject line
 * @param bodyText Plain text body of the email
 * @param recipient Recipient email address
 * @param origin Optional HTTP origin to resolve dynamic URLs
 */
export function generateEmailHtml(
  subject: string,
  bodyText: string,
  recipient: string,
  origin?: string
): string {
  // Use production domain for public image assets, fallback to request origin if testing locally
  const siteUrl = origin && origin.includes("localhost") ? origin : "https://academy.housmata.com";
  const logoUrl = `${siteUrl}/logo-light.png`;
  const currentYear = new Date().getFullYear();
  
  // Find recipient profile to construct passwordless token link
  const profile = db.getProfileByEmail(recipient);
  const loginUrl = profile 
    ? `${siteUrl}/lms/login?token=${profile.id}`
    : `${siteUrl}/lms/login`;

  // Update any occurrence of the login link in the plain text body to use the token URL
  let updatedBodyText = bodyText.replace(/https:\/\/academy\.housmata\.com\/lms\/login/g, loginUrl);
  
  // Replace "please log in" and "log in" with placeholders in the plain text body
  updatedBodyText = updatedBodyText.replace(/please log in/gi, "__PLEASE_LOGIN_LINK__");
  updatedBodyText = updatedBodyText.replace(/log in/gi, "__LOGIN_LINK__");

  // Format the text body into responsive styled components
  let formattedContent = parseBodyToHtml(updatedBodyText);
  
  // Replace placeholders with clean HTML links
  const loginLinkHtml = `<a href="${loginUrl}" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 700;"><b>please log in</b></a>`;
  const plainLoginLinkHtml = `<a href="${loginUrl}" target="_blank" style="color: #10b981; text-decoration: underline; font-weight: 700;"><b>log in</b></a>`;
  
  formattedContent = formattedContent.replace(/__PLEASE_LOGIN_LINK__/g, loginLinkHtml);
  formattedContent = formattedContent.replace(/__LOGIN_LINK__/g, plainLoginLinkHtml);
  
  // Extract the first link to create a beautiful, primary CTA button at the bottom of the card
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = updatedBodyText.match(urlRegex);
  let ctaButtonHtml = "";
  
  if (match && match[0]) {
    // Clean trailing punctuation
    let primaryUrl = match[0].replace(/[.,;)]+$/, "");
    let btnLabel = "Access Portal";
    
    if (primaryUrl.includes("/lms/login")) {
      primaryUrl = loginUrl;
      btnLabel = "Log In to LMS";
    } else if (primaryUrl.includes("/verify")) {
      btnLabel = "Verify Certificate";
    } else if (primaryUrl.includes("zoom.us") || primaryUrl.includes("meet.google") || primaryUrl.includes("meeting")) {
      btnLabel = "Join Live Class";
    } else if (primaryUrl.includes("/curriculum")) {
      btnLabel = "View Curriculum";
    }
    
    ctaButtonHtml = `
      <div style="margin: 32px 0 16px 0; text-align: center;">
        <a href="${primaryUrl}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 36px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25); text-align: center; min-width: 160px;">
          ${btnLabel}
        </a>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #0f172a;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Email Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 40px -10px rgba(15, 23, 42, 0.04);">
          
          <!-- Top Accent Brand Color Bar -->
          <tr>
            <td style="background-color: #10b981; height: 6px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Header (Brand Logo) -->
          <tr>
            <td style="padding: 32px 40px 24px 40px; text-align: center; border-bottom: 1px solid #f1f5f9;">
              <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="${logoUrl}" alt="Housmata Academy Logo" width="180" style="border: 0; display: block; margin: 0 auto; max-width: 100%; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Email Content Area -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              
              <!-- Subject Headline -->
              <h1 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 800; line-height: 1.35; color: #0f172a; letter-spacing: -0.02em;">
                ${subject}
              </h1>

              <!-- Dynamic Parsed Paragraphs & Layout Components -->
              <div style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0;">
                ${formattedContent}
              </div>

              <!-- Primary CTA Button -->
              ${ctaButtonHtml}

            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                Housmata Academy
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                Empowering practitioners via real-world simulated curriculums.<br />
                Admissions & Operations Department
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.4;">
                This email was sent to <a href="mailto:${recipient}" style="color: #94a3b8; text-decoration: underline;">${recipient}</a>.<br />
                &copy; ${currentYear} Housmata Academy. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
