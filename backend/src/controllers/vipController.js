const { query } = require('../db/pool');

const VIP_PLANS = {
  weekly: { price: 5000, durationDays: 7 },
  monthly: { price: 15000, durationDays: 30 },
  yearly: { price: 120000, durationDays: 365 },
};

const getPlans = async (req, res) => {
  res.json({ plans: VIP_PLANS });
};

const initializePayment = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!plan || !VIP_PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan. Choose weekly, monthly, or yearly' });
    }

    const planDetails = VIP_PLANS[plan];
    const amount = planDetails.price;

    // In production, this would call Paystack API to initialize transaction
    // For MVP, we'll simulate the payment flow
    res.json({
      message: 'Payment initialized',
      plan,
      amount,
      currency: 'NGN',
      // In production: { authorization_url: paystackResponse.data.authorization_url, access_code: paystackResponse.data.access_code }
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference, plan } = req.body;
    if (!reference || !plan) {
      return res.status(400).json({ error: 'Reference and plan are required' });
    }

    // In production, verify with Paystack: https://api.paystack.co/transaction/verify/:reference
    // For MVP, simulate successful verification
    const planDetails = VIP_PLANS[plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planDetails.durationDays);

    await query(
      `UPDATE users SET is_vip = true, vip_plan = $1, vip_expiry = $2, updated_at = NOW() WHERE id = $3`,
      [plan, endDate, req.user.id]
    );

    // Create subscription record
    await query(
      `INSERT INTO vip_subscriptions (user_id, plan, amount, status, end_date)
       VALUES ($1, $2, $3, 'active', $4)`,
      [req.user.id, plan, planDetails.price, endDate]
    );

    res.json({
      message: 'VIP subscription activated',
      plan,
      expiry: endDate,
    });
  } catch (error) {
    next(error);
  }
};

const checkStatus = async (req, res, next) => {
  try {
    if (req.user.is_vip) {
      const now = new Date();
      const expiry = new Date(req.user.vip_expiry);
      const isExpired = now > expiry;

      if (isExpired) {
        await query(
          `UPDATE users SET is_vip = false, vip_plan = NULL, vip_expiry = NULL, updated_at = NOW() WHERE id = $1`,
          [req.user.id]
        );
        return res.json({ is_vip: false, plan: null, expiry: null, expired: true });
      }

      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return res.json({
        is_vip: true,
        plan: req.user.vip_plan,
        expiry: req.user.vip_expiry,
        daysLeft,
      });
    }

    res.json({ is_vip: false, plan: null, expiry: null });
  } catch (error) {
    next(error);
  }
};

const handlePaystackWebhook = async (req, res, next) => {
  try {
    // In production, verify Paystack webhook signature
    const event = req.body;

    if (event.event === 'charge.success') {
      const { reference, customer, amount } = event.data;
      // Find the user and activate VIP
      const userResult = await query(
        'SELECT id FROM users WHERE paystack_customer_code = $1',
        [customer.customer_code]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        // Determine plan from amount
        let plan = 'monthly';
        if (amount === VIP_PLANS.weekly.price * 100) plan = 'weekly';
        else if (amount === VIP_PLANS.yearly.price * 100) plan = 'yearly';

        const planDetails = VIP_PLANS[plan];
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + planDetails.durationDays);

        await query(
          `UPDATE users SET is_vip = true, vip_plan = $1, vip_expiry = $2, updated_at = NOW() WHERE id = $3`,
          [plan, endDate, userId]
        );
      }
    }

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, initializePayment, verifyPayment, checkStatus, handlePaystackWebhook };