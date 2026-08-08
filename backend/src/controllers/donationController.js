const { query } = require('../db/pool');

const BANK_DETAILS = {
  bankName: 'GTBank',
  accountName: 'ACCA Tips Support',
  accountNumber: '0123456789',
};

const getBankDetails = async (req, res) => {
  res.json({ bankDetails: BANK_DETAILS });
};

const initializeDonation = async (req, res, next) => {
  try {
    const { amount, donorName, showOnWall } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }

    // For Paystack donations - in production, call Paystack API
    // For MVP, we'll simulate
    const donation = await query(
      `INSERT INTO donations (user_id, amount, method, donor_name, show_on_wall, status)
       VALUES ($1, $2, 'paystack', $3, $4, 'pending')
       RETURNING *`,
      [req.user?.id || null, amount, donorName || null, showOnWall || false]
    );

    res.json({
      message: 'Donation initiated',
      donation: donation.rows[0],
      // In production: { authorization_url: paystackResponse.data.authorization_url }
    });
  } catch (error) {
    next(error);
  }
};

const recordBankTransfer = async (req, res, next) => {
  try {
    const { amount, donorName, showOnWall } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }

    const donation = await query(
      `INSERT INTO donations (user_id, amount, method, bank_name, account_number, account_name, donor_name, show_on_wall, status)
       VALUES ($1, $2, 'bank_transfer', $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        req.user?.id || null,
        amount,
        BANK_DETAILS.bankName,
        BANK_DETAILS.accountNumber,
        BANK_DETAILS.accountName,
        donorName || null,
        showOnWall || false,
      ]
    );

    res.status(201).json({
      message: 'Bank transfer recorded. Admin will confirm upon receipt.',
      donation: donation.rows[0],
      bankDetails: BANK_DETAILS,
    });
  } catch (error) {
    next(error);
  }
};

const getDonationWall = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT donor_name, amount, created_at 
       FROM donations 
       WHERE show_on_wall = true AND status = 'confirmed'
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    res.json({ donors: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBankDetails, initializeDonation, recordBankTransfer, getDonationWall };