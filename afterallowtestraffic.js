
'use strict';

var assert = require('assert');
var AWS = require('aws-sdk');
var http = require('http');


var url = "http://ecs.abdelalitraining.com:8080"
const codedeploy = new AWS.CodeDeploy({apiVersion: '2014-10-06'});


function func1(arg1){
    
    console.log("Hello"+arg1)
}

exports.handler = (event, context, callback) => {
    //Read the DeploymentId from the event payload.
    var deploymentId = event.DeploymentId;

    //Read the LifecycleEventHookExecutionId from the event payload
    var lifecycleEventHookExecutionId = event.LifecycleEventHookExecutionId;
    
    var validationTestResult = "Failed";
    
    

    /*
     Enter validation tests here.
    */
    // Notify CodePipeline of a successful job
    var putJobSuccess = function(message) {
        var params = {
     		deploymentId: deploymentId,
     		lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
     		status: message // status can be 'Succeeded' or 'Failed'
     	};
        
        codedeploy.putLifecycleEventHookExecutionStatus(params, function(err, data) {
            if (err) {
                // Validation failed.
                callback('Validation test failed');
            } else {
                // Validation succeeded.
                callback(null, 'Validation test succeeded');
            }
       });
    };
    
    // Notify CodePipeline of a failed job
    var putJobFailure = function(message) {
        var params = {
     		deploymentId: deploymentId,
     		lifecycleEventHookExecutionId: lifecycleEventHookExecutionId,
     		status: message // status can be 'Succeeded' or 'Failed'
     	};
        
        codedeploy.putLifecycleEventHookExecutionStatus(params, function(err, data) {
            if (err) {
                // Validation failed.
                callback('Validation test failed');
            } else {
                // Validation succeeded.
                callback(null, 'Validation test succeeded');
            }
       });
    };
    
    // Validate the URL passed in UserParameters
    if(!url || url.indexOf('http://') === -1) {
        putJobFailure(validationTestResult);  
        return;
    }
    
    // Helper function to make a HTTP GET request to the page.
    // The helper will test the response and succeed or fail the job accordingly 
    var getPage = function(url, callback) {
        var pageObject = {
            body: '',
            statusCode: 0,
            contains: function(search) {
                return this.body.indexOf(search) > -1;    
            }
        };
        http.get(url, function(response) {
            pageObject.body = '';
            pageObject.statusCode = response.statusCode;
            
            response.on('data', function (chunk) {
                pageObject.body += chunk;
            });
            
            response.on('end', function () {
                callback(pageObject);
            });
            
            response.resume(); 
        }).on('error', function(error) {
            // Fail the job if our request failed
            putJobFailure(validationTestResult);    
        });           
    };
    
    getPage(url, function(returnedPage) {
        try {
            // Check if the HTTP response has a 200 status
            assert(returnedPage.statusCode === 200);
            // Check if the page contains the text "Congratulations"
            // You can change this to check for different text, or add other tests as required
            assert(returnedPage.contains('Congratulations'));  
            
            validationTestResult = "Succeeded"
            
            // Succeed the job
            putJobSuccess(validationTestResult);
        } catch (ex) {
            // If any of the assertions failed then fail the job
            putJobFailure(ex);    
        }
    });     
    // Prepare the validation test results with the deploymentId and
    // the lifecycleEventHookExecutionId for CodeDeploy.
    
 	
    
    // Pass CodeDeploy the prepared validation test results.
    
};