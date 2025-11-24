import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

/**
 * Email Notification Processor
 * 
 * Processes email notification jobs with high retry attempts.
 * Demonstrates exponential backoff for transient failures.
 */
@Processor('email-notifications')
export class EmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  async process(job: Job): Promise<any> {
    const { to, subject, template, data } = job.data;

    this.logger.log(`Processing email notification to ${to}: ${subject}`);

    try {
      // Simulate email sending
      // In production, this would use SendGrid or similar
      await this.sendEmail(to, subject, template, data);

      this.logger.log(`Email sent successfully to ${to}`);

      return {
        success: true,
        to,
        subject,
        sentAt: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error(`Error sending email to ${to}:`, error);

      // Check if this is the last attempt
      if (job.attemptsMade >= (job.opts.attempts || 5)) {
        this.logger.error(
          `Failed to send email to ${to} after ${job.attemptsMade} attempts`,
        );
        
        // In production, you might want to:
        // - Store failed email in database for manual retry
        // - Send alert to admin
        // - Log to error tracking service
      }

      // Throw error to trigger retry with exponential backoff
      throw error;
    }
  }

  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    data: any,
  ) {
    // Simulate email API call
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    // Simulate occasional failures for testing retry logic
    if (Math.random() < 0.1) {
      throw new Error('Simulated email service error');
    }

    this.logger.debug(`Email sent to ${to} using template ${template}`);
  }
}
