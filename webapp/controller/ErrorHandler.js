sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (UI5Object, MessageBox, Filter, FilterOperator) {
    "use strict";

    return UI5Object.extend("com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.controller.ErrorHandler", {

        /**
         * Handles application errors by automatically attaching to the model events and displaying errors when needed.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
         * @public
         * @alias com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.controller.ErrorHandler
         */
        constructor : function (oComponent) {
            var oMessageManager = sap.ui.getCore().getMessageManager(),
                oMessageModel = oMessageManager.getMessageModel(),
                oResourceBundle = oComponent.getModel("i18n").getResourceBundle(),
                sErrorText = oResourceBundle.getText("errorText"),
                sMultipleErrors = oResourceBundle.getText("multipleErrorsText"),
                msgArr = [],
                msgString = "";

            this._oComponent = oComponent;
            this._bMessageOpen = false

            this.oMessageModelBinding = oMessageModel.bindList("/", undefined,
                [], new Filter("technical", FilterOperator.EQ, true));

            this.oMessageModelBinding.attachChange(function (oEvent) {
                var aContexts = oEvent.getSource().getContexts(),
                    aMessages = [],
                    sErrorTitle;

                if (this._bMessageOpen || !aContexts.length) {
                    return;
                }

                // Extract and remove the technical messages
                aContexts.forEach(function (oContext) {
                    aMessages.push(oContext.getObject());
                });
                // oMessageManager.removeMessages(aMessages);

                // Due to batching there can be more than one technical message. However the UX
                // guidelines say "display a single message in a message box" assuming that there
                // will be only one at a time.
                sErrorTitle = aMessages.length === 1 ? sErrorText : sMultipleErrors;
                msgString = "";
                msgArr = [];
                $.each(aMessages, function (e, r) {
                    if (r.code === "/IWBEP/CX_MGW_BUSI_EXCEPTION" || r.code === "/IWBEP/CX_MGW_TECH_EXCEPTION") {
                        aMessages.splice(e, 1);
                    } else {
                        msgArr.push(r.message);
                        // msgString = msgString + r.message + '\r\n';

                    }
                });
                
                // msgString = msgArr.join('\r\n');
                this._showServiceError(sErrorTitle, msgArr);
            }, this);

            // this.getView().setModel(oMessageManager.getMessageModel(), "message");
        },

        /**
         * Shows a {@link sap.m.MessageBox} when a service call has failed.
         * Only the first error message will be displayed.
         * @param {string} sErrorTitle A title for the error message
         * @param {string} sDetails A technical error to be displayed on request
         * @private
         */
        _showServiceError : function (sErrorTitle, sDetails) {
            this._bMessageOpen = true;
            var sResponsivePaddingClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer";            MessageBox.error(
                sErrorTitle,
                {
                    id : "serviceErrorMessageBox",
                    details: sDetails,
                    styleClass: sResponsivePaddingClasses, //this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function () {
                        this._bMessageOpen = false;
                    }.bind(this)
                }
            );
        }
    });
});