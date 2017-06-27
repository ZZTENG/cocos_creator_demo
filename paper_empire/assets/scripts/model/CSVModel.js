let CSV = require('csv');
const R = require('ramda');
let CSVModel = {
    parse: function (key, data) {
        let csv_data = {};
        let csv = CSV.parse(data, {header: true, skip: 1});
        csv_data = R.indexBy(R.prop(key), csv);
        return csv_data;
    }
};
module.exports = CSVModel;