const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getDailySloka } = require('../utils/dailySloka');

exports.getDailySloka = catchAsync(async (req, res) => {
  const raw = req.query.date;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid date. Use YYYY-MM-DD.', 400, 'BAD_REQUEST');
  }
  res.json(getDailySloka(date));
});
