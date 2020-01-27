# Liveness
Simple  module that implements only one endpoint for  K8S healtcheck.

## Routes

### /up
Called by k8s to ensure the  service is still working

*Response*

    {
        "message": "up"
    }    
