sap.ui.define(["sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/covercraft/NTTData/ProdOrdCnfrmPrcs/covercraftpp/model/formatter",
    "com/covercraft/NTTData/ProdOrdCnfrmPrcs/covercraftpp/model/Constants"
], function (JSONModel, oMsgToast, oMsgBox, oFormatter, Constants) {
    return {
		callGETOData: function (oDataModel, sPath, oFilters) {
			return new Promise(function (resolve, reject) {
				oDataModel.read(sPath, {
					filters: oFilters,
					success: function (response) {
						resolve(response);
					},
					error: function (error) {
						reject(error);
					}
				});
			});
		},
    };

});