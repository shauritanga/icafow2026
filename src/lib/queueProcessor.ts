import { prisma } from "@/lib/prisma";
import { sendRegistrationConfirmation, sendAdminAlert, sendAdminWelcomeEmail, sendApprovalNotification } from "@/lib/email";
import { sendPushNotification } from "@/lib/fcm";

export async function processNotificationQueue() {
  try {
    // 1. Fetch up to 50 pending or failed (but retriable) jobs
    const jobs = await prisma.notificationJob.findMany({
      where: {
        status: "PENDING",
        retryCount: { lt: 3 }
      },
      take: 50,
      orderBy: { createdAt: "asc" }
    });

    if (jobs.length === 0) {
      return { processed: 0, total: 0 };
    }

    let processedCount = 0;

    // Pre-fetch all admins once if there are PUSH, ADMIN_ALERT, or IN_APP jobs
    let allAdmins: { id: string, email: string, fcmTokens: string[] }[] = [];
    if (jobs.some(j => j.type === "PUSH" || j.type === "IN_APP" || (j.type === "EMAIL" && (j.payload as any).action === "ADMIN_ALERT"))) {
      allAdmins = await prisma.adminUser.findMany({
        select: { id: true, email: true, fcmTokens: true }
      });
    }
    const adminFcmTokens = allAdmins.flatMap(a => a.fcmTokens).filter(Boolean);
    const adminEmails = allAdmins.map(a => a.email).filter(Boolean);

    // 2. Process each job
    for (const job of jobs) {
      try {
        let success = false;
        const payload = job.payload as any;

        if (job.type === "EMAIL") {
          if (payload.action === "USER_CONFIRMATION") {
            success = await sendRegistrationConfirmation(payload.to, payload.name, payload.typeLabel);
          } else if (payload.action === "ADMIN_ALERT") {
            success = await sendAdminAlert(adminEmails, {
              name: payload.name,
              email: payload.email,
              type: payload.typeLabel,
              reference: payload.reference,
            });
          } else if (payload.action === "ADMIN_WELCOME") {
            success = await sendAdminWelcomeEmail(payload.to, payload.name, payload.tempPassword);
          } else if (payload.action === "APPROVAL_NOTIFICATION") {
            success = await sendApprovalNotification(payload.to, payload.name, payload.typeLabel);
          }
        } 
        else if (job.type === "PUSH") {
          if (adminFcmTokens.length > 0) {
            success = await sendPushNotification(adminFcmTokens, payload.title, payload.body);
          } else {
            // No tokens yet, just mark as success to stop retrying
            success = true; 
          }
        }
        else if (job.type === "IN_APP") {
          if (allAdmins.length > 0) {
            const notifications = allAdmins.map(admin => ({
              adminId: admin.id,
              title: payload.title,
              body: payload.body,
              url: payload.url || "/admin",
            }));
            await prisma.inAppNotification.createMany({ data: notifications });
          }
          success = true;
        }

        // 3. Update the job status
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            status: success ? "COMPLETED" : "PENDING",
            retryCount: success ? job.retryCount : job.retryCount + 1,
            errorLog: success ? null : "Dispatch function returned false or timed out."
          }
        });

        if (success) processedCount++;

      } catch (jobError: any) {
        await prisma.notificationJob.update({
          where: { id: job.id },
          data: {
            retryCount: job.retryCount + 1,
            errorLog: jobError?.message || "Unknown execution error"
          }
        });
      }
    }

    return { processed: processedCount, total: jobs.length };

  } catch (error) {
    console.error("Queue Processor Error:", error);
    throw error;
  }
}
