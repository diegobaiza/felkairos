import nodemailer from 'nodemailer';

const Mailer = nodemailer.createTransport({
  name: 'mail.creativodigital.com.gt',
  host: 'mail.creativodigital.com.gt',
  port: 465,
  secure: true,
  auth: {
    user: 'support@creativodigital.com.gt',
    pass: 'fytydd-eghgsh-adwser'
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default Mailer;