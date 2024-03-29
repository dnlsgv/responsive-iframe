
    (function(_window) {

        // BEGIN SURVEY HELPERS

        function preprocessSurveyJSON(surveyJson) {
            console.log('[preprocessSurveyJSON]');
            let surveyPages = surveyJson.pages;
            let pagesLength = surveyPages.length;
            let convertedMatrixObjects = [];
        
            for (let i = 0; i < pagesLength; i++) {
        
                let pageQuestions = surveyPages[i].elements;
                let pageQuestionsLength = pageQuestions.length;
                
                //iterate through page questions
                for (let j = 0; j < pageQuestionsLength; j++) {
                    let currentQuestion = pageQuestions[j];
        
                    if (currentQuestion.type !== null && currentQuestion.type !== undefined) {
        
                        if (currentQuestion.type === "matrix") {
        
                            let newMatrixDropDownQuestion = {
                                type: "matrixdropdown",
                                name: currentQuestion.name,
                                title: currentQuestion.title,
                                columns: null,
                                choices: currentQuestion.columns,
                                rows: currentQuestion.rows
                            };
        
                            let concatenatedColumns = "";
        
                            for (let k = 0; k < currentQuestion.columns.length; k++) {
                                if (currentQuestion.columns[k].text === undefined) {
                                    concatenatedColumns += (currentQuestion.columns[k] + "/");
                                } else {
                                    concatenatedColumns += (currentQuestion.columns[k].text.es + "/");
                                }
                            }
        
                            newMatrixDropDownQuestion.columns = [{
                                "name": concatenatedColumns,
                                "title": {
                                    "es": concatenatedColumns
                                }
                            }];
                            
                            currentQuestion.type = "matrixdropdown"
                            currentQuestion.title = newMatrixDropDownQuestion.title;
                            currentQuestion.columns = newMatrixDropDownQuestion.columns;
                            currentQuestion.choices = newMatrixDropDownQuestion.choices;
                            currentQuestion.rows = newMatrixDropDownQuestion.rows;
        
                            convertedMatrixObjects[currentQuestion.name] = {
                                questionName: currentQuestion.name,
                                columnName: concatenatedColumns,
                                rowName: newMatrixDropDownQuestion.rows
                            };
                        }
                    }            
                }
            }
        
            for (let i = 0; i < pagesLength; i++) {
        
                let pageQuestions = surveyPages[i].elements;
                let pageQuestionsLength = pageQuestions.length;
                
                //iterate through page questions
                for (let j = 0; j < pageQuestionsLength; j++) {
                    let currentQuestion = pageQuestions[j];
        
                    transformLogicalIfPropertyTrigger(currentQuestion, convertedMatrixObjects);
        
                    if (currentQuestion.type === "matrixdropdown") {
                        // iterar sobre filas
                        if (currentQuestion.rows === null || currentQuestion.rows === undefined) {
                            continue;
                        }
        
                        let matrixRows = currentQuestion.rows;
        
                        for (let i = 0; i < matrixRows.length; i++) {
                            let currentRow = matrixRows[i];
        
                            transformLogicalIfPropertyTrigger(currentRow, convertedMatrixObjects);
                        }
                    }
                }
            }
        
            return surveyJson;
        }
        
        function detectIfBrowserIsOnMobileDevice() {
            console.log('[detectIfBrowserIsOnMobileDevice]');
            if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
                //document.write("desde un dispositivo mobil");
                return true;
            }
            //document.write("desde un navegador de PC<br>");
            return false;
        }
        
        function addLocaleToTopOfTheJSON(currentJSON) {
            if (currentJSON.hasOwnProperty('locale')) {
                currentJSON = Object.assign({"locale": currentJSON.locale}, currentJSON);
            }
            return currentJSON;
        }

        function sendDataToServer(survey) {
            /*
                Hacer post de survey.data a algun endpoint.
        
                Usar la funcion getDiffBetweenSurveyDataJSON() para ver las diferencias entre el json de respuesta normal y final.
            */
           console.log('response:');
           console.log(survey.data);
        }
        
        function addHtmlNpsEmoticonBar(options) {
            options.htmlElement.classList.add('no-padding-bottom');
            $('<div class="sv_qstn" style="padding-top: 0;"><img src="https://s3.amazonaws.com/s3-loyalink/barra_caras.png" alt="" title="" width="100%" style="display: block;" border="0"></div>').insertAfter($(options.htmlElement));    
        }

        function drawNpsQuestionWithBackgroundColor(npsHtmlElement, typeOfNpsQuestion, npsColors) {
            if (typeOfNpsQuestion !== "1" && typeOfNpsQuestion !== "2" && typeOfNpsQuestion !== "3") {
                return;
            }

            let detractors = [];
            let passives = [];
            let promotors = [];

            //NPS 0-10
            if (typeOfNpsQuestion === "1") {
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+7) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(8) span.sv_q_rating_item_text, .sv_q_rating > label.sv_q_rating_item:nth-child(9) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(10) span.sv_q_rating_item_text, .sv_q_rating > label.sv_q_rating_item:nth-child(11) span.sv_q_rating_item_text");
            }
            //NPS 1-5
            if (typeOfNpsQuestion === "2") {            
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+3) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(4) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(5) span.sv_q_rating_item_text");

            }
            // //NPS 1-7
            if (typeOfNpsQuestion === "3") {
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+5) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(6) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(7) span.sv_q_rating_item_text");
            }

            detractors.forEach(element => {
                element.style.backgroundColor = npsColors.detractorColor;
                element.style.borderColor = npsColors.detractorColor;
                element.style.color = "white";
            });

            passives.forEach(element => {
                element.style.backgroundColor = npsColors.passiveColor;
                element.style.borderColor = npsColors.passiveColor;
                element.style.color = "white";
            });

            promotors.forEach(element => {
                element.style.backgroundColor = npsColors.promotorColor;
                element.style.borderColor = npsColors.promotorColor;
                element.style.color = "white";
            });

            let style = document.createElement('style');
            
            let css = `
                #${npsHtmlElement.id} label.sv_q_rating_item.active span.sv_q_rating_item_text {
                    background: ${json.mainSurveyColor} !important;
                    color: white !important;
                }

                #${npsHtmlElement.id} label.sv_q_rating_item:hover span.sv_q_rating_item_text {
                    border-color: ${json.mainSurveyColor} !important;
                    background-color: ${json.mainSurveyColor} !important;
                }                
            `;

            if(style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(style);
        }

        function drawNpsQuestionWithBorderColor(npsHtmlElement, typeOfNpsQuestion, npsColors) {
            if (typeOfNpsQuestion !== "1" && typeOfNpsQuestion !== "2" && typeOfNpsQuestion !== "3") {
                return;
            }

            let detractors = [];
            let passives = [];
            let promotors = [];

            //NPS 0-10
            if (typeOfNpsQuestion === "1") {
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+7) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(8) span.sv_q_rating_item_text, .sv_q_rating > label.sv_q_rating_item:nth-child(9) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(10) span.sv_q_rating_item_text, .sv_q_rating > label.sv_q_rating_item:nth-child(11) span.sv_q_rating_item_text");
            }
            //NPS 1-5
            if (typeOfNpsQuestion === "2") {            
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+3) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(4) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(5) span.sv_q_rating_item_text");

            }
            // //NPS 1-7
            if (typeOfNpsQuestion === "3") {
                detractors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(-n+5) span.sv_q_rating_item_text");
                passives = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(6) span.sv_q_rating_item_text");
                promotors = npsHtmlElement.querySelectorAll(".sv_q_rating > label.sv_q_rating_item:nth-child(7) span.sv_q_rating_item_text");
            }

            detractors.forEach(element => {
                element.style.border = "1px solid " + npsColors.detractorColor;
            });

            passives.forEach(element => {
                element.style.border = "1px solid " + npsColors.passiveColor;
            });

            promotors.forEach(element => {
                element.style.border = "1px solid " + npsColors.promotorColor;
            });

            let style = document.createElement('style');
            
            let css = `
                #${npsHtmlElement.id} label.sv_q_rating_item.active span.sv_q_rating_item_text {
                    background: ${json.mainSurveyColor} !important;
                    border-color: ${json.mainSurveyColor} !important;
                    color: white !important;
                }

                #${npsHtmlElement.id} label.sv_q_rating_item:hover span.sv_q_rating_item_text {
                    border-color: ${json.mainSurveyColor} !important;
                    background-color: ${json.mainSurveyColor} !important;
                    color: white;
                }                
            `;

            if(style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(style);            
        }  
        
        function drawNpsQuestionWithBorderBottomColor(npsHtmlElement, typeOfNpsQuestion, npsColors) {
            console.log('[drawNpsQuestionWithBorderBottomColor]');
            if (typeOfNpsQuestion !== "1" && typeOfNpsQuestion !== "2" && typeOfNpsQuestion !== "3") {
                return;
            }
            //NPS 0-10
            if (typeOfNpsQuestion === "1") {
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(-n+7)").css("border-bottom", "2px solid " + npsColors.detractorColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(8), .custom-rating > .btn:nth-child(9)").css("border-bottom", "2px solid " + npsColors.passiveColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(10), .custom-rating > .btn:nth-child(11)").css("border-bottom", "2px solid " + npsColors.promotorColor);
            }
            //NPS 1-5
            if (typeOfNpsQuestion === "2") {
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(-n+3)").css("border-bottom", "2px solid " + npsColors.detractorColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(4)").css("border-bottom", "2px solid " + npsColors.passiveColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(5)").css("border-bottom", "2px solid " + npsColors.promotorColor);
            }
            //NPS 1-7
            if (typeOfNpsQuestion === "3") {
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(-n+5)").css("border-bottom", "2px solid " + npsColors.detractorColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(6)").css("border-bottom", "2px solid " + npsColors.passiveColor);
                $(npsHtmlElement).find(".custom-rating > .btn:nth-child(7)").css("border-bottom", "2px solid " + npsColors.promotorColor);                        
            }
        }  
        
        function transformLogicalIfPropertyTrigger(questionObject, convertedMatrixObjects) {
            if (questionObject.visibleIf !== null && questionObject.visibleIf !== undefined) {
                questionObject.visibleIf = transformLogicalIfPropertyToMatrixDropdownMode(questionObject.visibleIf, convertedMatrixObjects);
            }
        
            if (questionObject.requiredIf !== null && questionObject.requiredIf !== undefined) {
                questionObject.requiredIf = transformLogicalIfPropertyToMatrixDropdownMode(questionObject.requiredIf, convertedMatrixObjects);
            }
        
            if (questionObject.enableIf !== null && questionObject.enableIf !== undefined) {
                questionObject.enableIf = transformLogicalIfPropertyToMatrixDropdownMode(questionObject.enableIf, convertedMatrixObjects);
            }
        }
        
        function transformLogicalIfPropertyToMatrixDropdownMode(propertyValue, convertedMatrixObjects) {
        
            let splitByLeftBracket = propertyValue.split("{");
            let splitByRightBracket =  splitByLeftBracket.map(function(element) {
                return element.split("}");
            });
        
            splitByRightBracket = [].concat.apply([], splitByRightBracket);
        
            let filteredMatrixConditions = splitByRightBracket.filter(function(element) {
                return element.includes(".");
            });
            
            let newCondition = '';
        
            for (let i = 0; i < filteredMatrixConditions.length; i++) {
                let oldCondition = filteredMatrixConditions[i];
                let possibleMatrixConvertedName = filteredMatrixConditions[i].split(".")[0];
                let possibleMatrixConvertedRow = filteredMatrixConditions[i].split(".")[1];
        
                if (convertedMatrixObjects[possibleMatrixConvertedName] !== undefined) {
                    let currentMatrixColumnName = convertedMatrixObjects[possibleMatrixConvertedName].columnName;
                    
                    newCondition = possibleMatrixConvertedName + "." + possibleMatrixConvertedRow + "." + currentMatrixColumnName;
        
                    propertyValue = propertyValue.replace(oldCondition, newCondition);
                }
            }
        
            return propertyValue;
        }
        
        function parseResponseJSON(responseJSON) {
            let output = {};
            let globalFields = {};
        
            for (let key in responseJSON) {
                if (responseJSON.hasOwnProperty(key)) {
                    let currentSurveyQuestion = _apollo_frame.script.getQuestionByName(key);
        
                    if (currentSurveyQuestion === null || currentSurveyQuestion === undefined) {
                        continue;
                    }
        
                    let currentQuestionType = currentSurveyQuestion.getType(),
                        currentQuestionComment = (currentQuestionType === "radiogroup" || currentQuestionType === "checkbox" ? responseJSON[currentSurveyQuestion.name + "-Comment"] : null),
                        currentSurveyQuestionParsedName = (currentSurveyQuestion.parsedName === undefined ? currentSurveyQuestion.name : currentSurveyQuestion.parsedName),
                        currentSurveyQuestionResultIndex = (currentSurveyQuestion.belongsToIndexResult === undefined ? "1" : currentSurveyQuestion.belongsToIndexResult);
        
                    let formattedQuestionValue = formatQuestionValue(currentSurveyQuestion, currentQuestionComment);
        
                    if (currentSurveyQuestionResultIndex === "all") {
                        if (currentQuestionType === "matrix" || currentQuestionType === "matrixdropdown") {
                            globalFields = Object.assign(globalFields, formattedQuestionValue);
                        } else {
                            globalFields[currentSurveyQuestionParsedName] = formattedQuestionValue;
                        }
                        continue;
                    }
                    if (output["result-" + currentSurveyQuestionResultIndex] === undefined) {
                        output["result-" + currentSurveyQuestionResultIndex] = {};
                    }
        
                    if (currentQuestionType === "matrixdropdown" && currentSurveyQuestionParsedName === "b_drivers") {
                        if (currentSurveyQuestion.addExtraLeverCheckbox) {
                            if (TRACKING_B_DRIVERS_CHECKBOXES[currentSurveyQuestion.name]) {
                                continue;
                            }
                        }
                    }
        
                    if (currentQuestionType === "matrix" || currentQuestionType === "matrixdropdown") {
                        // hacer merge
                        output["result-" + currentSurveyQuestionResultIndex] = Object.assign(output["result-" + currentSurveyQuestionResultIndex], formattedQuestionValue);
                    } else {
                        output["result-" + currentSurveyQuestionResultIndex][currentSurveyQuestionParsedName] = formattedQuestionValue;
                    }
                }
            }
            // add global fields
            output = mergeGlobalFieldsWithEachResult(globalFields, output);
            return output;
        }
        
        function mergeGlobalFieldsWithEachResult(globalFields, surveyJSON) {
            for (let key in surveyJSON) {
                if (surveyJSON.hasOwnProperty(key)) {
                    surveyJSON[key] = Object.assign(surveyJSON[key], globalFields);
                }
            }
            return surveyJSON;
        }
        
        function formatQuestionValue(questionObject, questionComment) {
            if (questionObject.getType() === "radiogroup" && surveyWithLoyalinkOldCss) {
                let radiogroupQuestionFormatted = questionObject.value;
        
                if (radiogroupQuestionFormatted != null && radiogroupQuestionFormatted.includes('other')) {
                    radiogroupQuestionFormatted = radiogroupQuestionFormatted.replace("other", "Otros|" + questionComment);
                }
                return radiogroupQuestionFormatted;
            }
        
            if (questionObject.getType() === "checkbox" && surveyWithLoyalinkOldCss) {
                let includeOthers = questionObject.value.includes("other");
                let checkboxValueFormatted = '';
        
                if (includeOthers) {
                    let tempCheckboxValues = [];
                    for(let i = 0; i < questionObject.value.length; i++) {
                        if (questionObject.value[i] !== "other") {
                            tempCheckboxValues.push(questionObject.value[i]);
                        }
                    }
        
                    tempCheckboxValues.push("other");
        
                    checkboxValueFormatted = tempCheckboxValues.join('|');
                    checkboxValueFormatted = checkboxValueFormatted.replace("other", "Otros|" + questionComment);
                } else {
                    checkboxValueFormatted = questionObject.value.join('|');
                }
        
                return checkboxValueFormatted;
            }
        
            let matrixPlainValues = {};
        
            if (questionObject.getType() === "matrix" && surveyWithLoyalinkOldCss) {
                //Subir un nivel
                for(let matrixKey in questionObject.value) {
                    matrixPlainValues[matrixKey] = questionObject.value[matrixKey];
                }
                return matrixPlainValues;
            }
            
            if (questionObject.getType() === "matrixdropdown" && surveyWithLoyalinkOldCss && questionObject.isLeversSelector && questionObject.name.includes("b_drivers")) {
                let leversCodes = [];
        
                for(let matrixDropdownKey in questionObject.value) {
                    let neutralColumnIndex = (questionObject.monoLeversSelector ? 0 : 1);
                    let matrixDropdownLastLevelKey = Object.keys(questionObject.value[matrixDropdownKey])[neutralColumnIndex];
                    let questionCellCode = questionObject.value[matrixDropdownKey][matrixDropdownLastLevelKey];
                    
                    if (questionCellCode !== undefined) {
                        leversCodes.push(questionCellCode);
                    }
                }
        
                matrixPlainValues[questionObject.name] = leversCodes.join();
        
                return matrixPlainValues;
            }
        
            if (questionObject.getType() === "matrixdropdown" && surveyWithLoyalinkOldCss) {
                //Subir un nivel
                for(let matrixDropdownKey in questionObject.value) {
                    let matrixDropdownLastLevelKey = Object.keys(questionObject.value[matrixDropdownKey])[0];
        
                    matrixPlainValues[matrixDropdownKey] = questionObject.value[matrixDropdownKey][matrixDropdownLastLevelKey];
                }
                return matrixPlainValues;
            }
        
            return questionObject.value;
        }
        
        function getDiffBetweenSurveyDataJSON() {
            console.log('JSON inicial:');
            console.log(BEGIN_JSON);
            console.log('JSON final: ');
            console.log(END_JSON);
        }
        
        function validateUniqueValuesInNeutralColumn(options) {
            if (!checkIfCurrentColumnIsNeutral(options)) {
                return false;
            }
        
            return checkIfMatrixCellHasAnyError(options);
        }
        
        function checkIfCurrentColumnIsNeutral(options) {
            if (options.question.columns.length === 1) {
                return false;
            }
        
            let currentColumnTitle = options.columnName;
            let neutralColumnTitle = options.question.columns[1].title;
        
            if (currentColumnTitle === neutralColumnTitle) {
                return true;
            }
        
            return false;
        }
        
        function checkIfCurrentColumnIsMonoNeutral(options) {
            if (options.question.columns.length === 2) {
                return false;
            }
        
            let currentColumnTitle = options.columnName;
            let neutralColumnTitle = options.question.columns[0].title;
        
            if (currentColumnTitle === neutralColumnTitle) {
                return true;
            }
        
            return false;
        }
        
        function validateUniqueValuesInNeutralColumnMonoSelector(options) {
            if (!checkIfCurrentColumnIsMonoNeutral(options)) {
                return false;
            }
        
            return checkIfMatrixCellHasAnyError(options);
        }
        
        function checkIfMatrixCellHasAnyError(options) {
            let matrixCellHasErrors = false;
            let rows = options.question.visibleRows;
        
            for (let i = 0; i < rows.length; i++) {
                if (rows[i] === options.row) {
                    continue;
                }
        
                if (rows[i].value && rows[i].value[options.columnName] == options.value) {
                    matrixCellHasErrors = true;
                }
            }
        
            return matrixCellHasErrors;    
        }
        
        function verifyVerbatimExistenceOfEveryResult(responseJSON) {
            for (let key in responseJSON) {
                if (responseJSON.hasOwnProperty(key)) {
                    let resultIndex = key.split('-')[1];
                    let currentResult = responseJSON[key];
                    let verbatimKeyExists = currentResult.hasOwnProperty("b_verbatim");
                    let driversKeyExists = currentResult.hasOwnProperty("b_drivers-" + resultIndex);
        
                    if (verbatimKeyExists) {
                        if (driversKeyExists) {
                            let currentVerbatimValue = responseJSON[key]["b_verbatim"];
        
                            if (currentVerbatimValue.length <= 3) {
                                responseJSON[key]["b_verbatim"] = currentVerbatimValue + "____";
                            }
                        }
                    } else {
                        if (driversKeyExists) {
                            responseJSON[key]["b_verbatim"] = "____";
                        }
                    }
                }
            }
            return responseJSON;
        }

        // END SURVEY HELPERS
        
        // BEGIN SURVEY CONFIGURATIONS

        Survey.StylesManager.applyTheme("bootstrap");

        //Definicion de nuevas propiedades soportadas en el JSON de la encuesta
        Survey.JsonObject.metaData.addProperty("survey", {
            name: "loyalinkOldCss:switch",
            category: "general",
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("survey", {
            name: "hideHeaderAndFooterAfterResponse:switch",
            category: "general",
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("survey", {
            name: "transformMatrixToMatrixDropdownOnMobileDevices:switch",
            category: "general",
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "hasExtraQuestion:switch",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "extraQuestionText",
            category: "general",
            maxLength: 15,
            readOnly: false,
            default: "NS/NR"
            // ,
            // dependsOn: ["hasExtraQuestion"],
            // visibleIf: function(obj) {
            //     return obj.hasExtraQuestion;
            // }    
        });
        
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "typeOfNps:string",
            displayName: "Tipo de NPS",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "showNpsEmoticonBar:switch",
            category: "general",
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "showBottomBorderColors:switch",
            category: "general",
            default: false
        });

        Survey.JsonObject.metaData.addProperty("rating", {
            name: "showBorderColors:switch",
            category: "general",
            default: false
        });

        Survey.JsonObject.metaData.addProperty("rating", {
            name: "showBackgroundColors:switch",
            category: "general",
            default: false
        });

        Survey.JsonObject.metaData.addProperty("rating", {
            name: "detractorColor:color",
            displayName: "Color detractor",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "passiveColor:color",
            displayName: "Color pasivo",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("rating", {
            name: "promotorColor:color",
            displayName: "Color promotor",
            category: "general",
            default: "#53770E"
        });
        
        Survey.JsonObject.metaData.addProperty("text", {
            name: "useExternalService",
            displayName: "Usar servicio externo",
            category: "general",
            choices: function() {
                return ["salcobrand-products"];
            },    
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("survey", {
            name: "consumeExternalServices:switch",
            displayName: "Consumir servicios externos",
            category: "general",
            default: false
        });
        
        Survey.JsonObject.metaData.addProperty("question", {
            name: "belongsToIndexResult",
            category: "general"
        });
        Survey.JsonObject.metaData.addProperty("question", {
            name: "parsedName",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("matrixdropdown", {
            name: "leversEntered",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("matrixdropdown", {
            name: "isLeversSelector:switch",
            category: "general"
        });
        
        Survey.JsonObject.metaData.addProperty("matrixdropdown", {
            name: "monoLeversSelector:switch",
            category: "Opciones de palancas"
        });
        
        Survey.JsonObject.metaData.addProperty("matrixdropdown", {
            name: "addExtraLeverCheckbox:switch",
            category: "Opciones de palancas"
        });
        
        Survey.JsonObject.metaData.addProperty("matrixdropdown", {
            name: "extraLeverCheckboxText",
            category: "Opciones de palancas"
        });
        //Fin definicion de nuevas propiedades soportadas en el JSON de la encuesta
        
        let DEFAULT_SURVEY_PROPERTIES = {
            DETRACTOR_COLOR: "#B9001C",
            PASSIVE_COLOR: "#D39E10",
            PROMOTOR_COLOR: "#53770E",
            TYPE_OF_NPS: "1",
            HAS_EXTRA_QUESTION: false,
            SHOW_NPS_EMOTICON_BAR: false,
            SHOW_BOTTOM_BORDER_COLORS: false,
            SHOW_BORDER_COLORS: false,
            SHOW_BACKGROUND_COLORS: false,
            MIN_RATE_DESCRIPTION: "",
            MAX_RATE_DESCRIPTION: ""
        };        

        // END SURVEY CONFIGURATIONS

        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(
                            cookie.substring(name.length + 1)
                        );
                        break;
                    }
                }
            }
            return cookieValue;
        }

        var csrftoken = getCookie('csrftoken');
        _window._apollo_frame = {};
        _apollo_frame = {};

        let TYPE_OF_NPS = 'square';
        var json = {"focusFirstQuestionAutomatic":false,"pages":[{"name":"página1","elements":[{"type":"rating","name":"b_nps-1","title":"[NPS rating] Ingresa el texto requerido haciendo click aquí","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una calificación","default":"Esta pregunta es obligatoria"},"belongsToIndexResult":"1","parsedName":"b_nps","customNameSelected":"b_nps","rateMin":0,"rateMax":10},{"type":"comment","name":"b_verbatim-1","visibleIf":"{b_nps-1} <= 6","title":"[NPS entre 0 y 6] Escribe el texto para cuando b_nps sea menor a 6","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"belongsToIndexResult":"1","parsedName":"b_verbatim","customNameSelected":"b_verbatim","placeHolder":{"es":"Comente"}},{"type":"comment","name":"b_verbatim-2","visibleIf":"{b_nps-1} = 7 or {b_nps-1} = 8","title":"[NPS entre 7 y 8] Escribe el texto para cuando b_nps esté entre 7 y 8","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"belongsToIndexResult":"1","parsedName":"b_verbatim","customNameSelected":"b_verbatim","placeHolder":{"es":"Comente"}},{"type":"comment","name":"b_verbatim-3","visibleIf":"{b_nps-1} >= 9","title":"[NPS entre 9 y 10] Escribe el texto para cuando b_nps esté entre 9 y 10","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"belongsToIndexResult":"1","parsedName":"b_verbatim","customNameSelected":"b_verbatim","placeHolder":{"es":"Comente"}}],"title":"test atributos widget web"},{"name":"página2","elements":[{"type":"text","name":"o_1-1","title":"entrada simple","belongsToIndexResult":"1","parsedName":"o_1","customNameSelected":"o_1"},{"type":"checkbox","name":"o_2-1","title":"checkboxes","belongsToIndexResult":"1","parsedName":"o_2","customNameSelected":"o_2","choices":["item1","item2","item3"]}]},{"name":"página3","elements":[{"type":"radiogroup","name":"o_3-1","title":"radiogroup","belongsToIndexResult":"1","parsedName":"o_3","customNameSelected":"o_3","choices":["item1","item2","item3"]},{"type":"dropdown","name":"o_4-1","title":"dropdown","belongsToIndexResult":"1","parsedName":"o_4","customNameSelected":"o_4","choices":["item1","item2","item3"]}]},{"name":"página4","elements":[{"type":"comment","name":"o_5-1","title":"comentario","belongsToIndexResult":"1","parsedName":"o_5","customNameSelected":"o_5"},{"type":"rating","name":"o_6-1","title":"rate","belongsToIndexResult":"1","parsedName":"o_6","customNameSelected":"o_6","rateValues":[{"value":"0","text":"0"},{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"},{"value":"8","text":"8"},{"value":"9","text":"9"},{"value":"10","text":"10"}],"rateMin":0,"rateMax":10,"minRateDescription":"No recomendaría<br>en absoluto","maxRateDescription":"Definitivamente<br>recomendaría"}]},{"name":"página5","elements":[{"type":"matrix","name":"x_7_8_9_10-1","title":"matrix","belongsToIndexResult":"1","parsedName":"x_7_8_9_10","customNameSelected":"x_7_8_9_10","columns":[{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"}],"rows":[{"value":"o_7","text":"Amabilidad del vendedor"},{"value":"o_8","text":"Tiempo de espera"},{"value":"o_9","text":"qwer"},{"value":"o_10","text":"asdf"}]}]}],"showQuestionNumbers":"off","showProgressBar":"top","pagePrevText":"Anterior","pageNextText":"Siguiente","completeText":"Enviar","mainSurveyColor":"#FC6502","sideButtonColor":"#000000","buttonTextNotNow":"Ahora no","surveyFontFamily":"PFBeauSansPro","surveyTitleColor":"#FC6502","surveyQuestionColor":"#665353","surveyDisclaimerColor":"#040000","surveyQuestionNpsShape":"square","transformMatrixToMatrixDropdownOnMobileDevices":true};
        json = {"pages":[{"name":"página1","title":{"es":"test atributos widget webb","default":"test atributos widget web"},"elements":[{"name":"b_nps-1","type":"rating","title":"[NPS rating] Ingresa el texto requerido haciendo click aquí","rateMax":10,"rateMin":0,"isRequired":true,"parsedName":"b_nps","requiredErrorText":{"es":"Debe ingresar una calificación","default":"Esta pregunta es obligatoria"},"customNameSelected":"b_nps","belongsToIndexResult":"1"},{"name":"b_verbatim-1","type":"comment","title":"[NPS entre 0 y 6] Escribe el texto para cuando b_nps sea menor a 6","visibleIf":"{b_nps-1} <= 6","isRequired":true,"parsedName":"b_verbatim","placeHolder":{"es":"Comente"},"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"customNameSelected":"b_verbatim","belongsToIndexResult":"1"},{"name":"b_verbatim-2","type":"comment","title":"[NPS entre 7 y 8] Escribe el texto para cuando b_nps esté entre 7 y 8","visibleIf":"{b_nps-1} = 7 or {b_nps-1} = 8","isRequired":true,"parsedName":"b_verbatim","placeHolder":{"es":"Comente"},"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"customNameSelected":"b_verbatim","belongsToIndexResult":"1"},{"name":"b_verbatim-3","type":"comment","title":"[NPS entre 9 y 10] Escribe el texto para cuando b_nps esté entre 9 y 10","visibleIf":"{b_nps-1} >= 9","isRequired":true,"parsedName":"b_verbatim","placeHolder":{"es":"Comente"},"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Esta pregunta es obligatoria"},"customNameSelected":"b_verbatim","belongsToIndexResult":"1"}]},{"name":"página2","elements":[{"name":"o_1-1","type":"text","title":"entrada simple","parsedName":"o_1","customNameSelected":"o_1","belongsToIndexResult":"1"},{"name":"o_2-1","type":"checkbox","title":"checkboxes","choices":["item1","item2","item3"],"parsedName":"o_2","customNameSelected":"o_2","belongsToIndexResult":"1"}]},{"name":"página3","elements":[{"name":"o_3-1","type":"radiogroup","title":"radiogroup","choices":["item1","item2","item3"],"parsedName":"o_3","customNameSelected":"o_3","belongsToIndexResult":"1"},{"name":"o_4-1","type":"dropdown","title":"dropdown","choices":["item1","item2","item3"],"parsedName":"o_4","customNameSelected":"o_4","belongsToIndexResult":"1"}]},{"name":"página4","elements":[{"name":"o_5-1","type":"comment","title":"comentario","parsedName":"o_5","customNameSelected":"o_5","belongsToIndexResult":"1"},{"name":"o_6-1","type":"rating","title":"rate","rateMax":10,"rateMin":0,"parsedName":"o_6","rateValues":[{"text":"0","value":"0"},{"text":"1","value":"1"},{"text":"2","value":"2"},{"text":"3","value":"3"},{"text":"4","value":"4"},{"text":"5","value":"5"},{"text":"6","value":"6"},{"text":"7","value":"7"},{"text":"8","value":"8"},{"text":"9","value":"9"},{"text":"10","value":"10"}],"customNameSelected":"o_6","maxRateDescription":"Definitivamente<br>recomendaría","minRateDescription":"No recomendaría<br>en absoluto","belongsToIndexResult":"1"}]},{"name":"página5","elements":[{"name":"x_7_8_9_10-1","rows":[{"text":"Amabilidad del vendedor","value":"o_7"},{"text":"Tiempo de espera","value":"o_8"},{"text":"qwer","value":"o_9"},{"text":"asdf","value":"o_10"}],"type":"matrix","title":"matrix","columns":[{"text":"1","value":"1"},{"text":"2","value":"2"},{"text":"3","value":"3"},{"text":"4","value":"4"},{"text":"5","value":"5"},{"text":"6","value":"6"},{"text":"7","value":"7"}],"parsedName":"x_7_8_9_10","customNameSelected":"x_7_8_9_10","belongsToIndexResult":"1"}]}],"locale":"de","completeText":"Enviar","pageNextText":"Siguiente","pagePrevText":"Anterior","mainSurveyColor":"#FC6502","showProgressBar":"top","sideButtonColor":"#000000","buttonTextNotNow":"Ahora no","surveyFontFamily":"PFBeauSansPro","surveyTitleColor":"#FC6502","showQuestionNumbers":"off","surveyQuestionColor":"#665353","surveyDisclaimerColor":"#040000","surveyQuestionNpsShape":"square","focusFirstQuestionAutomatic":false,"transformMatrixToMatrixDropdownOnMobileDevices":true};
        
        json = {"completedHtml":"<div style=\"margin:0 auto;max-width:600px;\">\n   <div>\n      <div style=\"border-color: #49ac35; border: 2px solid #49ac35;\">\n         <div style=\"overflow-x:auto;\">\n            <p style=\"text-align:center;font-size:20px;margin-top:5px;\"><b>Gracias por darnos tu opinión.</b></p>\n            <p style=\"text-align:center;font-size:15px;\"><b>Tus comentarios y sugerencias serán de gran ayuda para seguir mejorando la experiencia de nuestros clientes.</b></p>\n         </div>\n      </div>\n   </div>\n</div>","pages":[{"name":"página1","elements":[{"type":"rating","name":"b_nps","title":"Basado en tu experiencia **pagando tu tarjeta por nuestra Web**, ¿Qué tanto recomendarías Banco Falabella a un familiar o amigo? Usa una escala de 0 a 10, donde 0 es no recomendarías en absoluto y 10 definitivamente recomendarías.","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una calificación","default":"Please answer the question."},"rateMin":0,"rateMax":10,"minRateDescription":"No recomendarías en absoluto","maxRateDescription":"Definitivamente recomendarías"},{"type":"comment","name":"b_verbatim-1","title":"¿Cuáles son las razones de esta calificación?","isRequired":true,"requiredErrorText":{"es":"Debe ingresar una respuesta","default":"Please answer the question."},"cols":100,"rows":3,"placeHolder":{"es":"Comente","default":"Tu opinión es muy importante para nosotros."}}],"title":"¡Cuéntanos como te fue!"},{"name":"página2","elements":[{"type":"comment","name":"o_1003-1","title":"¿Con que  banco pagaste o intentaste pagar?","belongsToIndexResult":"1","parsedName":"o_1003","customNameSelected":"o_1003","rows":2}]}],"showPrevButton":false,"showQuestionNumbers":"off","showProgressBar":"top","pagePrevText":"Anterior","pageNextText":"Siguiente","completeText":"Enviar","mainSurveyColor":"#00943E","sideButtonColor":"#00943E","buttonTextNotNow":"Ahora no","surveyFontFamily":"PFBeauSansPro","surveyTitleColor":"#007A33","surveyQuestionColor":"#5C6166","surveyDisclaimerColor":"#5C6166","surveyQuestionNpsShape":"circle"};        
        json = {"locale":"es","pages":[{"name":"página1","elements":[{"type":"rating","name":"pregunta1","title":{"es":"0 a 10 border"},"belongsToIndexResult":"1","parsedName":"pregunta1","rateValues":[{"value":"0","text":"0"},{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"},{"value":"8","text":"8"},{"value":"9","text":"9"},{"value":"10","text":"10"}],"rateMin":0,"rateMax":10,"minRateDescription":"min_desc","maxRateDescription":"max_desc","showBorderColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"},{"type":"comment","name":"pregunta10","title":"title","description":"desc","belongsToIndexResult":"1","parsedName":"pregunta10","placeHolder":"place_holder"},{"type":"rating","name":"nps2-1","title":{"es":"0 a 10 background colores derco"},"belongsToIndexResult":"1","parsedName":"nps2","customNameSelected":"nps2","rateValues":[{"value":"0","text":"0"},{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"},{"value":"8","text":"8"},{"value":"9","text":"9"},{"value":"10","text":"10"}],"rateMin":0,"rateMax":10,"showBackgroundColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"},{"type":"comment","name":"pregunta2","visible":false,"visibleIf":"{nps2-1} = 10","title":{"es":"title_hide"},"description":{"es":"desc_hide"},"belongsToIndexResult":"1","parsedName":"pregunta2","placeHolder":{"es":"place_holder_hide"}},{"type":"rating","name":"pregunta3","title":{"es":"0 a 10 background colores default"},"belongsToIndexResult":"1","parsedName":"pregunta3","rateValues":[{"value":"0","text":"0"},{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"},{"value":"8","text":"8"},{"value":"9","text":"9"},{"value":"10","text":"10"}],"rateMin":0,"rateMax":10,"showBackgroundColors":true}]},{"name":"página2","elements":[{"type":"rating","name":"pregunta4","title":{"es":"1 a 7 border"},"belongsToIndexResult":"1","parsedName":"pregunta4","rateValues":[{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"}],"rateMax":7,"typeOfNps":"3","showBorderColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"},{"type":"rating","name":"pregunta5","title":{"es":"1 a 7 background"},"belongsToIndexResult":"1","parsedName":"pregunta5","rateValues":[{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"},{"value":"6","text":"6"},{"value":"7","text":"7"}],"rateMax":7,"typeOfNps":"3","showBackgroundColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"},{"type":"rating","name":"pregunta7","title":{"es":"1 a 5 border"},"belongsToIndexResult":"1","parsedName":"pregunta7","rateValues":[{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"}],"typeOfNps":"2","showBorderColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"},{"type":"rating","name":"pregunta8","title":{"es":"1 a 5 background"},"belongsToIndexResult":"1","parsedName":"pregunta8","rateValues":[{"value":"1","text":"1"},{"value":"2","text":"2"},{"value":"3","text":"3"},{"value":"4","text":"4"},{"value":"5","text":"5"}],"typeOfNps":"2","showBackgroundColors":true,"detractorColor":"#ff0000","passiveColor":"#ffc715","promotorColor":"#008000"}]}],"showQuestionNumbers":"off","mainSurveyColor":"#4D97FF","sideButtonColor":"#000000","buttonTextNotNow":"Ahora no","surveyFontFamily":"PFBeauSansPro","surveyTitleColor":"#FC6502","surveyQuestionColor":"#B4D231","surveyDisclaimerColor":"#040000","surveyQuestionNpsShape":"square"};
        json = {"completedHtmlOnCondition":[{"html":{"es":"<div style=\"margin:0 auto;max-width:600px;\"> \t<div> \t\t<div style=\"border-color: #49ac35; border: 2px solid #49ac35;\"> \t\t\t<div style=\"overflow-x:auto;\"> \t\t\t\t<p style=\"text-align:center;font-size:20px;margin-top:5px;\"><b>¡Muchas gracias por tus respuestas!</b></p> \t\t\t\t<p style=\"text-align:center;font-size:15px;\"><b>Te gusta nuestra aplicación?, evalúala</b></p> \t\t\t\t<table width=\"100%\"> \t\t\t\t\t<tbody> \t\t\t\t\t\t<tr> \t\t\t\t\t\t\t<td width=\"50%\" style=\"text-align:center;\"> \t\t\t\t\t\t\t\t<p style=\"text-align:center;font-size:15px;\"><b>desde Android</b><br><a href=\"https://play.google.com/store/apps/details?id=cl.android\" target=\"_blank\"><img src=\"https://s3-loyalink.s3.amazonaws.com/bfchile_cx_loyal/logo_android.jpeg\" alt=\"https://play.google.com/store/apps/details?id=cl.android\" style=\"max-width:150px;\"></img></a></p> \t\t\t\t\t\t\t</td> \t\t\t\t\t\t\t<td width=\"50%\" style=\"text-align:center;\"> \t\t\t\t\t\t\t\t<p style=\"text-align:center;font-size:15px;\"><b>desde iPhone</b><br><a href=\"https://itunes.apple.com/app/id447266660?action=write-review\" target=\"_blank\"><img src=\"https://s3-loyalink.s3.amazonaws.com/bfchile_cx_loyal/logo_ios.jpeg\" alt=\"https://apps.apple.com/cl/app/banco-falabella-cmr/id447266660\" style=\"max-width:150px;\"></img></a></p> \t\t\t\t\t\t\t</td> \t\t\t\t\t\t</tr> \t\t\t\t\t</tbody> \t\t\t\t</table> \t\t\t</div> \t\t</div> \t</div> </div>"}}],"pages":[{"name":"página1","elements":[{"type":"matrix","name":"x_66_67_68_69-1","title":{"es":"<b>En una escala de 1 a 7 ¿Cómo evalúa los siguientes aspectos en relación a los beneficios entregados por Isapre Nueva Masvida?</b>"},"isRequired":true,"belongsToIndexResult":"1","parsedName":"x_66_67_68_69","customNameSelected":"x_66_67_68_69","columns":[{"value":"0","text":{"es":"0"}},{"value":"1","text":{"es":"1"}},{"value":"2","text":{"es":"2"}},{"value":"3","text":{"es":"3"}},{"value":"4","text":{"es":"4"}},{"value":"5","text":{"es":"5"}},{"value":"6","text":{"es":"6"}},{"value":"7","text":{"es":"7"}},{"value":"8","text":{"es":"8"}},{"value":"9","text":{"es":"9"}},{"value":"10","text":{"es":"10"}}],"rows":[{"value":"o_66","text":{"es":"Cobertura y bonificación del Plan de salud"}},{"value":"o_67","text":{"es":"Precio del plan de salud"}},{"value":"o_68","text":{"es":"Convenios con prestadores (médicos, clínicas, etc)"}},{"value":"o_69","text":{"es":"Beneficios y descuentos adicionales al plan de salud"}}]},{"type":"matrix","name":"pregunta2","title":{"es":"<b>En una escala de 1 a 7 ¿Cómo evalúa los siguientes aspectos en relación a los beneficios entregados por Isapre Nueva Masvida?</b>"},"isRequired":true,"belongsToIndexResult":"1","parsedName":"pregunta2","customNameSelected":"x_66_67_68_69","columns":[{"value":"0","text":{"es":"0"}},{"value":"1","text":{"es":"1"}},{"value":"2","text":{"es":"2"}},{"value":"3","text":{"es":"3"}},{"value":"4","text":{"es":"4"}},{"value":"5","text":{"es":"5"}},{"value":"6","text":{"es":"6"}},{"value":"7","text":{"es":"7"}},{"value":"8","text":{"es":"8"}},{"value":"9","text":{"es":"9"}},{"value":"10","text":{"es":"10"}},{"value":"No sabe / No responde","text":{"es":"No sabe / No responde"}}],"rows":[{"value":"o_66","text":{"es":"Cobertura y bonificación del Plan de salud"}},{"value":"o_67","text":{"es":"Precio del plan de salud"}},{"value":"o_68","text":{"es":"Convenios con prestadores (médicos, clínicas, etc)"}},{"value":"o_69","text":{"es":"Beneficios y descuentos adicionales al plan de salud"}}]},{"type":"matrix","name":"x_70_71_72_73_74-1","title":{"es":"<b>¿Cómo evalúa los siguientes canales y plataformas de atención de Isapre Nueva Masvida?</b>"},"isRequired":true,"belongsToIndexResult":"1","parsedName":"x_70_71_72_73_74","customNameSelected":"x_70_71_72_73_74","columns":[{"value":"1","text":{"es":"1"}},{"value":"2","text":{"es":"2"}},{"value":"3","text":{"es":"3"}},{"value":"4","text":{"es":"4"}},{"value":"5","text":{"es":"5"}},{"value":"6","text":{"es":"6"}},{"value":"7","text":{"es":"7"}},{"value":"No utilizó","text":{"es":"No utilizó"}}],"rows":[{"value":"o_70","text":{"es":"Atención en sucursales"}},{"value":"o_71","text":{"es":"Call center"}},{"value":"o_72","text":{"es":"Sucursal Virtual"}},{"value":"o_73","text":{"es":"Sitio web (www.nuevamasvida.cl)"}},{"value":"o_74","text":{"es":"Redes sociales"}}]},{"type":"matrix","name":"pregunta1","title":{"es":"<b>En una escala de 1 a 7 ¿Cómo evalúa los siguientes aspectos en relación a los beneficios entregados por Isapre Nueva Masvida?</b>"},"isRequired":true,"belongsToIndexResult":"1","parsedName":"pregunta1","customNameSelected":"x_66_67_68_69","columns":[{"value":"1","text":{"es":"1"}},{"value":"2","text":{"es":"2"}},{"value":"3","text":{"es":"3"}},{"value":"4","text":{"es":"4"}},{"value":"5","text":{"es":"5"}},{"value":"6","text":{"es":"6"}},{"value":"7","text":{"es":"7"}},{"value":"No utilizó","text":{"es":"No utilizó"}}],"rows":[{"value":"o_66","text":{"es":"Cobertura y bonificación del Plan de salud"}},{"value":"o_67","text":{"es":"Precio del plan de salud"}},{"value":"o_68","text":{"es":"Convenios con prestadores (médicos, clínicas, etc)"}},{"value":"o_69","text":{"es":"Beneficios y descuentos adicionales al plan de salud"}}]},{"type":"matrix","name":"pregunta3","title":{"es":"<b>En una escala de 1 a 7 ¿Cómo evalúa los siguientes aspectos en relación a los beneficios entregados por Isapre Nueva Masvida?</b>"},"isRequired":true,"belongsToIndexResult":"1","parsedName":"pregunta3","customNameSelected":"x_66_67_68_69","columns":[{"value":"1","text":{"es":"1"}},{"value":"2","text":{"es":"2"}},{"value":"3","text":{"es":"3"}},{"value":"4","text":{"es":"4"}},{"value":"5","text":{"es":"5"}},{"value":"6","text":{"es":"6"}},{"value":"7","text":{"es":"7"}}],"rows":[{"value":"o_66","text":{"es":"Cobertura y bonificación del Plan de salud"}},{"value":"o_67","text":{"es":"Precio del plan de salud"}},{"value":"o_68","text":{"es":"Convenios con prestadores (médicos, clínicas, etc)"}},{"value":"o_69","text":{"es":"Beneficios y descuentos adicionales al plan de salud"}}]}]}],"showTitle":false,"showPageTitles":false,"showQuestionNumbers":"off","completeText":"Enviar","mainSurveyColor":"#000000","buttonTextNotNow":"Ahora no","surveyFontFamily":"PFBeauSansPro","surveyTitleColor":"#00FF2F","surveyQuestionColor":"#000000","surveyQuestionNpsShape":"circle","loyalinkOldCss":true,"hideHeaderAndFooterAfterResponse":true,"transformMatrixToMatrixDropdownOnMobileDevices":true};
        json = addLocaleToTopOfTheJSON(json)

        var extras = {"b_algo": "HOLA"};
        var defaultThemeColors = {};

        defaultThemeColors["$main-color"] = json.mainSurveyColor;
        defaultThemeColors["$main-hover-color"] = json.mainSurveyColor;
        defaultThemeColors["$header-color"] = json.mainSurveyColor;
        defaultThemeColors["$text-color"] = (json.surveyQuestionColor === undefined ? 'black' : json.surveyQuestionColor);
        Survey.StylesManager.ThemeColors["new_theme"] = defaultThemeColors;
        Survey.StylesManager.applyTheme("new_theme");

        // BEGIN PRE PROCESS SURVEY JSON
        let transformMatrixToMatrixDropdownOnMobileDevices = (json.transformMatrixToMatrixDropdownOnMobileDevices ? true : false);
        let surveyWithLoyalinkOldCss = true; // (json.loyalinkOldCss ? true : false);
        
        if (transformMatrixToMatrixDropdownOnMobileDevices && detectIfBrowserIsOnMobileDevice()) {
            json = preprocessSurveyJSON(json);
        }

        // END PRE PROCESS SURVEY JSON

        _apollo_frame.script = new Survey.Model(json);

        // BEGIN RUNTIME VARS
        let BEGIN_JSON = null;
        let END_JSON = null;
        let TRACKING_B_DRIVERS_CHECKBOXES = {};
        
        _apollo_frame.script.setValue("TRACKING_B_DRIVERS_CHECKBOXES", TRACKING_B_DRIVERS_CHECKBOXES);
        // END RUNTIME VARS

        // BEGIN LOYALINK EVENTS
        _apollo_frame.script.onAfterRenderQuestion.add(function(survey, options) {
            let typeOfCurrentQuestion = options.question.getType();
        
            if (typeOfCurrentQuestion === "matrix") {
                let matrixColumns = options.question.columns;
                let nonNumericColumn = false;
                let questionId = options.question.id; 
        
                matrixColumns.forEach((element) => {
                    if (isNaN(element.value)) {
                        nonNumericColumn = true;
                    }
                });
        
                if (nonNumericColumn) {
                    let style = document.createElement('style');
        
                    let css = `
                        #${questionId} .sv_q_matrix thead th:last-child {
                            max-width: 33px;
                        }
                    `;
        
                    if(style.styleSheet) {
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    document.getElementsByTagName('head')[0].appendChild(style);
                }
            }
        
            if (typeOfCurrentQuestion === "matrixdropdown" && options.question.name.includes('b_drivers-')) {
                if (options.question.addExtraLeverCheckbox && options.question.extraLeverCheckboxText !== "") {
                    let uniqueCheckboxName = options.question.name + "-optional-checkbox";
        
                    $("<div style='margin-left: 10px'><input type='checkbox' id='" + uniqueCheckboxName + "' > " + options.question.extraLeverCheckboxText + "</div>").insertAfter($(options.htmlElement).children().eq(1));
        
                    $('#' + uniqueCheckboxName).change(function() {
                        let questionName = this.id.split("-optional-checkbox")[0];
                        let currentMatrixDropdownQuestion = survey.getQuestionByName(questionName); 
        
                        TRACKING_B_DRIVERS_CHECKBOXES[questionName] = this.checked;
        
                        if (currentMatrixDropdownQuestion !== null) {
                            currentMatrixDropdownQuestion.isRequired = !this.checked;
                        }
        
                        survey.setValue("TRACKING_B_DRIVERS_CHECKBOXES", TRACKING_B_DRIVERS_CHECKBOXES);
                    });            
                }
            }
            if (typeOfCurrentQuestion === "rating") {
                let showBottomBorderColors  = options.question.showBottomBorderColors || DEFAULT_SURVEY_PROPERTIES.SHOW_BOTTOM_BORDER_COLORS;
                let showBorderColors  = options.question.showBorderColors || DEFAULT_SURVEY_PROPERTIES.SHOW_BORDER_COLORS;
                let showBackgroundColors  = options.question.showBackgroundColors || DEFAULT_SURVEY_PROPERTIES.SHOW_BACKGROUND_COLORS;

                let typeOfNpsQuestion = options.question.typeOfNps || DEFAULT_SURVEY_PROPERTIES.TYPE_OF_NPS,
                    detractorColor = options.question.detractorColor || DEFAULT_SURVEY_PROPERTIES.DETRACTOR_COLOR,
                    passiveColor = options.question.passiveColor || DEFAULT_SURVEY_PROPERTIES.PASSIVE_COLOR,
                    promotorColor = options.question.promotorColor || DEFAULT_SURVEY_PROPERTIES.PROMOTOR_COLOR;

                if (showBackgroundColors) {
                    let npsHtmlElement = options.htmlElement;
                    let npsColors = {
                        detractorColor: detractorColor,
                        passiveColor: passiveColor,
                        promotorColor: promotorColor
                    };
                    drawNpsQuestionWithBackgroundColor(npsHtmlElement, typeOfNpsQuestion, npsColors);
                }

                if (showBorderColors && !showBackgroundColors) {
                    let npsHtmlElement = options.htmlElement;
                    let npsColors = {
                        detractorColor: detractorColor,
                        passiveColor: passiveColor,
                        promotorColor: promotorColor
                    };
        
                    drawNpsQuestionWithBorderColor(npsHtmlElement, typeOfNpsQuestion, npsColors);
                }
            }
        });

        _apollo_frame.script.onAfterRenderSurvey.add(function(survey, options) {

            /*  
                Obtener todas las preguntas b_drivers
            */
        
            let allLeversMatrixIds = [];
            let associativeLeversMatrix = [];
        
            for (let i = 1; i < 4; i++) {
                let b_drivers_question = survey.getQuestionByName('b_drivers-' + i);
        
                if (b_drivers_question === null) {
                    continue;
                }
                allLeversMatrixIds.push(b_drivers_question.id);
            }
        
            for (let i = 0; i < allLeversMatrixIds.length; i++) {
                let currentLeversMatrixId = allLeversMatrixIds[i];
                let matrixColumnsCount = $("#" + currentLeversMatrixId + " table > tbody > tr:first > td").length - 1; 
                let interOptions = [];
                let neutralOptions = [];
                let monoLeversSelector = (matrixColumnsCount === 1 ? true : false);
        
                if (!monoLeversSelector) {
                    interOptions = $('#' + currentLeversMatrixId + ' table tbody tr td:first-child').next().find('select');
                    neutralOptions = $('#' + currentLeversMatrixId + ' table tbody tr td:first-child').next().next().find('select');
                } else {
                    neutralOptions = $('#' + currentLeversMatrixId + ' table tbody tr td:first-child').next().find('select');
                }
        
                associativeLeversMatrix.push({
                    id: '#' + currentLeversMatrixId,
                    columnsCount: matrixColumnsCount,
                    monoLeversSelector: monoLeversSelector,
                    interOptions: interOptions,
                    neutralOptions: neutralOptions
                });
            }
        
            // hacer disasabled las palancas neutras
            for (let i = 0; i < associativeLeversMatrix.length; i++) {
                let currentMatrixLever = associativeLeversMatrix[i];
        
                if (!currentMatrixLever.monoLeversSelector) {
        
                    for (let j = 0; j < currentMatrixLever.neutralOptions.length; j++) {
                        let currentNeutralSelector = currentMatrixLever.neutralOptions[j];
                        $(currentNeutralSelector).prop('disabled', 'disabled')
                    }
        
                    for (let j = 0; j < currentMatrixLever.interOptions.length; j++) {
                        let currentInterSelector = currentMatrixLever.interOptions[j];
        
                        $(currentInterSelector).change(function(event) {
                            let currentSelectorValue = $(event.target).val();
                            let currentSelectorId = $(event.target).attr('id');
                            let siblingSelectorId = '#sq_' + (parseInt(currentSelectorId.split('_')[1]) + 1) + 'i';
                            let disabledSiblingSelector = (currentSelectorValue === "" ? 'disabled' : false);
        
                            $(siblingSelectorId).prop('disabled', disabledSiblingSelector);
                        });
                    }
                }
            }    
            
            let style = document.createElement('style');
            
            let css = `
                .sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_max_text {
                    color: ${json.surveyQuestionColor};
                }

                .sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text {
                    color: ${json.surveyQuestionColor};
                }

                ::placeholder {
                    color: ${json.surveyQuestionColor};
                }
            `;

            if(style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }

            document.getElementsByTagName('head')[0].appendChild(style);            

        });
        
        _apollo_frame.script.onMatrixCellValueChanged.add(function(survey, options) {    
            if (options.question.name.includes('b_drivers-')) {
                options.getCellQuestion(options.columnName).hasErrors(true);
            }
        });
        
        _apollo_frame.script.onMatrixCellValidate.add(function(survey, options) {
            if (options.question.name.includes('b_drivers-') && options.question.monoLeversSelector === undefined && Object.keys(options.rowValue).length === 2) {
                if (validateUniqueValuesInNeutralColumn(options)) {
                    options.error = "Ya has seleccionado este valor";
                } else {
                    options.question.clearErrors();
                }
            }
        
        
            if (options.question.name.includes('b_drivers-') && options.question.monoLeversSelector !== undefined && Object.keys(options.rowValue).length === 1) {
                if (validateUniqueValuesInNeutralColumnMonoSelector(options)) {
                    options.error = "Ya has seleccionado este valor";
                } else {
                    options.question.clearErrors();
                }
            }
        });
        
        _apollo_frame.script.onValidateQuestion.add(function(survey, options) {
            let currentQuestion = options.question;
            let typeOfCurrentQuestion = currentQuestion.getType();
        
            if (typeOfCurrentQuestion === "matrixdropdown" && currentQuestion.isRequired && surveyWithLoyalinkOldCss && detectIfBrowserIsOnMobileDevice()) {
                if(!currentQuestion.rows.every(function(row){if(!row.isVisible) return true;return(options.value || {})[row.itemValue]!==undefined;})){
                    options.error = "Por favor responda todas las preguntas";
                    return;
                }
            }
        
            if (typeOfCurrentQuestion === "matrixdropdown" && currentQuestion.isRequired && surveyWithLoyalinkOldCss && options.name.includes('b_drivers-') && currentQuestion.monoLeversSelector === undefined){
                let atLeastOneFullRow = false;
        
                for (var rowText in options.value) {
                    let numberOfColumnsWithValues = Object.keys(options.value[rowText]).length;
        
                    if (numberOfColumnsWithValues === 2) {
                        atLeastOneFullRow = true;
                        break;
                    }
                }
        
                if (!atLeastOneFullRow) {
                    options.error = "Debes responder al menos una fila completa.";
                    return;
                }
            }    
        });
        
        _apollo_frame.script.onCompleting.add(function(survey, options) {
            BEGIN_JSON = survey.data;
            // onCompleting add hidden inputs
            survey.data = parseResponseJSON(survey.data);
            survey.data = verifyVerbatimExistenceOfEveryResult(survey.data);
            END_JSON = survey.data;
        });

        // END LOYALINK EVENTS

        _apollo_frame
            .script
            .onComplete
            .add(function(result) {

                console.log('result.data: ');
                console.log(result.data);

                if(extras === null) {
                    extras = {};
                }
                axios({
                    method: 'post',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    url: '/save_survey/YWxjby90ZXN0LWRhbmllbA==',
                    data: {
                        answer: result.data,
                        extras: extras
                    }
                })
                .then(function (response) {
                })
                .catch(function (error) {
                });
            });

        console.log("*****");
        _apollo_frame.script.onAfterRenderPage.add(function() {
            console.log("onAfterRenderPage");
            let newNpsShapeValue = json.surveyQuestionNpsShape;
            let css = '';
            let responsiveCss = '';
            let style = document.createElement('style');

            let currentUserAgent = navigator.userAgent.toLowerCase();
            let isSafariBrowser = false;

            if (currentUserAgent.indexOf('safari') != -1) { 
                isSafariBrowser = ( currentUserAgent.indexOf('chrome') > -1 ? false : true);
            }

            let npsElements = document.getElementsByClassName('sv_q_rating_item_text');

            for(let i = 0; i < npsElements.length; i++) {
                let currentElement = npsElements[i];

                if(currentElement.classList.contains('sv_q_rating_item_text')) {
                    if(newNpsShapeValue === 'square') {
                        currentElement.classList.add('local-square-nps');
                    }

                    if(newNpsShapeValue === 'circle') {
                        currentElement.classList.add('local-circle-nps');
                    }
                }
            }

            if(newNpsShapeValue === undefined || newNpsShapeValue === 'circle') {
                if (isSafariBrowser) {
                    css = '@media screen and (min-width:300px) and (max-width:319px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:22px}span.sv_q_rating_item_text.local-circle-nps{width:19px;height:19px;border-radius:50%}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating{line-height:1.5em}}@media screen and (min-width:320px) and (max-width:357px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:23px}span.sv_q_rating_item_text.local-circle-nps{width:20px;height:20px;border-radius:50%}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating{line-height:1.5em}}@media screen and (min-width:358px) and (max-width:374px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:23px}span.sv_q_rating_item_text.local-circle-nps{width:24px;height:24px;border-radius:50%}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating{line-height:1.5em}}@media screen and (min-width:375px) and (max-width:413px){.sv_q_rating_min_text{margin-top:24px}span.sv_q_rating_item_text.local-circle-nps{width:27px;height:27px;border-radius:50%;box-sizing:border-box;margin-right:1px}}@media screen and (min-width:414px) and (max-width:518px){.sv_q_rating_min_text{margin-top:37px}.sv_q_rating{width:100%;margin:20px 0 20px 0}span.sv_q_rating_item_text.local-circle-nps{width:30px;height:30px;border-radius:50%;box-sizing:border-box;margin-right:1.5px;padding:4px}}@media screen and (min-width:519px) and (max-width:1920px){.sv_q_rating_min_text{margin-top:40px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_max_text{position:absolute;float:right;right:20px}span.sv_q_rating_item_text.local-circle-nps{width:40px;height:40px;border-radius:50%;box-sizing:border-box;margin-right:1px;padding:6px}}';
                } else {
                    css = '@media screen and (max-width:335px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}span.sv_q_rating_item_text.local-circle-nps{width:25px;height:25px;border-radius:50%;box-sizing:border-box;padding:0;margin-right:0}}@media screen and (min-width:336px) and (max-width:357px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:28px}span.sv_q_rating_item_text.local-circle-nps{width:28px;height:28px;border-radius:50%;box-sizing:border-box;padding:0;margin-right:0}}@media screen and (min-width:358px) and (max-width:374px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}span.sv_q_rating_item_text.local-circle-nps{width:30px;height:30px;border-radius:50%;box-sizing:border-box;padding:0;margin-right:0}}@media screen and (min-width:375px) and (max-width:401px){.sv_q_rating_min_text{margin-top:32px}span.sv_q_rating_item_text.local-circle-nps{width:30px;height:30px;border-radius:50%;box-sizing:border-box;margin-right:1.5px}}@media screen and (min-width:402px) and (max-width:429px){.sv_q_rating_min_text{margin-top:35px}span.sv_q_rating_item_text.local-circle-nps{width:32.5px;height:32.5px;border-radius:50%;box-sizing:border-box;margin-right:1.5px;padding:2px}}@media screen and (min-width:430px) and (max-width:480px){.sv_q_rating_min_text{margin-top:37px}.sv_q_rating{width:100%;margin:20px 0 20px 0}span.sv_q_rating_item_text.local-circle-nps{width:35px;height:35px;border-radius:50%;box-sizing:border-box;margin-right:1.5px;padding:4px}}@media screen and (min-width:481px) and (max-width:758px){.sv_q_rating_min_text{margin-top:40px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_max_text{position:absolute;float:right;right:20px}span.sv_q_rating_item_text.local-circle-nps{width:40px;height:40px;border-radius:50%;box-sizing:border-box;margin-right:1px;padding:6px}}@media screen and (min-width:759px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static;font-size:12px;color:#585b5d}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static}span.sv_q_rating_max_text{margin-left:0;display:inline;float:none;font-size:12px;color:#585b5d}span.sv_q_rating_item_text{padding:5px}span.sv_q_rating_item_text.local-circle-nps{width:40px;height:40px;border-radius:50%;box-sizing:border-box;margin-right:1px;padding:6px}}';
                }
                if(style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                document.getElementsByTagName('head')[0].appendChild(style);            
                return;
            };

            if(newNpsShapeValue === 'square') {

                if (isSafariBrowser) {
                    responsiveCss = '.sv_main .sv_q_rating_item.active .sv_q_rating_item_text{border:1px solid ' + json.mainSurveyColor + ' !important;z-index:900000000}' + ' @media screen and (max-width:335px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}.local-square-nps{width:22px;border-radius:0;margin-right:0}}@media screen and (min-width:336px) and (max-width:357px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:28px}.local-square-nps{width:26px;border-radius:0;margin-right:0}}@media screen and (min-width:358px) and (max-width:374px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}.local-square-nps{width:28px;border-radius:0;margin-right:0}}@media screen and (min-width:375px) and (max-width:401px){.sv_q_rating_min_text{margin-top:32px}.local-square-nps{width:29px;border-radius:0;margin-right:0}}@media screen and (min-width:402px) and (max-width:429px){.sv_q_rating_min_text{margin-top:35px}.local-square-nps{width:32px;border-radius:0;margin-right:0}}@media screen and (min-width:430px) and (max-width:480px){.sv_q_rating_min_text{margin-top:32.5px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.local-square-nps{width:34.5px;border-radius:0;margin-right:0}}@media screen and (min-width:481px) and (max-width:758px){.sv_q_rating_min_text{margin-top:30px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_max_text{position:absolute;float:right;right:20px}.local-square-nps{width:38px;border-radius:0;margin-right:0}}@media screen and (min-width:759px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static;font-size:12px;color:#585b5d}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static}span.sv_q_rating_max_text{margin-left:0;display:inline;float:none;font-size:12px;color:#585b5d}span.sv_q_rating_item_text{padding:5px}.local-square-nps{width:30px;border-radius:0;margin-right:0}}@media screen and (min-width:300px) and (max-width:340px){.local-square-nps{width:20px;border-radius:0;margin-right:0}}@media screen and (min-width:341px) and (max-width:351px){.local-square-nps{width:23px;border-radius:0;margin-right:0}}@media screen and (min-width:352px) and (max-width:372px){.local-square-nps{width:24px;border-radius:0;margin-right:0}}@media screen and (min-width:373px) and (max-width:373px){.local-square-nps{width:25px;border-radius:0;margin-right:0}}@media screen and (min-width:374px) and (max-width:417px){.local-square-nps{width:26px;border-radius:0;margin-right:0}}@media screen and (min-width:418px) and (max-width:467px){.local-square-nps{width:30px;border-radius:0;margin-right:0}}@media screen and (min-width:481px) and (max-width:504px){.local-square-nps{width:35px;border-radius:0;margin-right:0}}@media screen and (min-width:505px) and (max-width:505px){.local-square-nps{width:37px;border-radius:0;margin-right:0}}';
                } else {
                    responsiveCss = '.sv_main .sv_q_rating_item.active .sv_q_rating_item_text{border:1px solid ' + json.mainSurveyColor + ' !important;z-index:900000000}' + ' @media screen and (max-width:335px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}.local-square-nps{width:24px;border-radius:0;margin-right:0}}@media screen and (min-width:336px) and (max-width:357px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:28px}.local-square-nps{width:26px;border-radius:0;margin-right:0}}@media screen and (min-width:358px) and (max-width:374px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:.5em;display:block;float:right;position:absolute;margin-top:30px}.local-square-nps{width:28px;border-radius:0;margin-right:0}}@media screen and (min-width:375px) and (max-width:401px){.sv_q_rating_min_text{margin-top:32px}.local-square-nps{width:29px;border-radius:0;margin-right:0}}@media screen and (min-width:402px) and (max-width:429px){.sv_q_rating_min_text{margin-top:35px}.local-square-nps{width:32px;border-radius:0;margin-right:0}}@media screen and (min-width:430px) and (max-width:480px){.sv_q_rating_min_text{margin-top:32.5px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.local-square-nps{width:34.5px;border-radius:0;margin-right:0}}@media screen and (min-width:481px) and (max-width:758px){.sv_q_rating_min_text{margin-top:30px}.sv_q_rating{width:100%;margin:20px 0 20px 0}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_max_text{position:absolute;float:right;right:20px}.local-square-nps{width:38px;border-radius:0;margin-right:0}}@media screen and (min-width:759px){.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static;font-size:12px;color:#585b5d}.sv_main .sv_container .sv_body .sv_p_root .sv_q_rating .sv_q_rating_min_text{margin-right:0;display:inline;float:none;position:static}span.sv_q_rating_max_text{margin-left:0;display:inline;float:none;font-size:12px;color:#585b5d}span.sv_q_rating_item_text{padding:5px}.local-square-nps{width:30px;border-radius:0;margin-right:0}}';
                }

                css += responsiveCss;
            }


            if(style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.getElementsByTagName('head')[0].appendChild(style);
        });
        console.log("*****");

        var converter = new showdown.Converter();
        _apollo_frame.script.onTextMarkdown.add(function (survey, options) {
                var str = converter.makeHtml(options.text);
                str = str.substring(3);
                str = str.substring(0, str.length - 4);
                options.html = str;
            });

        var notNowButtonAdded = false;
        _apollo_frame.script.onAfterRenderSurvey.add(function() {
            if(notNowButtonAdded) return;
            var notNowButton = document.createElement("input");

            notNowButton.id = 'close-modal-survey-button';
            notNowButton.type = "button";
            notNowButton.className = "close-modal not-now-button";
            notNowButton.value = (json.buttonTextNotNow || 'Ahora no');

            document.querySelector('.sv_nav').appendChild(notNowButton);

            notNowButtonAdded = true;
            var surveyTitleElement = document.getElementsByClassName('sv_page_title')[0];
            if(surveyTitleElement !== undefined) {
                surveyTitleElement.style.color = json.surveyTitleColor;
            }

            var surveyBody = document.getElementsByClassName('sv_main');
            if(surveyBody.length > 0) {
                surveyBody[0].style.fontFamily = json.surveyFontFamily;
            }

            //Cambiar de posición el "minRateDescription"
            console.log("json.elements.minRateDescription: ");
            var minRateDescription = json.pages[0].elements[0].minRateDescription;
            if(minRateDescription !== null && minRateDescription !== undefined) {
                //document.getElementsByClassName('sv_q_rating_max_text').style.display = 'none';
            }
            
        });

        var newModalFooter = json.pages[0].elements[json.pages[0].elements.length - 1].html;
        if(newModalFooter !== undefined) {
            newModalFooter = converter.makeHtml(newModalFooter);
            var disclaimerElement = document.createElement('div');

            disclaimerElement.id = 'survey-footer';
            disclaimerElement.innerHTML = '<div class="modal-footer-dynamic-content" ' + 'style="color: ' + json.surveyDisclaimerColor + "; font-family: " + json.surveyFontFamily + ';">' + newModalFooter + '</div>';
            document.getElementsByTagName('body')[0].appendChild(disclaimerElement);
        }

        _apollo_frame.element = new Vue({
            el: '#surveyElement',
            data: {
                survey: _apollo_frame.script
            }
        });

        const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        const targetSurveyDOM = document.getElementById('surveyElement');
        const config = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true,
        };

        const observer = new MutationObserver(function(mutations) {
            parent.window.postMessage({
                eventId: 'resizeModalHeight-YWxjby90ZXN0LWRhbmllbA==',
                data: {
                    realIframeFullHeight: getRealIframeFullHeight(0, 0)
                }
            }, '*');

            let elementWithFinalMessage = document.getElementsByClassName('sv_completed_page');
            if(elementWithFinalMessage.length > 0) {
                parent.window.postMessage({
                    eventId: 'resizeModalHeight-YWxjby90ZXN0LWRhbmllbA==',
                    data: {
                        realIframeFullHeight: getRealIframeFullHeight(46 * 2, 0)
                    }
                }, '*');
                observer.disconnect();                
            }

        });

        observer.observe(targetSurveyDOM, config);

        function getRealIframeFullHeight(increment, decrement) {
            var disclaimerElementHeight = (document.getElementById('survey-footer') === null ? 0 : document.getElementById('survey-footer').offsetHeight);
            var realIframeFullHeight = document.body.children[0].offsetHeight + disclaimerElementHeight;

            return realIframeFullHeight + increment - decrement;
        }

        window._apollo_frame.script.onComplete.add(function (result) {
            let surveyFooter = document.getElementById('survey-footer');
            if(surveyFooter !== null) {
                surveyFooter.style.display = 'none';
            }
            parent.window.postMessage({
                eventId: 'showCloseModalButton-YWxjby90ZXN0LWRhbmllbA=='
            }, '*');
        });

        window.onmessage = function(e){
            if(e.data == 'addEventListenerToCloseButton') {
                document.getElementById('close-modal-survey-button').addEventListener('click', function() {
                    parent.window.postMessage('apolloCloseSurvey-YWxjby90ZXN0LWRhbmllbA==', '*');
                });
            }

            if(e.data == 'getFullIframeHeight') {
                parent.window.postMessage({
                    eventId: 'resizeModalHeight-YWxjby90ZXN0LWRhbmllbA==',
                    data: {
                        realIframeFullHeight: getRealIframeFullHeight(0, 0)
                    }
                }, '*');
            }
        };

    })(window);