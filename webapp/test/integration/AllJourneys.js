sap.ui.define([
	"sap/ui/test/Opa5",
	"./arrangements/Startup",
	"./WorklistJourney",
	"./NavigationJourney"
], function (Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.view.",
		autoWait: true
	});

});