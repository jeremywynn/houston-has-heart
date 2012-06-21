var helpers;
helpers = function(hhh) {
  return hhh.dynamicHelpers({
    flash: function(req, res) {
      return req.flash();
    }
  });
};
module.exports = helpers;