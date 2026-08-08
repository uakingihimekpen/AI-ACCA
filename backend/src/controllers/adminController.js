const { query } = require('../db/pool');

// === ACCUMULATOR MANAGEMENT ===

const createAccumulator = async (req, res, next) => {
  try {
    const { date, tier, selections, combinedOdds, betslipCodes, publishNow } = req.body;

    if (!tier || !selections || !combinedOdds) {
      return res.status(400).json({ error: 'Tier, selections, and combined odds are required' });
    }

    const isVip = tier === 20;
    const accDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO accumulators (date, tier, selections, combined_odds, is_vip, betslip_codes, is_published, published_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        accDate,
        tier,
        JSON.stringify(selections),
        combinedOdds,
        isVip,
        JSON.stringify(betslipCodes || { bet9ja: '', sportybet: '', ixbet: '' }),
        publishNow || false,
        publishNow ? new Date() : null,
        req.user.id,
      ]
    );

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'create_accumulator', 'accumulator', $2, $3)`,
      [req.user.id, result.rows[0].id, JSON.stringify({ tier, date: accDate })]
    );

    res.status(201).json({ message: 'Accumulator created', accumulator: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateAccumulator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { selections, combinedOdds, betslipCodes, isPublished } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (selections) {
      updates.push(`selections = $${paramIndex++}`);
      values.push(JSON.stringify(selections));
    }
    if (combinedOdds) {
      updates.push(`combined_odds = $${paramIndex++}`);
      values.push(combinedOdds);
    }
    if (betslipCodes) {
      updates.push(`betslip_codes = $${paramIndex++}`);
      values.push(JSON.stringify(betslipCodes));
    }
    if (isPublished !== undefined) {
      updates.push(`is_published = $${paramIndex++}`);
      updates.push(`published_at = $${paramIndex}`);
      values.push(isPublished);
      values.push(isPublished ? new Date() : null);
      paramIndex++;
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    const result = await query(
      `UPDATE accumulators SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accumulator not found' });
    }

    res.json({ message: 'Accumulator updated', accumulator: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const gradeAccumulator = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['won', 'lost', 'void'].includes(status)) {
      return res.status(400).json({ error: 'Status must be won, lost, or void' });
    }

    const result = await query(
      `UPDATE accumulators SET status = $1, graded_by = $2, graded_at = NOW() WHERE id = $3 RETURNING *`,
      [status, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accumulator not found' });
    }

    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, 'grade_accumulator', 'accumulator', $2, $3)`,
      [req.user.id, id, JSON.stringify({ status })]
    );

    res.json({ message: `Accumulator graded as ${status}`, accumulator: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getAllAccumulators = async (req, res, next) => {
  try {
    const { status, tier, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`a.status = $${paramIndex++}`);
      values.push(status);
    }
    if (tier) {
      conditions.push(`a.tier = $${paramIndex++}`);
      values.push(parseInt(tier));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT a.*, u.name as created_by_name, g.name as graded_by_name
       FROM accumulators a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN users g ON a.graded_by = g.id
       ${whereClause}
       ORDER BY a.date DESC, a.tier ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM accumulators a ${whereClause}`,
      values
    );

    res.json({
      accumulators: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
};

// === ROLLOVER MANAGEMENT ===

const createRollover = async (req, res, next) => {
  try {
    const { program, variant, startDate } = req.body;

    if (!program || !variant) {
      return res.status(400).json({ error: 'Program and variant are required' });
    }

    const result = await query(
      `INSERT INTO rollovers (program, variant, is_vip, start_date, created_by)
       VALUES ($1, $2, true, $3, $4)
       RETURNING *`,
      [program, variant, startDate || new Date().toISOString().split('T')[0], req.user.id]
    );

    // Create the days
    const duration = program === '7day' ? 7 : 15;
    const start = new Date(startDate || new Date().toISOString().split('T')[0]);
    for (let i = 1; i <= duration; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i - 1);
      await query(
        `INSERT INTO rollover_days (rollover_id, day_number, date) VALUES ($1, $2, $3)`,
        [result.rows[0].id, i, dayDate.toISOString().split('T')[0]]
      );
    }

    res.status(201).json({ message: 'Rollover created', rollover: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateRolloverDay = async (req, res, next) => {
  try {
    const { id, dayNumber } = req.params;
    const { selections, odds, status } = req.body;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (selections) {
      updates.push(`selections = $${paramIndex++}`);
      values.push(JSON.stringify(selections));
    }
    if (odds) {
      updates.push(`odds = $${paramIndex++}`);
      values.push(odds);
    }
    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    values.push(parseInt(dayNumber));

    const result = await query(
      `UPDATE rollover_days SET ${updates.join(', ')} 
       WHERE rollover_id = $${paramIndex++} AND day_number = $${paramIndex} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rollover day not found' });
    }

    // If day is marked as fail, auto-close the rollover
    if (status === 'fail') {
      await query(
        `UPDATE rollovers SET status = 'failed' WHERE id = $1 AND status = 'active'`,
        [id]
      );
    }

    // If all days are pass, mark as completed
    if (status === 'pass') {
      const rollover = await query('SELECT program FROM rollovers WHERE id = $1', [id]);
      const duration = rollover.rows[0].program === '7day' ? 7 : 15;
      const passedDays = await query(
        `SELECT COUNT(*) FROM rollover_days WHERE rollover_id = $1 AND status = 'pass'`,
        [id]
      );
      if (parseInt(passedDays.rows[0].count) === duration) {
        await query(
          `UPDATE rollovers SET status = 'completed' WHERE id = $1`,
          [id]
        );
      }
    }

    res.json({ message: 'Rollover day updated', day: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getAllRollovers = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, 
        json_agg(
          json_build_object(
            'day_number', rd.day_number,
            'date', rd.date,
            'selections', rd.selections,
            'odds', rd.odds,
            'status', rd.status
          ) ORDER BY rd.day_number
        ) as days
       FROM rollovers r
       LEFT JOIN rollover_days rd ON r.id = rd.rollover_id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    res.json({ rollovers: result.rows });
  } catch (error) {
    next(error);
  }
};

// === DONATION MANAGEMENT ===

const getDonations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`d.status = $${paramIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT d.*, u.name as user_name, u.email as user_email
       FROM donations d
       LEFT JOIN users u ON d.user_id = u.id
       ${whereClause}
       ORDER BY d.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM donations d ${whereClause}`,
      values
    );

    res.json({
      donations: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
};

const confirmDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE donations SET status = 'confirmed', confirmed_by = $1, confirmed_at = NOW() WHERE id = $2 RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json({ message: 'Donation confirmed', donation: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// === RATING MANAGEMENT ===

const getRatings = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 100`
    );

    res.json({ ratings: result.rows });
  } catch (error) {
    next(error);
  }
};

const hideRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query(
      `UPDATE ratings SET is_hidden = true WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    res.json({ message: 'Rating hidden', rating: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// === ANALYTICS ===

const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await query('SELECT COUNT(*) FROM users');
    const vipUsers = await query('SELECT COUNT(*) FROM users WHERE is_vip = true');
    const totalAccumulators = await query('SELECT COUNT(*) FROM accumulators');
    const totalDonations = await query(
      `SELECT COUNT(*), COALESCE(SUM(amount), 0) as total_amount FROM donations WHERE status = 'confirmed'`
    );
    const totalRatings = await query('SELECT COUNT(*) FROM ratings');

    const dailyActiveUsers = await query(
      `SELECT COUNT(DISTINCT user_id) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '24 hours'`
    );

    // Most copied betslip code (based on accumulators with betslip codes)
    const topAccumulators = await query(
      `SELECT id, date, tier, combined_odds, status FROM accumulators WHERE is_published = true ORDER BY date DESC LIMIT 10`
    );

    res.json({
      users: {
        total: parseInt(totalUsers.rows[0].count),
        vip: parseInt(vipUsers.rows[0].count),
        vipConversionRate: totalUsers.rows[0].count > 0
          ? ((parseInt(vipUsers.rows[0].count) / parseInt(totalUsers.rows[0].count)) * 100).toFixed(1) + '%'
          : '0%',
      },
      accumulators: {
        total: parseInt(totalAccumulators.rows[0].count),
      },
      donations: {
        total: parseInt(totalDonations.rows[0].count),
        totalAmount: parseFloat(totalDonations.rows[0].total_amount),
      },
      ratings: {
        total: parseInt(totalRatings.rows[0].count),
      },
      dailyActiveUsers: parseInt(dailyActiveUsers.rows[0].count),
      recentAccumulators: topAccumulators.rows,
    });
  } catch (error) {
    next(error);
  }
};

// === AUDIT LOG ===

const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT al.*, u.name as user_name
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM audit_logs');

    res.json({
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    next(error);
  }
};

// === VIP PLAN MANAGEMENT ===

const updateVipPlans = async (req, res, next) => {
  try {
    const { plans } = req.body;
    // Plans are stored in memory/controller for now
    // In production, store in DB
    res.json({ message: 'VIP plans updated', plans });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccumulator,
  updateAccumulator,
  gradeAccumulator,
  getAllAccumulators,
  createRollover,
  updateRolloverDay,
  getAllRollovers,
  getDonations,
  confirmDonation,
  getRatings,
  hideRating,
  getAnalytics,
  getAuditLogs,
  updateVipPlans,
};