const { query } = require('../db/pool');

const getActiveRollovers = async (req, res, next) => {
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
        ) as days,
        (SELECT COUNT(*) FROM rollover_days WHERE rollover_id = r.id AND status = 'pass') as passed_days,
        (SELECT COUNT(*) FROM rollover_days WHERE rollover_id = r.id AND status = 'fail') as failed_days
       FROM rollovers r
       LEFT JOIN rollover_days rd ON r.id = rd.rollover_id
       WHERE r.status = 'active'
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );

    let rollovers = result.rows;
    // VIP check
    if (!req.user || !req.user.is_vip) {
      rollovers = rollovers.map(r => ({
        ...r,
        days: ['🔒 VIP content - Upgrade to view'],
        locked: true,
      }));
    }

    res.json({ rollovers });
  } catch (error) {
    next(error);
  }
};

const getRolloverById = async (req, res, next) => {
  try {
    const { id } = req.params;
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
       WHERE r.id = $1
       GROUP BY r.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rollover not found' });
    }

    const rollover = result.rows[0];
    if (rollover.is_vip && (!req.user || !req.user.is_vip)) {
      return res.status(403).json({ error: 'VIP content - Upgrade to view' });
    }

    res.json({ rollover });
  } catch (error) {
    next(error);
  }
};

const getRolloverHistory = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM rollover_days WHERE rollover_id = r.id AND status = 'pass') as passed_days,
        (SELECT COUNT(*) FROM rollover_days WHERE rollover_id = r.id AND status = 'fail') as failed_days
       FROM rollovers r
       WHERE r.status IN ('completed', 'failed')
       ORDER BY r.end_date DESC NULLS LAST, r.created_at DESC`
    );

    let rollovers = result.rows;
    if (!req.user || !req.user.is_vip) {
      rollovers = rollovers.map(r => ({
        ...r,
        days: ['🔒 VIP content - Upgrade to view'],
        locked: true,
      }));
    }

    res.json({ rollovers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActiveRollovers, getRolloverById, getRolloverHistory };