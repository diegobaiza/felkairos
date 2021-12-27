import nodemailer from 'nodemailer';

const Mailer = nodemailer.createTransport({
  name: '',
  host: '',
  port: 465,
  secure: true,
  auth: {
    user: '',
    pass: ''
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export default Mailer;