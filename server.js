const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const helmet = require('helmet');

// Initialize Firebase Admin with service account key in production env
try{
  admin.initializeApp();
}catch(e){ console.warn('Firebase Admin init (local):', e.message); }

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Middleware: verify Firebase ID token
async function authMiddleware(req, res, next){
  const authHeader = req.headers.authorization || '';
  if(!authHeader.startsWith('Bearer ')) return res.status(401).json({error:'Missing token'});
  const idToken = authHeader.split('Bearer ')[1];
  try{
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  }catch(e){ res.status(401).json({error:'Invalid token'}); }
}

// Protected endpoint example: create order
app.post('/api/orders', authMiddleware, async (req,res)=>{
  const order = req.body;
  if(!order || !Array.isArray(order.items)) return res.status(400).json({error:'Invalid order'});
  try{
    const doc = await admin.firestore().collection('orders').add({ ...order, userId: req.user.uid, created: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ok:true,id:doc.id});
  }catch(e){ res.status(500).json({error:e.message}); }
});

// Admin-only example
app.get('/api/admin/stats', authMiddleware, async (req,res)=>{
  if(!req.user.admin) return res.status(403).json({error:'Forbidden'});
  // basic stats
  try{
    const ordersSnap = await admin.firestore().collection('orders').get();
    res.json({orders: ordersSnap.size});
  }catch(e){ res.status(500).json({error:e.message}); }
});

const port = process.env.PORT || 4000;
app.listen(port, ()=>console.log('Backend listening on', port));
