import express from 'express';
import jwt from 'jsonwebtoken';
const router = express.Router();

// JWT Secret - Production'da environment variable olmalı
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-qr-key-2024';

// QR Token oluşturma endpoint'i
router.post('/generate-token', async (req, res) => {
  try {
    const { tableId } = req.body;
    
    if (!tableId) {
      return res.status(400).json({ error: 'tableId gerekli' });
    }

    // Token payload'ı
    const payload = {
      tableId: tableId,
      type: 'qr_access',
      iat: Math.floor(Date.now() / 1000), // Oluşturulma zamanı
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 saat geçerli
      iss: 'kafe-qr-system' // Issuer
    };

    // JWT token oluştur
    const token = jwt.sign(payload, JWT_SECRET);

    // Güvenli URL oluştur
    const qrUrl = `${process.env.FRONTEND_URL || 'http://164.90.236.138'}/menu?token=${token}&tableId=${tableId}`;

    res.json({
      success: true,
      token: token,
      qrUrl: qrUrl,
      expiresIn: '24h',
      tableId: tableId
    });

  } catch (error) {
    console.error('QR token oluşturma hatası:', error);
    res.status(500).json({ error: 'Token oluşturulamadı' });
  }
});

// QR Token doğrulama endpoint'i
router.post('/verify-token', async (req, res) => {
  try {
    const { token, tableId } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token gerekli' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Token türünü kontrol et
    if (decoded.type !== 'qr_access') {
      return res.status(401).json({ error: 'Geçersiz token türü' });
    }

    // TableId eşleşmesini kontrol et
    if (tableId && decoded.tableId !== tableId) {
      return res.status(401).json({ error: 'Token ve masa ID eşleşmiyor' });
    }

    // Token geçerli
    res.json({
      success: true,
      valid: true,
      tableId: decoded.tableId,
      expiresAt: new Date(decoded.exp * 1000),
      message: 'Token geçerli'
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token süresi dolmuş',
        expired: true 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Geçersiz token',
        invalid: true 
      });
    }

    console.error('Token doğrulama hatası:', error);
    res.status(500).json({ error: 'Token doğrulanamadı' });
  }
});

// Tüm masalar için toplu token oluşturma
router.post('/generate-all-tokens', async (req, res) => {
  try {
    // Masaları veritabanından al (örnek)
    const tables = [
      { id: 'masa1', name: 'Masa 1' },
      { id: 'masa2', name: 'Masa 2' },
      { id: 'masa3', name: 'Masa 3' },
      { id: 'masa4', name: 'Masa 4' },
      { id: 'masa5', name: 'Masa 5' }
    ];

    const tokenData = [];

    for (const table of tables) {
      const payload = {
        tableId: table.id,
        type: 'qr_access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
        iss: 'kafe-qr-system'
      };

      const token = jwt.sign(payload, JWT_SECRET);
      const qrUrl = `${process.env.FRONTEND_URL || 'http://164.90.236.138'}/menu?token=${token}&tableId=${table.id}`;

      tokenData.push({
        tableId: table.id,
        tableName: table.name,
        token: token,
        qrUrl: qrUrl,
        expiresIn: '24h'
      });
    }

    res.json({
      success: true,
      tokens: tokenData,
      count: tokenData.length
    });

  } catch (error) {
    console.error('Toplu token oluşturma hatası:', error);
    res.status(500).json({ error: 'Tokenlar oluşturulamadı' });
  }
});

export default router;