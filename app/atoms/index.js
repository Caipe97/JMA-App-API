module.exports = {
    isDateOk: function (dateString) {
          return !(isNaN(new Date(dateString)));
    }
}