const { query } = require('../db/pool');

const getTodayAccumulators = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await query(
      `SELECT * FROM accumulators 
       WHERE date = $1 AND is_published = true 
       ORDER BY tier ASC`,
      [today]
    );

    const accumulators = result.rows.map(acc => {
      if (acc.is_vip && (!req.user || !req.user.is_vip)) {
        return {
          ...acc,
          selections: ['🔒 VIP content - Upgrade to view'],
          combined_odds: acc.tier === 20 ? '🔒' : acc.combined_odds,
          betslip_codes: { bet9ja: '', sportybet: '', ixbet: '' },
          locked: true,
        };
      }
      return { ...acc, locked: false };
    });

    res.json({ accumulators });
  } catch (error) {
    next(error);
  }
};

const getAccumulatorsByDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const result = await query(
      `SELECT * FROM accumulators 
       WHERE date = $1 AND is_published = true 
       ORDER BY tier ASC`,
      [date]
    );

    const accumulators = result.rows.map(acc => {
      if (acc.is_vip && (!req.user || !req.user.is_vip)) {
        return {
          ...acc,
          selections: ['🔒 VIP content - Upgrade to view'],
          combined_odds: '🔒',
          betslip_codes: { bet9ja: '', sportybet: '', ixbet: '' },
          locked: true,
        };
      }
      return { ...acc, locked: false };
    });

    res.json({ accumulators });
  } catch (error) {
    next(error);
  }
};

const getAccumulatorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM accumulators WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Accumulator not found' });
    }

    const acc = result.rows[0];
    if (acc.is_vip && (!req.user || !req.user.is_vip)) {
      return res.status(403).json({ error: 'VIP content - Upgrade to view' });
    }

    res.json({ accumulator: acc });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { tier, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['is_published = true'];
    const values = [];
    let paramIndex = 1;

    if (tier && !isNaN(tier)) {
      conditions.push(`tier = $${paramIndex++}`);
      values.push(parseInt(tier));
    }
    if (status && ['pending', 'won', 'lost', 'void'].includes(status)) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    // Non-VIP users can't see VIP history
    if (!req.user || !req.user.is_vip) {
      conditions.push('is_vip = false');
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM accumulators WHERE ${conditions.join(' AND ')}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT * FROM accumulators 
       WHERE ${conditions.join(' AND ')} 
       ORDER BY date DESC, tier ASC 
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    );

    const accumulators = result.rows.map(acc => {
      if (acc.is_vip && (!req.user || !req.user.is_vip)) {
        return {
          ...acc,
          selections: ['🔒 VIP content - Upgrade to view'],
          combined_odds: '🔒',
          betslip_codes: { bet9ja: '', sportybet: '', ixbet: '' },
          locked: true,
        };
      }
      return { ...acc, locked: false };
    });

    res.json({
      accumulators,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        tier,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost,
        SUM(CASE WHEN status = 'void' THEN 1 ELSE 0 END) as void,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
       FROM accumulators 
       WHERE is_published = true 
       GROUP BY tier 
       ORDER BY tier`
    );

    const overall = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
       FROM accumulators 
       WHERE is_published = true AND status IN ('won', 'lost')`
    );

    const totalGraded = parseInt(overall.rows[0].won) + parseInt(overall.rows[0].lost);
    const winRate = totalGraded > 0 
      ? ((parseInt(overall.rows[0].won) / totalGraded) * 100).toFixed(1) 
      : 0;

    res.json({
      perTier: result.rows,
      overall: {
        total: parseInt(overall.rows[0].total),
        won: parseInt(overall.rows[0].won),
        lost: parseInt(overall.rows[0].lost),
        winRate: `${winRate}%`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTodayAccumulators, getAccumulatorsByDate, getAccumulatorById, getHistory, getStats };