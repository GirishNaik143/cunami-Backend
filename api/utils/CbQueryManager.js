'use strict';

const globalConstants = require('./CBGlobalConstants');
const utils = require('util');

module.exports = {
    processRequestQuery: processRequestQuery
}

//Query will be processed as per the Scheme used in "querymen" npm package.
//WebRef: https://www.npmjs.com/package/querymen

/**
 * @api{get} /processQuery Process Query.
 * @apiDescription The intput query will be processed as per the scheme defined by 'querymen' 
 * NPM package (https://www.npmjs.com/package/querymen), the object will be created from
 * the query with parameters for base query, selected fields, cursor and detailed indicator.
 * 
 * 
 * @apiName ProcessQuery
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {Obejct} Query The request query to process.
 * 
 * @apiSuccess {Object} queryObject The process query object which will be used by Mongoose Apis. The object will have following attirbutes:
 * 1. query: The base query or core query parameter for performing the filter operation on database.
 * 2. select: The name of attribute with value 1 or 0 to indicate if the attribute is to be returned in the API response.
 * 3. is_detailed: The indicator for collection to be returned in detailed manner (default one) or list(brief) manner for client consumption.
 * 4. cursor: Attributes for Sorting and Pagination.
 * 
 * @apiSuccessExample The Query: "/posts?name=amit&city=bangalore&fields=name,business_id,phone_number&detailed=false&page=2&limit=20&sort=-createdAt" will result it following Cursor output :
 * 
 * processedQuery = {
 * query: {
 * name: amit,
 * city: bangalore
 * },
 * select: {
 * name: 1,
 * business_id: 1,
 * phone_number: 1
 * },
 * is_detailed: false,
 * cursor: {
 * limit: 20, 
 * skip: 20, 
 * sort: {createdAt: -1}
 * }
 * }
 * 
 * @apiError {String} Error messages as per the condition.
 * 
 */
function processRequestQuery(aRequestQuery) {
    var retProcessedQuery = {};

    //1. Check Base Query object.
    var queryBaseObject = getBaseQueryObject(aRequestQuery);
    if (queryBaseObject) {
        retProcessedQuery.query = queryBaseObject;
}

    //2. Check Selected Fields.
    var querySelectedFields = getSelectedFields(aRequestQuery);
    if (querySelectedFields) {
        retProcessedQuery.select = querySelectedFields;
}

    //3. Check Cursor Objects
    var queryCursor = getQueryCursor(aRequestQuery);
    if (queryCursor) {
        retProcessedQuery.cursor = queryCursor;
}

    //4. Check for Detailed Indicator.
    var detailedIndicator = processDetailedListIndicator(aRequestQuery);
    if ((undefined != detailedIndicator) && (null != detailedIndicator)) {
        retProcessedQuery.is_detailed = detailedIndicator;
}

    return retProcessedQuery;
}

//Query will be processed as per the Scheme used in "querymen" npm package.
//WebRef: https://www.npmjs.com/package/querymen

/**
 * @api{get} /queryCursor Query - Cursor.
 * @apiDescription The intput query will be processed as per the scheme defined by 'querymen' 
 * npm package (https://www.npmjs.com/package/querymen), the standard Cursor object will
 * be created from the query with parameters for limit, pagesize and sorting parameters.
 * 
 * 
 * @apiName QueryCursor
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {Integer} skip The index or offset of the item from where the colletion should be retuned. It is used as skip parameter where skip = page * limit;
 * @apiParam {Integer} limit The maximium records (collection) that should be returned in the response.
 * @apiParam {String} sort Comma separated list of attributes(fields) for sorting with respective order. For descending sort place the hyphen symbol before the attribute.
 * For example: "sort=name,amount" will sort the records based on name and then amount in ascending order while "sort=name,-amount" will sort first 
 * based on name and then in amount in descending order.
 * 
 * 
 * @apiSuccess {Object} cursorObject The cursor object which will be used by Mongoose Apis.
 * @apiSuccessExample The Query: "/posts?page=2&limit=20&sort=-createdAt" will result it following Cursor output :
 * 
 * processedQuery = {
 * query: {},
 * select: {},
 * cursor: {
 * limit: 20, 
 * skip: 20, 
 * sort: {createdAt: -1}
 * }
 * }
 * @apiError {String} Error messages as per the condition.
 * 
 */

function getQueryCursor(aRequestQuery) {
    var skipObject = 0;
    var limitObject = globalConstants.BT_PAGE_SIZE;
    var sortObject = {};

    //1. Check for Skip Parameter (Offset).
    if ((aRequestQuery.skip) && (NaN != Number(aRequestQuery.skip))) {
        skipObject = Number(aRequestQuery.skip);
}

    //2. Check for Limit Parameter (Page size).
    if ((aRequestQuery.limit) && (NaN != Number(aRequestQuery.limit))) {
        limitObject = Number(aRequestQuery.limit);
}

    //3. Check for Sorting Parameters.
    var sortInputString = aRequestQuery.sort;
    if ((sortInputString) && (sortInputString.length > 0)) {
        var sortParmsArray = sortInputString.split(',');

        for (var index = 0; index < sortParmsArray.length; index++) {
            var sortParamString = sortParmsArray[index].trim();
            
            //if ((sortParamString) && (sortParamString.length > 0) && (isTimeStampSortingAvailable(sortParamString)) ) {
            if ((sortParamString) && (sortParamString.length > 0)) {
                if ((sortParamString.startsWith('-')) && (sortParamString.length >= 2)) {
                    sortParamString = sortParamString.substring(1);
                    sortObject[sortParamString] = -1;
} else {
                    sortObject[sortParamString] = 1;
}
}
}
}

    var cursor = {skip:skipObject, limit: limitObject, sort: sortObject};
    //utils.log('QueryManager input Query Object:=> ' + utils.inspect(aRequestQuery, {showHidden: false, depth: null}));
    //utils.log('QueryManager Cursor Object:=> ' + utils.inspect(cursor, {showHidden: false, depth: null}));
    return cursor;
}

/**
 * @api{get} /querySelect Query - Select Fields.
 * @apiDescription The intput query will be processed as per the scheme defined by 'querymen' 
 * npm package (https://www.npmjs.com/package/querymen), the standard Select object will
 * be created from the query with parameters for specifying the fields to fetch with mongoose.
 * 
 * @apiName QuerySelect
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} fields Comma separated list of attributes(fields) which are to be fetched from MongoDB. 
 * For example: "fields=name,amount" will fetch the records with name and amount, 
 * while "sort=-amount" will only fetch the records with all attributes except amount attribute.
 * 
 * 
 * @apiSuccess {Object} selectObject The select object which will be used by Mongoose Apis.
 * @apiSuccessExample The Query: "posts?q=term&fields=title,desc" will result it following Cursor output :
 * {
 * query: {
 * keywords: /term/i
 * },
 * select: {
 * title: 1,
 * desc: 1
 * },
 * cursor: {
 * // defaults 
 * limit: 30, 
 * skip: 0, 
 * sort: {createdAt: -1}
 * }
 * }
 * 
 * @apiError {String} Error messages as per the condition.
 * 
 */

function getSelectedFields(aRequestQuery) {
    var inputFieldsString = aRequestQuery.fields;
    //var selectFieldsObject = {'_id': 0};
    var selectFieldsObject = {};
    if ((inputFieldsString) && (inputFieldsString.length > 0)) {
        var fieldNamesArray = inputFieldsString.split(',');
        for(var index = 0; index < fieldNamesArray.length; index++) {
            var fieldName = fieldNamesArray[index].trim();

            if ((fieldName) && (fieldName.length > 0)) {
                if ((fieldName.startsWith('-')) && (fieldName.length >= 2)) {
                    fieldName = fieldName.substring(1);
                    selectFieldsObject[fieldName] = 0;
                    //selectFieldsArray.push(fieldName);
} else {
                    selectFieldsObject[fieldName] = 1;
}
                //selectFieldsObject.push(fieldName);
}
}
}

    //utils.log('QueryManager input Query Object:=> ' + utils.inspect(aRequestQuery, {showHidden: false, depth: null}));
    //utils.log('QueryManager Select Object:=> ' + utils.inspect(selectFieldsObject, {showHidden: false, depth: null}));
    return selectFieldsObject;
}

/**
 * @api{get} /queryBase Query - Base Query.
 * @apiDescription Get the base query to be used with mongoose apis by taking out the Cursor and Select parameters out.
 * 
 * @apiName BaseQuery
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} QueryParameters The set of parameters in string format separated by & in the standard way.
 * 
 * 
 * @apiSuccess {Object} queryObject The query object which will be used by Mongoose Apis.
 * @apiSuccessExample The Query: "posts?name=amit&fields=title,desc" will result it following Cursor output :
 * {
 * query: {
 * name: amit
 * },
 * select: {
 * title: 1,
 * desc: 1
 * },
 * cursor: {
 * // defaults 
 * limit: 30, 
 * skip: 0, 
 * sort: {createdAt: -1}
 * }
 * }
 * 
 * @apiError {String} Error messages as per the condition.
 * 
 */

//function getBaseQueryObject(aRequestQueryString) {
function getBaseQueryObject(aRequestQueryObject) {
    return getQueryBaseParam(aRequestQueryObject);

    // var retQueryObject = {};
    // if ((aRequestQueryString) && (aRequestQueryString.length > 0)) {
    // var queryComponentArray = aRequestQueryString.split('&');
    // if ((queryComponentArray) && (queryComponentArray.length > 0)) {

    // //Iterate through all the Query statemetns for checking the base params.
    // for (var index = 0; index < queryComponentArray.length; index++) {
    // var queryStatement = queryComponentArray[index].trim();
    // if ((queryStatement) && (queryStatement.length > 0)) {

    // var parsedObject = getQueryNameValueObejct(queryStatement)
    // if (parsedObject) {
    // retQueryObject[parsedObject.name] = parsedObject.value;
    // }
    // }
    // }
    // }
    //}
    //utils.log('QueryManager input Query Object:=> ' + utils.inspect(aRequestQuery, {showHidden: false, depth: null}));
    //utils.log('QueryManager QueryBase Object:=> ' + utils.inspect(retQueryObject, {showHidden: false, depth: null}));
    //return retQueryObject;
}

/*
 * @api{get} /getTimestampSortingOrder Query - Timestamp Sort.
 * @apiDescription Check if the records need to be sorted based on timestamp. The records should be sorted
 * based on created and updated date attributes. It will return -1 for descending timestamp 
 * sorting, 0 for no timestamp soring and 1 for ascending timestamp sorting.
 * 
 * @apiName timestamp
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {String} sort The timestamp string.
 * 
 * 
 * @apiSuccess {Object} Timestamp sort List of recoreds sorted based on timestamp order.
 * @apiSuccessExample The Query: posts?name=amit&sort=timestamp will result it will sort the records in reverse chronological order.
 * {
 * something: "value"
 * }
 * 
 * @apiError {String} Error messages as per the condition.
 * 
// */
// function getTimestampSortingOrder(aRequestQuery) {
// var timestampSort = 0; //0 - No sorting on TimeStamp, 1 = ascending timestamp sorting, -1: descending timestamp sroting.
// if (aRequestQuery) {
        
// var sortInputString = aRequestQuery.sort;
// if ((sortInputString) && (sortInputString.length > 0)) {
// var sortParmsArray = sortInputString.split(',');

// for (var index = 0; index < sortParmsArray.length; index++) {
// var sortParamString = sortParmsArray[index].trim();
                
// if (isTimeStampSortingAvailable(sortParamString)) {
// if ((sortParamString.startsWith('-')) && (sortParamString.length >= 2)) {
// sortParamString = sortParamString.substring(1);
// //sortObject[sortParamString] = -1;
// timestampSort = -1;
// } else {
// //sortObject[sortParamString] = 1;
// timestampSort = 1;
// }
// }
// }
// }
// }

// return timestampSort;
// }

/**
 * @api{get} /processDetailedListIndicator Query - Detailed Indicator.
 * @apiDescription Checks for 'detailed' parameter is present in the query to know if the records need 
 * to be returned with full details or brief list of items to render on the list. By 
 * default detailed indicator is true so it will return the detailed list of items.
 * 
 * @apiName detailed
 * @apiGroup Query
 * @apiVersion 1.0.0
 * 
 * @apiParam {Boolean} detailed The boolean indicator to check if the items need be listed on detailed manner.
 * 
 * @apiSuccess {List} ItemsList List of recoreds either with the detailed or brief manner.
 * @apiSuccessExample The Query: orders/?detailed=false will return the list in brief manner.
 * {
 * something: "value"
 * }
 * 
 * @apiError {String} Error messages as per the condition.
 * 
 */
function processDetailedListIndicator(aRequestQuery) {
    var bRetDetailedList = true;
    if (aRequestQuery) {
        
        var detailedIndicatorParam = aRequestQuery['detailed'];
        if (detailedIndicatorParam) {
            if (detailedIndicatorParam.toUpperCase() === 'FALSE') {
                bRetDetailedList = false;
}

            //delete aRequestQuery.detailed;
}
}

    return bRetDetailedList;
}

//------------------------- Internal Methods -----------------------//
// function isTimeStampSortingAvailable(aSortParamString) {
// var bIsTimeStampSortParam = false;
// if ((aSortParamString) && (('timestamp'.toUpperCase() === aSortParamString.toUpperCase()) 
// || ('-timestamp'.toUpperCase() === aSortParamString.toUpperCase()))) {
// bIsTimeStampSortParam = true;
// }

// return bIsTimeStampSortParam;
// }

function getQueryBaseParam(aQueryObject) {
    var retQueryObject = {};

    if (aQueryObject) {

        //Iterate through all the parameters in the Query object.
        for (var paramName in aQueryObject) {

            //Check if this property belongs to Query or its Prototype.
            if (aQueryObject.hasOwnProperty(paramName)) {
                //Filter out all the Meta properties.
                if (('limit' !== paramName) && ('skip' !== paramName) && ('sort' !== paramName) && ('fields' !== paramName)
&& ('detailed' !== paramName)) {
                    
                    if (aQueryObject[paramName]) {
                        retQueryObject[paramName] = aQueryObject[paramName];
}
}
}
}
}

    return retQueryObject;
}

// function getQueryNameValueObejct(aQueryStatement) {
// var retQueryObject;
// if ((aQueryStatement) && (aQueryStatement.length > 0)) {
// aQueryStatement = decodeURI(aQueryStatement);
// var delimeterArray = ['=', '!=', '>', '>=', '<', '<='];
// for (var index = 0; index < delimeterArray.length; index++) {
// if (aQueryStatement.includes(delimeterArray[index])) {
// retQueryObject = getQueryNameValueObejctWithDelimeter(aQueryStatement, delimeterArray[index]);
// break;
// }
// }
// }

// return retQueryObject;
// }

// function getQueryNameValueObejctWithDelimeter(aQueryStatement, aDelimeter) {
// var retQueryObject;
// if (aQueryStatement && aDelimeter) {
// if ( (-1 !== aQueryStatement.indexOf(aDelimeter)) && (false === aQueryStatement.startsWith(aDelimeter)) &&
// (false === aQueryStatement.endsWith(aDelimeter)) && (aQueryStatement.length > (aDelimeter.length + 2)) 
// && (aQueryStatement.split(aDelimeter).length > 1)) {

// var paramName = aQueryStatement.split(aDelimeter)[0].trim();
// var paramValue = aQueryStatement.split(aDelimeter)[1].trim();
// if ((paramName) && (paramName.length > 0) && (paramValue) && (paramValue.length > 0)) {
                    
// //Filter out all the Cursor, Select attributes.
// if (('limit' !== paramName) && ('skip' !== paramName) && ('sort' !== paramName) && ('fields' !== paramName)
// && ('detailed' !== paramName)) {
                        
// var retQueryObject = {}; 
// retQueryObject.name = paramName;

// if ('=' === aDelimeter) {
// retQueryObject.value = getEqualtoParam(paramValue);
// } else if ('!=' === aDelimeter) {
// retQueryObject.value = getNotEqualtoParam(paramValue);
// } if ('>' === aDelimeter) {
// retQueryObject.value = getGreaterThanParam(paramValue);
// } if ('>=' === aDelimeter) {
// retQueryObject.value = getGreaterThanOrEqualParam(paramValue);
// } if ('<' === aDelimeter) {
// retQueryObject.value = getLessThanParam(paramValue);
// } if ('<=' === aDelimeter) {
// retQueryObject.value = getLessThanOrEqualParam(paramValue);
// }
// } 
// }
// }
// }

// return retQueryObject;
// }

// function getEqualtoParam(aParamValue) {
// var valueObject;

// //Get array of Values from comma separated string.
// if (aParamValue.split(',').length > 0) {
// var valuesArray = aParamValue.split(',');
// if ((valuesArray) && (valuesArray.length >= 2)) {
// for (var index = 0; index < valuesArray.length; index++) {
// valuesArray[index] = valuesArray[index].trim();
// }

// valueObject = {$in: valuesArray};
// } else {
// valueObject = aParamValue;
// }
// } else {
// valueObject = aParamValue;
// }
// return valueObject;
// }

// function getNotEqualtoParam(aParamValue) {
// var valueObject;

// //Get array of Values from comma separated string.
// if (aParamValue.split(',').length > 0) {
// var valuesArray = aParamValue.split(',');
// if ((valuesArray) && (valuesArray.length >= 2)) {
// for (var index = 0; index < valuesArray.length; index++) {
// valuesArray[index] = valuesArray[index].trim();
// }

// valueObject = {$nin: valuesArray};
// } else {
// valueObject = {$ne: aParamValue};
// }
// } else {
// valueObject = {$ne: aParamValue};
// }

// return valueObject;
// // //2. Check for any 'Not equal to' instance. 
// // } else if (aParamValue.startsWith('-')) {
// // valueObject = {$ne: queryValue.substring(1, queryValue.length)};
// // }
// }

// function getGreaterThanParam(aParamValue) {

// var valueObject;
// if (aParamValue) {
// valueObject = {$gt: aParamValue};
// }
// return valueObject;
// }

// function getGreaterThanOrEqualParam(aParamValue) {

// var valueObject;
// if (aParamValue) {
// valueObject = {$gte: aParamValue};
// }
// return valueObject;
// }

// function getLessThanParam(aParamValue) {

// var valueObject;
// if (aParamValue) {
// valueObject = {$lt: aParamValue};
// }
// return valueObject;
// }

// function getLessThanOrEqualParam(aParamValue) {

// var valueObject;
// if (aParamValue) {
// valueObject = {$lte: aParamValue};
// }
// return valueObject;
// }
