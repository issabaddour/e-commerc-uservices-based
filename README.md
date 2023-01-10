# Microservices-based application

This porject aims to demonstrate the advantages of microservices architecture. We built a simple e-commerce web application and deploy it on a VPC (virtual private cloud) that contains a cluster of servers.
We used Amazon Route 53 service, which is a DNS (domain name system) service that create a hosted zone for our VPC. We added a record inside the hosted zone to link the application with the domain ibaddour.com so we can use the following URL from any place to access the application while the servers are running:
http://ibaddour.com (update: the domain has expired)

## Application components
This application contains only the core functionalities needed to cover any e-commerce business requirements. It consists of the following components:
- User service: handle operations on user account
- Products service: handle operations on products and its details
- Cart service: handle operations on user’s cart and orders
- Authentication service: handle user session and login/ logout operations using Auth0-IDaaS
- Gateway service: handle client requests and forward them to other services
- MongoDB database: stores user’s data
- MySQL database: stores products’ data
- IBM Cloudant database: stores cart and orders data

## Deployment infrastructure
Using Amazon EC2 service, we created a cluster of servers inside the VPC (virtual private cloud); this cluster contains seven nodes (1 master and 6 slaves). Deploying on cluster instead of single server gives the system high availability and reliability.

## Building Docker images (containerizing the components)
In real world scenario, each service could have its own developing team due to the loose coupling feature of microservices architecture. In the application, all services have been developed separately using different technology.

We need Docker file for each service in order to bundle it in a single Docker image. Each database need to run separately from its service, hence it will run in different container and it is not part of the service image. 

After building container image for each service, we pushed them into Docker Hub repositories in my account that is why all images name starts with issabaddour (account id).

## Deploying the application
We used Kubernetes to deploy and manage the services. In Kubernetes, we use files written in YAML language to set our desired configuration on the cluster and all the resources needed in order to run the application properly. Hence, for each deployment, service, feature etc. we have a YAML file that describe and configure that part of the application. The next section shows what resources needed in the application and their respective YAML files.

To deploy databases in the cluster we used the official docker images, which is already pushed to Docker Hub in the official repositories for each database system. We should mention image name with desired version in the configuration files then kubernetes will pull and deploy it. After applying the desired configuration using  ```kubctl apply``` command, the application will run as shown in the following diagram.

Kubernetes will arrange the pods (logical host for the container) on all the available nodes in the clusters, which in this case 6 slave nodes. To show pods details including the node name that runs each one by  ```kubectl get pods –o wide``` command, result will be as the following.

The previous YAML files show that we configured the application to create three replicas for each service -except Gateway service-. Since we used Cloudant database, which is a service from IBM Cloud, it will not show up in the cluster, however, we can see that the Cart service connecting to the internet (outside the cluster) because it is connected to Cloudant database in IBM Cloud. The same goes for Authentication service, which is an IDaaS service, provided by Auth0, Gateway service would connect to this service on the internet as well to validate users’ requests. Hence, we have 12 running pods (pods are logical host for the containers); these pods are distributed on six slave nodes.

## Testing the application
I have followed two scenarios to show more advantages of this application architecture.
### Self-healing test
We can identify three types of failure that could happen in the application; throughout this test, we will see the system behavior in the following cases:
- Node failure
- Pod failure
- Container failure

#### Node failure
To simulate node failure we can use AWS console to terminate one of EC2 instances, in this test we terminated:
 ```
 ip-172-20-59-96.ap-south-1.compute.internal
 ```
This node was hosting one replica from each of User service and Products service, which means that the terminated node had two pods:
```
flask-user-75fb7bd745-djzqm
spring-products-78f44f467f-r8fw9
```
After five to ten minutes, we could see that a new node has been created with two new pods to replace the original ones. New node’s name is:
```
ip-172-20-38-135.ap-south-1.compute.internal
```
New pods’ names are:
```
flask-user-75fb7bd745-fl54f
spring-products-78f44f467f-xl8z5
```
#### Pod failure
To simulate pods failure we can use kubernetes control command to delete any pod. We used the following command to delete two pods:
```
Kubectl delete pod flask-user-75fb7bd745-ghkzp
Kubectl delete pod spring-products-78f44f467f-xl8z5
```
After five minutes, we checked system state and found that two new pods have been created, hence, the number of pods match the desired configuration.
New pods’ names are:
```
flask-user-75fb7bd745-d7ce1
spring-products-78f44f467f-s6ca8
```            
               
#### Container failure
This case is the simplest one as kubernetes can restart the containers inside any pod in a matter of few seconds thanks to the lightweight feature of containers.
I used kubectl exec command to execute ```kill 1``` command on container inside the following pod:
```
flask-user-75fb7bd745-fl54f
```
After checking the state, we found that the pod was still running and the only change was the number of restarts for that pod.

### Auto-scaling test
In the initial configuration, we used YAML files to scale up each service (except Gateway service) manually. In paragraph 6.2.4.2, the configuration shows that the parameter replicas takes the value of three. However, since this value may not match with the actual needs, creating three replicas will waste the resources. In order to make the system more efficient, we should use HPA (Horizontal Pod Auto-scaler), which scales pods up or down based on resource utilization.
We used the following command to apply auto-scaling based on CPU usage. Kubernetes will create new replica when the CPU usage reaches the defined threshold.
```
kubectl autoscale deployment flask-user --cpu-percent=80 --min=1 --max=5 
kubectl autoscale deployment node-cart --cpu-percent=80 --min=1 --max=5 
kubectl autoscale deployment s-products --cpu-percent=80 --min=1 --max=5
```
After five minutes of being in idle state (without requests load), we found that all replicas has been scaled down to one.

To simulate a load of requests from clients, we deployed a new pod that generates fake requests and sends it to all the services. These requests will force pods to consume more resources, and eventually CPU usage will reach its threshold. After five minutes of generating fake load, we found that kubernetes starts creating new replicas, but this time services are not equally scaled, thanks to auto-scaling configuration Cart-service was scaled up to two replicas only and one replica of User-service was enough to handle the fake load, however, five replicas of Products-service was needed. Figure 6.11 shows application components after sending fake load of requests to the services.

##  Conclusion
Implementing a microservices-based application and running tests on it helped us understand the benefits of this architecture and demonstrate its advantages. The demonstrated advantages are:
- High availability
We found that the application was able to recover from three types of failure (node, pod and container), and how it maintains the desired configuration specified by system administrator.
- Easily scalable
We found how we could easily use YAML files to configure the desired number of replicas for each component in the application, and how we could use resource metrics (CPU usage) to apply auto-scaling based on predefined threshold value.
- Efficiency
We found how applying auto-scaling configuration would help in minimizing resources usage as the components will be scaled up or down based on the current needs.
- Polyglot model
We could use different platform/ framework with different database system for each service, which allows using the right technology for the right task, with no long-term commitment to it. Moreover, the freedom of using many technologies let developer choose what match their skills and previous experiences.
- Flexible model
Changes in business logic will lead to requirements that affect a small part of the application. Since each service is isolated from the others, we could redeploy that part without having to shut down or disturb the remaining parts.
- Easily integrated
We easily integrated Authentication service provided by Auth0 with the application, and we linked one service with external database provided by IBM Cloud (IBM Cloudant).
