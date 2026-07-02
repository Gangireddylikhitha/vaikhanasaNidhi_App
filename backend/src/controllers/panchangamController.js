const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getPanchangam } = require('../services/panchangamService');
const { parseIstDate } = require('../utils/panchangamDate');

function parseLocationQuery(query) {
  return {
    lat: query.latitude ?? query.lat,
    lon: query.longitude ?? query.lon,
    timezone: query.timezone,
    timezoneOffset: query.timezoneOffset,
  };
}

exports.getPanchangam = catchAsync(async (req, res) => {
  const raw = req.query.date;
  const date = raw ? parseIstDate(raw.trim()) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid date. Use YYYY-MM-DD.', 400, 'BAD_REQUEST');
  }

  try {
    const result = await getPanchangam(date, parseLocationQuery(req.query));
    res.json(result);
  } catch (err) {
    if (err.message?.includes('latitude') || err.message?.includes('longitude')) {
      throw new AppError(err.message, 400, 'BAD_REQUEST');
    }
    throw err;
  }
});
