const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Initialize admin in functions environment
admin.initializeApp();

// Configure SendGrid via environment variable SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  const msg = {
    to: user.email,
    from: 'no-reply@pagneshop.example.com',
    subject: `Bienvenue sur PagnéShop, ${user.displayName || ''}`,
    text: `Bonjour ${user.displayName || ''},\n\nMerci de vous être inscrit sur PagnéShop !`,
    html: `<p>Bonjour ${user.displayName || ''},</p><p>Merci de vous être inscrit sur <strong>PagnéShop</strong> !</p>`
  };
  try {
    await sgMail.send(msg);
    console.log('Welcome email sent to', user.email);
  } catch (e) {
    console.error('SendGrid error', e);
  }
});

// Example HTTPS function to confirm order and send email
exports.confirmOrder = functions.https.onCall(async (data, context) => {
  // validate auth
  if(!context.auth){ throw new functions.https.HttpsError('unauthenticated','User must be authenticated'); }
  const order = data.order;
  if(!order || !order.id) throw new functions.https.HttpsError('invalid-argument','Order required');

  // Save order server-side
  const docRef = await admin.firestore().collection('orders').add({ ...order, userId: context.auth.uid, created: admin.firestore.FieldValue.serverTimestamp() });

  // send confirmation email (SendGrid)
  const msg = {
    to: context.auth.token.email || order.email,
    from: 'no-reply@pagneshop.example.com',
    subject: `Confirmation de commande #${docRef.id}`,
    text: `Merci pour votre commande #${docRef.id}`
  };
  try{ await sgMail.send(msg); }catch(e){ console.warn('send order email err',e); }

  return { ok:true, id: docRef.id };
});
