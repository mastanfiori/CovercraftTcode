sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "com/covercraft/NTTData/ProdOrdCnfrmPrcs/covercraftpp/model/LogicHelper",
    "com/covercraft/NTTData/ProdOrdCnfrmPrcs/covercraftpp/model/Constants"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, oMsgToast, oMsgBox, Fragment, oLogicHelper, oConstants) {
    "use strict";
    var i18n, sPath, oDataModel, regFloatExp = /^(?:[1-9]\d*|0)?(?:\.\d+)?$/gm, regIntExp = /^[0-9]{1,10}$/g, errorCount = 0, errorCount1 = 0, errorCount2 = 0, OpenQty = 0, StartPrcFlag = false, OpenOprQty = 0;
    return BaseController.extend("com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.controller.Worklist", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            //Set text here

            this._setTextComponents();
            // debugger;
            var userInfo = sap.ushell.Container.getService("UserInfo");
            this.startId = userInfo.getId();
            this.finishId = userInfo.getId();


            //Fetch i18n Model
            i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            oDataModel = this.getOwnerComponent().getModel();
            //start process fragment loading.
            if (!this._startProcessDialog) {

                this._startProcessDialog = this.loadFragment({
                    name: "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.StartProcess"
                });
            }
            //fiish process fragment loading.
            if (!this._finishProcessDialog) {
                this._finishProcessDialog = this.loadFragment({
                    name: "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.FinishProcess"
                });
            }
            // if (!this._valueHelpDialogActivity) {
            //     this._valueHelpDialogActivity = this.loadFragment({
            //         name: "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.ProdOrdOperationActivityTableF4"
            //     });
            // }
            //cols for prod order cols
            this._setProdOrderF4DialogCols();
            //set JSON model for start process
            this._setStartProcessJSONModel();
            //set JSON model for finish process
            this._setFinishProcessJSONModel();
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when a icon tab bar selected
         * @param {sap.ui.base.Event} oEvent icon tab bar selectionChange event
         * @public
         */
        onIconTabSelection: function (oEvent) {
            // debugger;
            var selectedTabKey = oEvent.getParameters().selectedKey;
            var obj = "";

            switch (selectedTabKey) {
                case oConstants.iconTabBar_StartProcess:
                    // this.getView().byId("Save1").setVisible(true);
                    // this.getView().byId("so.upload.btnnSave").setVisble(false);
                    obj = this._getStartProcessJSONObject();
                    this.getView().getModel("startProcessModel").setData(obj);
                    this.getView().getModel("startProcessModel").refresh();
                    // if(selectedTabKey === "StartProcess"){
                    //     this.getView().byId("Save1").setVisible(true);
                    //     this.getView().byId("Save8").setVisible(false);
                    // }
                            break;
                case oConstants.iconTabBar_FinishProcess:
                    // if(selectedTabKey === "FinishProcess"){
                    //     this.getView().byId("Save1").setVisible(false);
                    //     this.getView().byId("Save8").setVisible(true);
                    // }
                    // this.getView().byId("so.upload.btnSave").setVisble(false);
                    obj = this._getFinishProcessJSONObject();
                    this.getView().getModel("finishProcessModel").setData(obj);
                    this.getView().getModel("finishProcessModel").refresh();
                    
                    break;
                default:
                    return;
            }
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },


        /**
          * Event handler of prod order value help
          * @param {oEvt} Event Handle for prod order input
          * @public
          */
        onProdOrdF4: function (oEvt) {
            this.inputId = oEvt.getSource().getId();
            this.prodOrdInput = oEvt.getSource();
            this._oBasicSearchField = new sap.m.SearchField({
                showSearchButton: false
            });

            var aCols = this.oColModelforMaterialF4.getData().cols;
            // create value help dialog
            this._valueHelpDialogProdOrder = sap.ui.xmlfragment(
                "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.ProdOrderF4HelpDialog",
                this
            );
            this.getView().addDependent(this._valueHelpDialogProdOrder);
            this._valueHelpDialogProdOrder.getFilterBar().setBasicSearch(false);
            this._valueHelpDialogProdOrder.getTableAsync().then(function (oTable) {
                oTable.setModel(this.oProductsModel);
                oTable.setSelectionMode("Single");
                oTable.setModel(this.oColModelforMaterialF4, "columns");
                var aFilters = [];
                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", {
                        path: "/VL_SH_ORDEA",
                        // filters: aFilters
                    });
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", {
                        path: "/VL_SH_ORDEA",
                        template: function () {
                            return new sap.m.ColumnListItem({
                                cells: aCols.map(function (column) {
                                    return new sap.m.Label({
                                        text: "{" + column.template + "}"
                                    });
                                })
                            });
                        }
                        // filters: aFilters
                    });
                }
                // this._filterTable.update();
            }.bind(this));
            // }
            this._valueHelpDialogProdOrder.open();
        },

        onPersNoF4: function (oEvent) {
            if (!this._valueHelpDialogPerson) {
                this._valueHelpDialogPerson = sap.ui.xmlfragment(
                    "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.PersonalNum",
                    this
                );
                this.getView().addDependent(this._valueHelpDialogPerson);
            }
            this._valueHelpDialogPerson.open();
        },


        onFinishPersNoF4: function(oEvent){
            if (!this._valueHelpDialogFinishPerson) {
                this._valueHelpDialogFinishPerson = sap.ui.xmlfragment(
                    "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.FinishPerson",
                    this
                );
                this.getView().addDependent(this._valueHelpDialogFinishPerson);
            }
            this._valueHelpDialogFinishPerson.open();
        },

        _handlePersonValueHelpConfirm: function (oEvent) {
            // debugger;
            this.personActivityInput = oEvent.getSource();
            var oSelectedPerson = oEvent.getParameter("selectedItem");
            var sPersonValue = oSelectedPerson.getTitle();
            // if (this.personActivityInput.getName() === oConstants.startPrcPersNo){
            this.getView().getModel("startProcessModel").setProperty("/PersNo", sPersonValue);
            // }
            // else if (this.personActivityInput.getName()  === oConstants.finishPrcPersNo) {
            // this.getView().getModel("finishProcessModel").setProperty("/PersNo", sPersonValue);
            // }

        },

        _handleFinishPersonValueHelpConfirm : function(oEvent){
            // this.personActivityInput = oEvent.getSource();
            var oSelectedFinishPerson = oEvent.getParameter("selectedItem");
            var sPersonFinishValue = oSelectedFinishPerson.getTitle();
            this.getView().getModel("finishProcessModel").setProperty("/PersNo", sPersonFinishValue);
        },
        /**
        * Event handler of prod order change
        * @param {oEvt} Event Handle for prod order input
        * @public
        */
        onProdOrderChange: function (oEvt) {
            // debugger;
            StartPrcFlag = true;
            var oVal = oEvt.getSource().getValue();
            this._oSource = oEvt.getSource();
            //check if given material is valid to DB or not
            sPath = "/VL_SH_ORDEA";
            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter("AUFNR", sap.ui.model.FilterOperator.EQ, oVal));
            sap.ui.core.BusyIndicator.show();
            oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                .then(function (response) {
                    StartPrcFlag = false;
                    sap.ui.core.BusyIndicator.hide();
                    if (this._oSource.getName() === oConstants.StartProdOrd) {
                        if (response.results.length > 0) {

                            this._oSource.setValue(response.results[0].AUFNR);
                            this.getView().getModel("startProcessModel").setProperty("/ProdOrd", response.results[0].AUFNR);
                            this.getView().getModel("startProcessModel").setProperty("/formEditable", true);
                        } else {
                            this._oSource.setValue("");
                            oMsgToast.show(i18n.getText("enterValidProdOrder"));
                            this.getView().getModel("startProcessModel").setProperty("/formEditable", false);
                        }
                    } else if (this._oSource.getName() === oConstants.FinishProdOrd) {
                        if (response.results.length > 0) {
                            this._oSource.setValue(response.results[0].AUFNR);
                            this.getView().getModel("finishProcessModel").setProperty("/ProdOrd", response.results[0].AUFNR);
                            this.getView().getModel("finishProcessModel").setProperty("/formEditable", true);
                        } else {
                            this._oSource.setValue("");
                            oMsgToast.show(i18n.getText("enterValidProdOrder"));
                            this.getView().getModel("finishProcessModel").setProperty("/formEditable", false);
                        }
                    }

                }.bind(this))
                .catch(function (error) {
                    StartPrcFlag = false;
                    sap.ui.core.BusyIndicator.hide();
                    // that.ErrorHandling(error);
                });
        },
        /**
          * Event handler of prod order operation value help
          * @param {oEvt} Event Handle for prod order operation input
          * @public
          */
        onProdOrdOprF4: function (oEvt) {
            this.prodOrdActivityInput = oEvt.getSource();
            sPath = "/PRDORD_OPR_GETSet";
            var aFilters = [];
            var iconTabSelectedKey = this.getView().byId(oConstants.iconTabBarID).getSelectedKey();
            var prdOrder = "";
            if (iconTabSelectedKey === oConstants.iconTabBar_StartProcess) {
                prdOrder = this.getView().getModel("startProcessModel").getProperty("/ProdOrd");
            } else {
                prdOrder = this.getView().getModel("finishProcessModel").getProperty("/ProdOrd");
            }
            aFilters.push(new sap.ui.model.Filter("ProdOrd", sap.ui.model.FilterOperator.EQ, prdOrder));
            sap.ui.core.BusyIndicator.show();
            oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                .then(function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    // create value help dialog
                    if (!this._valueHelpDialogActivity) {
                        this._valueHelpDialogActivity = sap.ui.xmlfragment(
                            "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.ProdOrdOperationActivityTableF4",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogActivity);
                    }
                    var oActivityModel = new JSONModel();
                    oActivityModel.setData(response.results);
                    this.getView().setModel(oActivityModel, "PrdOrdActivityData");
                    this._valueHelpDialogActivity.open();
                }.bind(this))
                .catch(function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    // that.ErrorHandling(error);
                });

        },
        /**
         * Event handler of Plant value help
         * @param {oEvt} Event Handle for Plant operation input
         * @public
         */
        onPlantF4: function () {
            // create value help dialog
            if (!this._valueHelpDialogPlant) {
                this._valueHelpDialogPlant = sap.ui.xmlfragment(
                    "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.PlantF4",
                    this
                );
                this.getView().addDependent(this._valueHelpDialogPlant);
            }
            this._valueHelpDialogPlant.open();
        },
        /**
          * Event handler Start Proccess Prod Ord Scan
          * @param {oEvt} Event Handle for scan button
          * @public
          */
        onProdOrdScanSuccess: function (oEvt) {
            var oPrdOrder = this.getView().byId("idProdOrd");
            oPrdOrder.setValue(oEvt.getParameters().text);
            oPrdOrder.fireChange();
        },
        /**
          * Event handler Finish Proccess Prod Ord Scan
          *@param {oEvt} Event Handle for scan button
          *  @public
          */
        onProdOrdScanFPSuccess: function (oEvt) {
            var oPrdOrder = this.getView().byId("idProdOrdfp");
            oPrdOrder.setValue(oEvt.getParameters().text);
            oPrdOrder.fireChange();
        },

        /**
          * Event handler start Personal num Scan
          *@param {oEvt} Event Handle for scan button
          *  @public
          */
        onPersNoScanSuccess: function (oEvt) {
            var oPernum = this.getView().byId("idPersNo");
            oPernum.setValue(oEvt.getParameters().text);
            oPernum.fireChange();
        },
        /**
          * Event handler Finish Personal num Scan
          *@param {oEvt} Event Handle for scan button
          *  @public
          */
        onPersNoFPScanSuccess: function (oEvt) {
            var oPernum = this.getView().byId("idPersNofp");
            oPernum.setValue(oEvt.getParameters().text);
            oPernum.fireChange();
        },
        /**
          * Event handler reason F4
          *@param {oEvt} Event Handle Input
          *  @public
          */
        onReasonF4: function (oEvt) {
            // this.prodOrdActivityInput = oEvt.getSource();
            sPath = "/RmanPrspReasonShlpSet";
            var aFilters = [];
            var plant = this.getView().getModel("finishProcessModel").getProperty("/Plant");
            aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, plant));
            sap.ui.core.BusyIndicator.show();
            oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                .then(function (response) {
                    sap.ui.core.BusyIndicator.hide();
                    // create value help dialog
                    if (!this._valueHelpDialogReason) {
                        this._valueHelpDialogReason = sap.ui.xmlfragment(
                            "com.covercraft.NTTData.ProdOrdCnfrmPrcs.covercraftpp.fragments.ReasonF4",
                            this
                        );
                        this.getView().addDependent(this._valueHelpDialogReason);
                    }
                    var oReasonCodes = new JSONModel();
                    oReasonCodes.setData(response.results);
                    this.getView().setModel(oReasonCodes, "FinishPrcReasonCodes");
                    this._valueHelpDialogReason.open();
                }.bind(this))
                .catch(function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    // that.ErrorHandling(error);
                });
        },
        /**
          * Event handler start process change 
          *@param {oEvt} Event Handle Input
          *  @public
          */
        onStartProcessFormInputChange: function (oEvt) {
            StartPrcFlag = true;
            sap.ui.core.BusyIndicator.show();
            this._oSource = oEvt.getSource();
            var oName = oEvt.getSource().getName();
            var oVal = oEvt.getSource().getValue();
            var aFilters = [];
            var startPrcData = this.getView().getModel("startProcessModel").getData();
            switch (oName) {
                case oConstants.startPrcPlant:
                    sPath = "/VL_SH_H_T001W";
                    aFilters = [];
                    aFilters.push(new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.EQ, oVal));
                    sap.ui.core.BusyIndicator.show();
                    oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                        .then(function (response) {
                            StartPrcFlag = false;
                            sap.ui.core.BusyIndicator.hide();
                            if (response.results.length > 0) {
                                this._oSource.setValue(response.results[0].WERKS);
                            } else {
                                this._oSource.setValue("");
                                this.getView().getModel("startProcessModel").setProperty("/Plant", "");
                                oMsgToast.show(i18n.getText("enterValidPlant"));
                            }
                        }.bind(this))
                        .catch(function (error) {
                            StartPrcFlag = false;
                            sap.ui.core.BusyIndicator.hide();
                            // that.ErrorHandling(error);
                        });
                    break;
                case oConstants.startPrcWrkCenter:
                    StartPrcFlag = false;
                    break;
                case oConstants.startPrcPersNo:
                    sap.ui.core.BusyIndicator.show();
                    sPath = "/PRDORD_GET_PRSNL_IDSet(PersNo='" + oVal + "',ProdOrd='" + startPrcData.ProdOrd + "',ProdOrdOpr='" + startPrcData.ProdOrdOpr + "',Flag='S')";
                    aFilters = [];
                    // aFilters.push(new sap.ui.model.Filter("PersNo", sap.ui.model.FilterOperator.EQ, oVal));
                    sap.ui.core.BusyIndicator.show();
                    oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                        .then(function (response) {
                            StartPrcFlag = false;
                            sap.ui.core.BusyIndicator.hide();
                            if (this._oSource.getName() === oConstants.startPrcPersNo) {
                                if (response.Message === "") {
                                    this._oSource.setValue(response.PersNo);
                                    this.getView().getModel("startProcessModel").setProperty("/StrtOfSetTime", formatter.timeFormatter(response.SysTime));
                                } else {
                                    this._oSource.setValue("");
                                    this.getView().getModel("startProcessModel").setProperty("/PersNo", "");
                                    oMsgToast.show(response.Message);
                                    // return;
                                }
                            }
                        }.bind(this))
                        .catch(function (error) {
                            StartPrcFlag = false;
                            sap.ui.core.BusyIndicator.hide();
                            // that.ErrorHandling(error);
                        });
                    break;
                default:
                    return;
            }
        },
        /**
          * Event handler finish process change 
          *@param {oEvt} Event Handle Input
          *  @public
          */
        onFinishProcessFormInputChange: function (oEvt) {
            this._oSource = oEvt.getSource();
            var oName = oEvt.getSource().getName();
            var oVal = oEvt.getSource().getValue();
            var finisgPrcData = this.getView().getModel("finishProcessModel").getData();
            var aFilters = [];
            switch (oName) {
                case oConstants.finishPrcPersNo:
                    // sPath = "/PRDORD_GET_PRSNL_IDSet(PersNo='" + oVal + "')";
                    sPath = "/PRDORD_GET_PRSNL_IDSet(PersNo='" + oVal + "',ProdOrd='" + finisgPrcData.ProdOrd + "',ProdOrdOpr='" + finisgPrcData.ProdOrdOpr + "',Flag='F')";
                    aFilters = [];
                    // aFilters.push(new sap.ui.model.Filter("PersNo", sap.ui.model.FilterOperator.EQ, oVal));
                    sap.ui.core.BusyIndicator.show();
                    oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                        .then(function (response) {
                            sap.ui.core.BusyIndicator.hide();
                            if (this._oSource.getName() === oConstants.finishPrcPersNo) {
                                if (response.Message === "") {
                                    this._oSource.setValue(response.PersNo);
                                    this.getView().getModel("finishProcessModel").setProperty("/FinshOfSetTime", formatter.timeFormatter(response.SysTime));
                                } else {
                                    this._oSource.setValue("");
                                    this.getView().getModel("finishProcessModel").setProperty("/PersNo", "");
                                    oMsgToast.show(response.Message);
                                }
                            }
                        }.bind(this))
                        .catch(function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            // that.ErrorHandling(error);
                        });
                    break;
                case oConstants.ReasnVar:
                    sPath = "/RmanPrspReasonShlpSet";
                    aFilters = [];
                    aFilters.push(new sap.ui.model.Filter("Grund", sap.ui.model.FilterOperator.EQ, oVal));
                    aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, finisgPrcData.Plant));
                    sap.ui.core.BusyIndicator.show();
                    oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                        .then(function (response) {
                            sap.ui.core.BusyIndicator.hide();
                            if (response.results.length > 0) {
                                this._oSource.setValue(response.results[0].Grund);
                            } else {
                                this._oSource.setValue("");
                                this.getView().getModel("finishProcessModel").setProperty("/ReasnVar", "");
                                oMsgToast.show(i18n.getText("enterValidReasnVar"));
                            }
                        }.bind(this))
                        .catch(function (error) {
                            sap.ui.core.BusyIndicator.hide();
                            // that.ErrorHandling(error);
                        });
                    break;
                default:
                    return;
            }
        },
        /**
            * Event handler finish process  decimal input change 
            *@param {oEvt} Event Handle Input
            *  @public
            */
        onFinishProcessFormDecimalInputChange: function (oEvt) {
            var oVal = oEvt.getSource().getValue();
            // debugger;
            var finisgPrcData = this.getView().getModel("finishProcessModel").getData();
            if (oVal.trim().length > 0) {
                oVal = formatter.formatFloat(oVal);
                oVal = oVal.toString();
                if (!oVal.match(regIntExp)) {
                    oEvt.getSource().setValue("0");
                    if (oEvt.getSource().getName() === oConstants.idRewrkQtyfp) {
                        this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", false);
                    }
                } else {
                    // all quanties should not be greater than Open Quantity
                    var totalQty = parseFloat(finisgPrcData.Yield) + parseFloat(finisgPrcData.ScrapQty) + parseFloat(finisgPrcData.RewrkQty);
                    if (totalQty > parseFloat(OpenOprQty)) {
                        oMsgBox.error(i18n.getText("totalQtyMsg"));
                    }
                    if (totalQty > parseFloat(OpenQty)) {
                        oEvt.getSource().setValue("0");
                        // oMsgToast.show(i18n.getText("totalQtyMsg"));
                        //Added by Mastan//
                        if (totalQty === parseFloat(OpenQty)) {
                            this.getView().getModel("finishProcessModel").setProperty("/FinalConf", true);
                        } else {
                            this.getView().getModel("finishProcessModel").setProperty("/FinalConf", false);
                        }
                        oEvt.getSource().setValue(oVal);


                        return;
                    }
                    //reason code is mandatiry if rework qty entered
                    if (oEvt.getSource().getName() === oConstants.RewrkQty) {
                        if (oVal === "0") {
                            this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", false);
                        }
                        else {
                            this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", true);
                        }
                    }
                    //reason code is mandatiry if scrap entered by Mastan

                    if (oEvt.getSource().getName() === oConstants.ScrapQty) {
                        if (oVal === "0") {
                            this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", false);
                        }
                        else {
                            this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", true);
                        }
                    }

                    //enable final confirmation
                    if (totalQty === parseFloat(OpenQty)) {
                        this.getView().getModel("finishProcessModel").setProperty("/FinalConf", true);
                    } else {
                        this.getView().getModel("finishProcessModel").setProperty("/FinalConf", false);
                    }
                    oEvt.getSource().setValue(oVal);
                }
            } else {
                oEvt.getSource().setValue("0");
                if (oEvt.getSource().getName() === oConstants.idRewrkQtyfp) {
                    this.getView().getModel("finishProcessModel").setProperty("/ReasnVarMandatory", false);
                }
            }
        },
        /**
        * Event handler for SAVE button press
        * @public
        */
        onSave: function () {

            var iconTabSelectedKey = this.getView().byId(oConstants.iconTabBarID).getSelectedKey();
            switch (iconTabSelectedKey) {
                case oConstants.iconTabBar_StartProcess:
                    this._startProcessCreate();
                    break;
                case oConstants.iconTabBar_FinishProcess:
                    this._finishProcessCreate();
                    break;
                default:
                    return;
            }

        },

      

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */
        //Start process create call 
        _startProcessCreate: function (oEvent) {
            // debugger;
            // if( StartPrcFlag){
            //     return;
            // }
            debugger;
            // this._oSource = oEvent.getSource(); 
            var startProcessData = this.getView().getModel("startProcessModel").getData();

            if (startProcessData.formEditable) {
                this._performValidations();
                if (errorCount > 1 || errorCount1 > 1) {
                    return;
                }
                sPath = "/PRDORD_GET_PRSNL_IDSet(PersNo='" + startProcessData.PersNo + "',ProdOrd='" + startProcessData.ProdOrd + "',ProdOrdOpr='" + startProcessData.ProdOrdOpr + "',Flag='S')";
                var aFilters = [];
                // aFilters.push(new sap.ui.model.Filter("PersNo", sap.ui.model.FilterOperator.EQ, oVal));
                sap.ui.core.BusyIndicator.show();
                oLogicHelper.callGETOData(oDataModel, sPath, aFilters)
                    .then(function (response) {
                        StartPrcFlag = false;
                        sap.ui.core.BusyIndicator.hide();
                        // if (this._oSource.getName() === oConstants.startPrcPersNo) {
                        if (response.Message === "") {
                            sPath = "/PRDORD_STRT_OPRSet";
                            var oEntry = {
                                "ProdOrd": startProcessData.ProdOrd,
                                "ProdOrdOpr": startProcessData.ProdOrdOpr,
                                "PersNo": startProcessData.PersNo,
                                "TimeIdNum": startProcessData.TimeIdNum,
                                "StrtOfSetDate": startProcessData.StrtOfSetDate,
                                "StrtOfSetTime": formatter.resolveTimeFormat(startProcessData.StrtOfSetTime),
                                "WrkCenter": startProcessData.WrkCenter,
                                "Plant": startProcessData.Plant,
                                "ConfrmText": startProcessData.ConfrmText
                            };
                            var oSuccess = function (oData) {
                                sap.ui.core.BusyIndicator.hide();
                                oMsgBox.success("Success");
                                this._setStartProcessJSONModel();
                            }.bind(this);
                            var oError = function (error) {
                                sap.ui.core.BusyIndicator.hide();
                                // var oXmlData = error.responseText;
                                // var oXMLModel = new sap.ui.model.json.JSONModel();
                                // oXMLModel.setJSON(oXmlData);
                            }.bind(this);
                            sap.ui.core.BusyIndicator.show();
                            this.getOwnerComponent().getModel().create(sPath, oEntry, {
                                success: oSuccess,
                                error: oError
                            });



                            //     this._oSource.setValue(response.PersNo);
                            //    this.getView().getModel("startProcessModel").setProperty("/StrtOfSetTime", formatter.timeFormatter(response.SysTime));
                        } else {
                            this._oSource.setValue("");
                            this.getView().getModel("startProcessModel").setProperty("/PersNo", "");
                            oMsgToast.show(response.Message);
                            // return;
                        }
                        // }
                    }.bind(this))
                    .catch(function (error) {
                        StartPrcFlag = false;
                        sap.ui.core.BusyIndicator.hide();
                        // that.ErrorHandling(error);
                    });


            } else {
                return;
            }
        },
        //Start Process validations
        _performValidations: function () {
            // debugger;
            var startProcessData = this.getView().getModel("startProcessModel").getData();
            errorCount = 0;
            errorCount1 = 0;
            if (startProcessData.ProdOrd === "" || startProcessData.ProdOrd === undefined) {
                errorCount += 2;
            }
            if (startProcessData.ProdOrdOpr === "" || startProcessData.ProdOrdOpr === undefined) {
                errorCount += 2;
            }
            if (startProcessData.PersNo === "" || startProcessData.PersNo === undefined) {

                errorCount += 2;
            }
            if (OpenOprQty === "" || OpenOprQty === undefined || OpenOprQty === "0 ") {
                errorCount1 += 2;

            }
            if (errorCount > 1) {
                oMsgBox.error(i18n.getText("PleaseEnterMandatoryValues"));
            }
            if (errorCount1 > 1) {
                oMsgBox.error("No Open Operation Quantity to Start Process");
            }


        },


        //Finish process create call 
        _finishProcessCreate: function () {
            debugger;
            var finishProcessData = this.getView().getModel("finishProcessModel").getData();
            if (finishProcessData.formEditable) {
                this._performFinishPrcValidations();
                if (errorCount > 1 || errorCount1 > 1) {
                    return;
                }
                sPath = "/PRDORD_FINISH_OPRSet";
                var oEntry = {
                    "ProdOrd": finishProcessData.ProdOrd,
                    "ProdOrdOpr": finishProcessData.ProdOrdOpr,
                    "PersNo": finishProcessData.PersNo,
                    "TimeIdNum": finishProcessData.TimeIdNum,
                    "StrtOfSetDate": finishProcessData.StrtOfSetDate,
                    "FinshOfSetDate": finishProcessData.FinshOfSetDate,
                    "FinshOfSetTime": formatter.resolveTimeFormat(finishProcessData.FinshOfSetTime),
                    "ConfrmText": finishProcessData.ConfrmText,
                    "Yield": finishProcessData.Yield,
                    "YieldUom": finishProcessData.YieldUom,
                    "RewrkQty": finishProcessData.RewrkQty,
                    "ScrapQty": finishProcessData.ScrapQty,
                    "ReasnVar": finishProcessData.ReasnVar,
                    "Plant": finishProcessData.Plant,
                    "FinalConf": "X"
                };
                if (finishProcessData.FinalConf) {
                    oEntry.FinalConf = "X";
                } else {
                    oEntry.FinalConf = "";
                }
                var oSuccess = function (oData) {
                    sap.ui.core.BusyIndicator.hide();
                    oMsgBox.success("Success");
                    this._setFinishProcessJSONModel();
                }.bind(this);
                var oError = function (error) {
                    sap.ui.core.BusyIndicator.hide();
                }.bind(this);
                sap.ui.core.BusyIndicator.show();
                this.getOwnerComponent().getModel().create(sPath, oEntry, {
                    success: oSuccess,
                    error: oError
                });
            } else {
                return;
            }
        },
        //Finish Process validations
        _performFinishPrcValidations: function () {
            var finishProcessData = this.getView().getModel("finishProcessModel").getData();
            var totalQty = parseFloat(finishProcessData.Yield) + parseFloat(finishProcessData.ScrapQty) + parseFloat(finishProcessData.RewrkQty);
            errorCount = 0;
            errorCount1 = 0;
            if (finishProcessData.ProdOrd === "" || finishProcessData.ProdOrd === undefined) {
                errorCount += 1;
            }
            if (finishProcessData.ProdOrdOpr === "" || finishProcessData.ProdOrdOpr === undefined) {
                errorCount += 1;
            }
            if (finishProcessData.PersNo === "" || finishProcessData.PersNo === undefined) {
                errorCount += 2;
            }
            if (parseFloat(finishProcessData.RewrkQty) > 0) {
                if (finishProcessData.ReasnVar === "" || finishProcessData.ReasnVar === undefined) {
                    errorCount += 2;
                }
            }


            //Added by MAstan//
            if (parseFloat(finishProcessData.ScrapQty) > 0) {
                if (finishProcessData.ReasnVar === "" || finishProcessData.ReasnVar === undefined) {
                    errorCount += 2;
                }
            }

            // if (totalQty > parseFloat(OpenQty)) {
            if (totalQty > OpenQty) {
                // debugger;
                // oEvt.getSource().setValue("0");
                errorCount1 += 2;
                // oMsgBox.show(i18n.getText("totalQtyMsg"));
            }

            if (totalQty > OpenOprQty) {
                // debugger;
                // oEvt.getSource().setValue("0");
                errorCount1 += 2;
                // oMsgBox.show(i18n.getText("totalQtyMsg"));
            }

            //ended by Mastan

            if (errorCount > 1) {
                oMsgBox.error(i18n.getText("PleaseEnterMandatoryValues"));
            }

            //mastan
            if (errorCount1 > 1) {
                oMsgBox.error(i18n.getText("totalQtyMsg"));
            }
        },
        //Sets the model to be referenced by the xml file for the text
        _setTextComponents: function () {
            this.getView().setModel(this.getOwnerComponent().getModel(), "labels");
        },
        //JSON model for start process
        _setStartProcessJSONModel: function () {
            var obj = this._getStartProcessJSONObject();
            // obj.PersNo = this.email;
            var ostrtProcessModel = new JSONModel();
            ostrtProcessModel.setData(obj);
            this.getView().setModel(ostrtProcessModel, "startProcessModel");
        },
        //JSON model for finish process
        _setFinishProcessJSONModel: function () {
            var obj = this._getFinishProcessJSONObject();
            // obj.PersNo = this.email;
            var ofinishProcessModel = new JSONModel();
            ofinishProcessModel.setData(obj);
            this.getView().setModel(ofinishProcessModel, "finishProcessModel");
        },
        // Local object for the Column Names for valuehelp of prod order 
        _setProdOrderF4DialogCols: function () {
            var data = {
                "cols": [{
                    "label": i18n.getText("AUFNR"), //AUFNR
                    "template": "AUFNR" // Field from the oData servie
                    // "width": "5rem"
                }, {
                    "label": i18n.getText("AUART"), //AUART
                    "template": "AUART" // Field from OData Service
                }, {
                    "label": i18n.getText("KOKRS"), // ProdSellPrice
                    "template": "KOKRS" // Field from the OData Service
                }, {
                    "label": i18n.getText("ABKRS"), // Material Substitution 
                    "template": "ABKRS" // Field from the OData Service
                }, {
                    "label": i18n.getText("KTEXT"), // Material Substitution 
                    "template": "KTEXT" // Field from the OData Service
                }]
            };
            // // create JSON model instance
            this.oColModelforMaterialF4 = new sap.ui.model.json.JSONModel();
            // // set the data for the model
            this.oColModelforMaterialF4.setData(data);

        },
        //to Handle Material F4 filter bar search
        onFilterBarSearch: function (oEvent) {
            var aFilters = [];
            var sSearchQuery = this._oBasicSearchField.getValue(),
                aSelectionSet = oEvent.getParameter("selectionSet");
            aFilters = aSelectionSet.reduce(function (aResult, oControl) {
                if (oControl.getValue()) {
                    aResult.push(new sap.ui.model.Filter({
                        path: oControl.getName(),
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: oControl.getValue()
                    }));
                }
                return aResult;
            }, []);
            if (aFilters.length === 0) {
                aFilters.push(new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter({
                            path: "KTEXT",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sSearchQuery
                        }),
                        new sap.ui.model.Filter({
                            path: "AUFNR",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sSearchQuery
                        }),
                        new sap.ui.model.Filter({
                            path: "KOKRS",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sSearchQuery
                        }),
                        new sap.ui.model.Filter({
                            path: "ABKRS",
                            operator: sap.ui.model.FilterOperator.Contains,
                            value1: sSearchQuery
                        })
                    ],
                    and: false
                }));
            }
            this._filterTable(new sap.ui.model.Filter({
                filters: aFilters,
                and: true
            }));
        },
        /**
        * Event handler of prod order value help filter search
        * @param {oEvt} Event Handle for prod order value help dialog filter search
        * @public
        */
        _filterTable: function (oFilter) {
            var oValueHelpDialog = this._valueHelpDialogProdOrder;
            oValueHelpDialog.getTableAsync().then(function (oTable) {
                if (oTable.bindRows) {
                    oTable.getBinding("rows").filter(oFilter);
                }
                if (oTable.bindItems) {
                    oTable.getBinding("items").filter(oFilter);
                }
                oValueHelpDialog.update();
            });
        },
        /**
        * Event handler of prod order value help confirm
        * @param {oEvt} Event Handle for prod order value help dialog
        * @public
        */
        _handleProdOrdValueHelpConfirm: function (oEvt) {
            var prdOrdF4Tab = oEvt.getSource().getTable();
            var selectedIndex = prdOrdF4Tab.getSelectedIndex();
            var selectedConText = "";
            if (this.prodOrdInput.getName() === oConstants.StartProdOrd) {
                if (selectedIndex != -1) {
                    selectedConText = prdOrdF4Tab.getContextByIndex(selectedIndex).getObject();
                    // this.getView().byId("idProdOrd").setValue(selectedConText.AUFNR);
                    this.getView().getModel("startProcessModel").setProperty("/ProdOrd", selectedConText.AUFNR);
                    this.getView().getModel("startProcessModel").setProperty("/formEditable", true);
                }
            } else if (this.prodOrdInput.getName() === oConstants.FinishProdOrd) {
                if (selectedIndex != -1) {
                    selectedConText = prdOrdF4Tab.getContextByIndex(selectedIndex).getObject();
                    this.getView().getModel("finishProcessModel").setProperty("/ProdOrd", selectedConText.AUFNR);
                    this.getView().getModel("finishProcessModel").setProperty("/formEditable", true);
                }
            }

            oEvt.getSource().close();
        },
        /**
        * Event handler of Activity value help search
        * @param {oEvt} Event Handle for Activity value help dialog
        * @public
        */
        _handleActivityValueHelpSearch: function (oEvt) {
            // var sValue = oEvt.getParameters().value;
            // var oFilter = new sap.ui.model.Filter(
            //     "WERKS",
            //     sap.ui.model.FilterOperator.Contains, sValue
            // );
            // oEvt.getSource().getBinding("items").filter([oFilter]);
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("ProdOrdOpr", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter([oFilter]);
        },
        /**
        * Event handler of Plant value help search
        * @param {oEvt} Event Handle for Plant value help dialog
        * @public
        */
        _handlePlantValueHelpSearch: function (oEvt) {
            var sValue = oEvt.getParameters().value;
            var oFilter = new sap.ui.model.Filter(
                "WERKS",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            oEvt.getSource().getBinding("items").filter([oFilter]);
        },
        /**
        * Event handler of Plant value help confirm
        * @param {oEvt} Event Handle for Plant value help dialog
        * @public
        */
        _handlePlantValueHelpConfirm: function (oEvt) {
            var oSelectedProduct = oEvt.getParameter("selectedItem");
            var sInputValue = oSelectedProduct.getTitle();
            this.getView().getModel("startProcessModel").setProperty("/Plant", sInputValue);
        },

        /**
* Event handler of Reason value help search
* @param {oEvt} Event Handle for Reason value help dialog
* @public
*/
        _handleReasonValueHelpSearch: function (oEvt) {
            var sValue = oEvt.getParameters().value;
            var oFilter = new sap.ui.model.Filter(
                "Grund",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            oEvt.getSource().getBinding("items").filter([oFilter]);
        },
        /**
        * Event handler of Reason value help confirm
        * @param {oEvt} Event Handle for Reason value help dialog
        * @public
        */
        _handleReasonValueHelpConfirm: function (oEvt) {
            var oSelectedProduct = oEvt.getParameter("selectedItem");
            var sInputValue = oSelectedProduct.getTitle();
            this.getView().getModel("finishProcessModel").setProperty("/ReasnVar", sInputValue);
        },
        /**
        * Event handler of prod order value help dialog close
        * @public
        */
        _handleProdOrdValueHelpDialogClose: function () {
            this._valueHelpDialogProdOrder.destroy();
        },

        /* added by Mastan*/
        _handleActivityValueHelpClose: function () {
            // this._valueHelpDialogActivity.destroy();
        },



        /**
        * Event handler of prod order Activity value help search
        * @param {oEvt} Event Handle for prod order Activity value help dialog
        * @public
        */
        _handleActivityValueHelpSearch: function (oEvt) {
            var sValue = oEvt.getParameters().value;
            var oFilter = new sap.ui.model.Filter(
                "ProdOrdOpr",
                sap.ui.model.FilterOperator.Contains, sValue
            );
            oEvt.getSource().getBinding("items").filter([oFilter]);
        },
        /**
        * Event handler of prod order Activity value help confirm
        * @param {oEvt} Event Handle for prod order Activity value help dialog
        * @public
        */
        _handleActivityValueHelpConfirm: function (oEvt) {
            // debugger;
            // var oSelectedProduct = oEvt.getParameter("selectedItem");
            // var oSelectedObject = oSelectedProduct.getBindingContext("PrdOrdActivityData").getObject();
            var oSelectedObject = oEvt.getParameters().selectedContexts[0].getObject()
            OpenQty = oSelectedObject.OpenQty;
            OpenOprQty = oSelectedObject.OpenOprQty;
            // this.prodOrdActivityInput
            var sInputValue = oSelectedObject.ProdOrdOpr;
            if (this.prodOrdActivityInput.getName() === oConstants.StartPrcProdOrdOpr) {
                this.getView().getModel("startProcessModel").setProperty("/ProdOrdOpr", sInputValue);
                this.getView().getModel("startProcessModel").setProperty("/Plant", oSelectedObject.Plant);
                this.getView().getModel("startProcessModel").setProperty("/StrtOfSetDate", oSelectedObject.SysDate);
                // this.getView().getModel("startProcessModel").setProperty("/StrtOfSetTime", formatter.timeFormatter(oSelectedObject.SysTime));
                this.getView().getModel("startProcessModel").setProperty("/WrkCenter", oSelectedObject.WrkCenter);
            } else if (this.prodOrdActivityInput.getName() === oConstants.FinishPrcProdOrdOpr) {
                this.getView().getModel("finishProcessModel").setProperty("/ProdOrdOpr", sInputValue);
                this.getView().getModel("finishProcessModel").setProperty("/FinshOfSetDate", oSelectedObject.SysDate);
                this.getView().getModel("finishProcessModel").setProperty("/Plant", oSelectedObject.Plant);
                // this.getView().getModel("finishProcessModel").setProperty("/FinshOfSetTime", formatter.timeFormatter(oSelectedObject.SysTime));

            }
        },
        /**
         * return start process JSON object
         * @private
         */
        _getStartProcessJSONObject: function () {
            var oDate = new Date();
            var obj = {
                "ProdOrd": "",
                "ProdOrdOpr": "",
                "PersNo": this.startId,
                "TimeIdNum": "",
                "StrtOfSetDate": oDate,
                "StrtOfSetDateMiniDate": oDate,
                "StrtOfSetTime": "", //oDate.toLocaleTimeString(),
                "WrkCenter": "",
                "Plant": "",
                "ConfrmText": "",
                "formEditable": false
            };
            return obj;
        },
        /**
         * return start process JSON object
         * @private
         */
        _getFinishProcessJSONObject: function () {
            var obj = {
                "ProdOrd": "",
                "ProdOrdOpr": "",
                "PersNo": this.finishId,
                "TimeIdNum": "",
                "FinshOfSetDate": new Date(),
                "FinshOfSetDateMiniDate": new Date(),
                "FinshOfSetTime": "", //new Date().toLocaleTimeString(),
                "FinalConf": false,
                "Yield": "0",
                "YieldUom": "",
                "ScrapQty": "0",
                "RewrkQty": "0",
                "ReasnVar": "",
                "ReasnVarMandatory": false,
                "Plant": "",
                "ConfrmText": "",
                "formEditable": false
            };
            return obj;
        },
        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/C_SalesDocumentItemWl".length)
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        },
        /**
   * Called when the worklist controller is instantiated.
   * @public
   */
        onExit: function () {
            // if (this._valueHelpDialogActivity) {
            //     this._valueHelpDialogActivity.destroyItems();
            //     this._valueHelpDialogActivity.destroyColumns();
            // }
        }

    });
});

