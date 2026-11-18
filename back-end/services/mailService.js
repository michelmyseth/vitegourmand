// Sends the application emails.
// For now the emails are written to the console; the SMTP transport and the
// HTML templates are configured in KAN-69 (Transactional emails).
const FRONT_URL = (process.env.FRONT_URL || 'http://localhost:8080').split(',')[0];

async function sendMail({ to, subject, text }) {
  console.log(`\n--- email to ${to} ---\nSubject: ${subject}\n\n${text}\n--- end of email ---\n`);
}

function sendSafely(mail) {
  // An email failure must never cancel the action that triggered it
  return sendMail(mail).catch((err) => console.error('Email not sent:', err.message));
}

const mails = {
  welcome: (user) => sendSafely({
    to: user.email,
    subject: 'Bienvenue chez Vite & Gourmand',
    text: `Bonjour ${user.firstName},\n\nVotre compte Vite & Gourmand est créé. `
      + `Vous pouvez dès maintenant commander nos menus : ${FRONT_URL}/menus\n\nJulie et José`,
  }),
  passwordReset: (user, link) => sendSafely({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Bonjour ${user.firstName},\n\nPour choisir un nouveau mot de passe, ouvrez ce lien (valable 1 heure) :\n${link}\n\n`
      + "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.",
  }),
  orderConfirmation: (user, order) => sendSafely({
    to: user.email,
    subject: `Confirmation de votre commande ${order.orderNumber}`,
    text: `Bonjour ${user.firstName},\n\nNous avons bien reçu votre commande ${order.orderNumber} :\n`
      + `- ${order.menuTitle} pour ${order.people} personnes\n`
      + `- le ${order.date} à ${order.time}, ${order.address}, ${order.postcode} ${order.city}\n`
      + `- total : ${order.totalPrice.toFixed(2).replace('.', ',')} €\n\n`
      + `Vous pouvez suivre, modifier ou annuler votre commande tant qu'elle n'est pas acceptée : ${FRONT_URL}/account\n\nJulie et José`,
  }),
  employeeCreated: (employee) => sendSafely({
    to: employee.email,
    subject: 'Votre compte employé Vite & Gourmand',
    text: `Bonjour ${employee.firstName},\n\nUn compte employé a été créé pour vous avec l'identifiant ${employee.email}.\n`
      + "Le mot de passe ne vous est pas envoyé par email : rapprochez-vous de l'administrateur pour l'obtenir.",
  }),
};

module.exports = { sendMail, mails, FRONT_URL };
