const { query } = require('../db/pool');

const submitRating = async (req, res, next) => {
  try {
    const { stars, comment } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    // Check if user already rated
    const existing = await query('SELECT id FROM ratings WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      // Update existing rating
      const result = await query(
        `UPDATE ratings SET stars = $1, comment = $2, created_at = NOW() WHERE user_id = $3 
         RETURNING *`,
        [stars, comment || null, req.user.id]
      );
      return res.json({ message: 'Rating updated', rating: result.rows[0] });
    }

    const result = await query(
      `INSERT INTO ratings (user_id, stars, comment) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.user.id, stars, comment || null]
    );

    res.status(201).json({ message: 'Rating submitted', rating: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const getRatings = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.stars, r.comment, r.created_at, u.name as user_name
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.is_hidden = false
       ORDER BY r.created_at DESC
       LIMIT 100`
    );

    const aggregate = await query(
      `SELECT 
        COUNT(*) as total,
        ROUND(AVG(stars)::numeric, 1) as average,
        SUM(CASE WHEN stars = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN stars = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN stars = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN stars = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN stars = 1 THEN 1 ELSE 0 END) as one_star
       FROM ratings 
       WHERE is_hidden = false`
    );

    res.json({
      ratings: result.rows,
      aggregate: aggregate.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRating, getRatings };