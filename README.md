# ecs blue/green deployment using codedeploy blue/green



* create the ecs task definition using the below command:
```
aws ecs register-task-definition --cli-input-json file://taskdef.json
```
## create cloudmap namespace

* create private cloudmap service discovery
```
aws servicediscovery create-private-dns-namespace \
      --name tutorial \
      --vpc vpc-abcd1234
```
1. output:
 {
    "OperationId": "h2qe3s6dxftvvt7riu6lfy2f6c3jlhf4-je6chs2e"
  }
* get the namespace id

```
aws servicediscovery get-operation \
      --operation-id h2qe3s6dxftvvt7riu6lfy2f6c3jlhf4-je6chs2e
```
1. output 
{
    "Operation": {
        "Id": "h2qe3s6dxftvvt7riu6lfy2f6c3jlhf4-je6chs2e",
        "Type": "CREATE_NAMESPACE",
        "Status": "SUCCESS",
        "CreateDate": 1519777852.502,
        "UpdateDate": 1519777856.086,
        "Targets": {
           "NAMESPACE": "ns-uejictsjen2i4eeg"
        }
    }
}
* create service 
```
aws servicediscovery create-service \
      --name myapplication \
      --dns-config "NamespaceId="ns-uejictsjen2i4eeg",DnsRecords=[{Type="A",TTL="300"}]" \
      --health-check-custom-config FailureThreshold=1
```
1. output
{
    "Service": {
       "Id": "srv-utcrh6wavdkggqtk",
        "Arn": "arn:aws:servicediscovery:region:aws_account_id:service/srv-utcrh6wavdkggqtk",
        "Name": "myapplication",
        "DnsConfig": {
            "NamespaceId": "ns-uejictsjen2i4eeg",
            "DnsRecords": [
                {
                    "Type": "A",
                    "TTL": 300
                }
            ]
        },
        "HealthCheckCustomConfig": {
            "FailureThreshold": 1
        },
        "CreatorRequestId": "e49a8797-b735-481b-a657-b74d1d6734eb"
    }
}
* create the ecs service using the below command:

```
aws ecs create-service --service-name my-service --cli-input-json file://ecs-service.json
```

* describe a service on the ecs cluster

```
aws ecs describe-services --cluster cluster-name --services service-name
```


### ECS standard deployment action

**in this deployment you must have imagedefinitions.json file on your source code or you can 
output it during the build stage in the buildspec.yml file, make sure to add this line n the post-build stage in the buildspec file**

```
printf '[{"name":"container_name","imageUri":"image_URI"}]' > imagedefinitions.json
```

### ECS (Blue/Green) deployment action

**in this deployment you must have imageDetail.json file on your source code or you can 
output it during the build stage in the buildspec.yml file, make sure to add this line n the post-build stage in the buildspec file**
```
printf '{"ImageURI":"%s"}' $REPOSITORY_URI:$IMAGE_TAG  > imageDetail.json
```
* codebuild url
https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html


# troubleshooting aws ecs

## setting up the ssm

* create task iam role

```
{
   "Version": "2012-10-17",
   "Statement": [
       {
       "Effect": "Allow",
       "Action": [
            "ssmmessages:CreateControlChannel",
            "ssmmessages:CreateDataChannel",
            "ssmmessages:OpenControlChannel",
            "ssmmessages:OpenDataChannel"
       ],
      "Resource": "*"
      }
   ]
}
```

* create service for your ecs task

```
aws ecs create-service \
    --cluster cluster-name \
    --task-definition task-definition-name \
    --enable-execute-command \
    --service-name service-name \
    --desired-count 1

```

* update existing service 

```
aws ecs update-service \
   --cluster cluster-name \
   --service my-http-service \
   --task-definition amazon-ecs-sample  \
   --enable-execute-command 
```
* list the task definition 

```
aws ecs list-tasks --cluster default
```

* list the task with the family name

```
aws ecs list-tasks \ 
 --cluster default \
 --family task-name
```

* describe task

```
aws ecs describe-tasks \
    --cluster cluster-name \
    --tasks task-id

```
* after running the above command make sure that you have the same result as shown below:

```
{
    "tasks": [
        {
            ...
            "containers": [
                {
                    ...
                    "managedAgents": [
                        {
                            "lastStartedAt": "2021-03-01T14:49:44.574000-06:00",
                            "name": "ExecuteCommandAgent",
                            "lastStatus": "RUNNING"
                        }
                    ]
                }
            ],
            ...
            "enableExecuteCommand": true,
            ...
        }
    ]
}

```
* if you have not the same result make sure to restart your taskdefinition. try to go to your service and 
make the number of tasks to 0, then reset to the number of tasks that fit you and try to run the same above 
command and see whether you get the result above or not


* run the exec command

```
aws ecs execute-command --cluster cluster-name \
    --task task-id \
    --container container-name \
    --interactive \
    --command "/bin/sh"

```

## References
* https://docs.aws.amazon.com/codepipeline/latest/userguide/tutorials-ecs-ecr-codedeploy.html
* https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html
