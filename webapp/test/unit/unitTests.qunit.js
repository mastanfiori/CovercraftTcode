/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/covercraft/NTTData/ProdOrdCnfrmPrcs/covercraftpp/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});