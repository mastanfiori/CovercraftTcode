sap.ui.define([], function () {
    "use strict";

    return {

        /**
         * Rounds the number unit value to 2 digits
         * @public
         * @param {string} sValue the number string to be rounded
         * @returns {string} sValue with 2 digits rounded
         */
        numberUnit: function (sValue) {
            if (!sValue) {
                return "";
            }
            return parseFloat(sValue).toFixed(2);
        },
        timeFormatter: function (time) {
            if (!time) {
            } else {
                if (time.ms !== null) {
                    var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({ pattern: "HH:mm:ss" });
                    var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
                    var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
                    return timeStr;
                }
            }
        },
        formatFloat: function (val) {
            if (!val) {
                return "0.00";
            } else if (val === "NaN") {
                val = "0.000";
                return parseFloat(val).toFixed(2);
            } else {
                return parseFloat(val).toFixed(2);
            }
        },
        resolveTimeFormat: function (time) {
            if (time.indexOf("PT") === 0) {
                return time;
            } else {
                var d = new Date("1/1/2013 " + time);
                if (isNaN(d.getDate())) {
                    return "PT00H00M00S";
                } else {
                    return "PT" + ("0" + d.getHours()).slice(-2) + "H" + ("0" + d.getMinutes()).slice(-2) + "M" + ("0" + d.getSeconds()).slice(-2) + "S";
                }
            }

        }

    };

});