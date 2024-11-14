import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_DEFAULTS } from './email.constant';
import { ReviewCreatedEvent } from 'src/review/events/review-created.event';

@Injectable()
export class EmailService {
    constructor(private readonly mailerService: MailerService) { }

    @OnEvent(ReviewCreatedEvent.name, { promisify: true, async: true })
    async sendEmail({ review, creator: user }: ReviewCreatedEvent) {


        console.log('email sending process started');

        try {

            await this.mailerService.sendMail({
                to: user.email,
                from: EMAIL_DEFAULTS.FROM_EMAIL,
                subject: EMAIL_DEFAULTS.DEFAULT_SUBJECT,
                html: ` <div>
    
    <p><b>Your annotation has been successfully saved in the DOME registry!</b></p>
       <p> <b>Thank you for your contribution!</b></p>
    <p>Here's the link to your annotation:</p>
  </div>
`+ 'https://registry.dome-ml.org/review/' + review.shortid + `
 <div>
   <p>Best Regards,</p>
    <p>DOME Registry Support team,</p>
    <p>If you're facing any problem please don't hesitate to contact us on : dome-registry@ngp-net.bio.unipd.it</p>
    
  </div>
` , });
        } catch (error) {
            console.error('Error while sending the Email:', error);
            throw new Error('failed to send the email');

        }
    }

}

