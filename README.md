# Personal website

This repo contains all of the code used to set up my website.

## Infrastructure

To host my website, I use infrastructure provided by Amazon Web Services. I provision this infrastructure using terraform, a really cool IaC tool. All terraform files are located in the `terraform` folder.

For terraform to work with AWS, you need to have an AWS account, as well as have `aws-cli` installed and configured (just by running `aws configure` and giving it relevant data).

The `terraform` folder contains three terraform configuration files (`.tf`); they do not need to be separate, but it's easier to work with them if they are. The `.tf` files are written in a declarative manner, meaning they describe a state which terraform needs to figure out a way to reach. Terraform works with many different cloud services, AWS just being one of them, so it's important to tell terraform which service I want to use. This is done in the `provider.tf` file, where I specify I want to provision infrastructure from AWS, and I also tell it I want to provision from a specific AWS region (for me that's eu-central-1).

`network.tf` contains the desired configuration of the VPC and the subnet where the web server will reside, but it also contains a security group that will apply to the server. A security group is just a set of allowed inbound and outbound network rules for members of that group. In this particular case, I allowed only inbound HTTP, HTTPS, SSH and ICMP requests, and of course allowed all outbound traffic.

`instances.tf` contains a couple of interesting things. Most notably, it defines an actual EC2 instance that will act as my web server. It also contains an AWS key pair and an Elastic IP that I associate with the instance. An AWS key pair allows me to ssh into the instance with my desired key; I generated this key using ssh-keygen and then provided the public key to AWS by creating this resource (NEVER let anyone know your private key, meaning don't accidentally have it in your public repo). Lastly, an Elastic IP is a static IPv4 address bound to your account until you release it. **Important:** if you have an Elastic IP that is **NOT** bound to a running instance, you will be paying an extra fee to Amazon.

Positioning in the `terraform` folder and running `terraform apply` will provision these resources from AWS. You can also run `terraform plan` to see the changes that would occur were you to `terraform apply` them.

## Configuration

I'm using Ansible for server configuration (and deployment). Even though there is currently only one type of server and only one instance of it running, I have laid the groundwork for my ansible configuration files to be easily scalable. All of those files can be found in the `ansible` folder.

The `ansible` folder actually contains code for three types of use cases. First one is for initializing the servers. Running `init.sh` runs ansible-playbook with `init.yml` configuration file, it initializes Amazon EC2 instances by logging into them using the private key of the AWS key pair provisioned with terraform, it installs updates, and creates and sets up the _ansible_ user which will be used for all future ansible logins. This may not be necessary, I could keep using the default AWS ec2-user, but were I to somehow acquire servers that weren't from AWS, things would get complicated, so I always like to create the _ansible_ user on every single machine I plan to configure with ansible. Creating the user also means creating an ssh key for this user; again, I did this with ssh-keygen.

The second use case is actual configuration. Running `ansible-playbook configure.yml` configures all servers to a desired configuration. All servers have a specific role, and all roles have their own configuration files. `configure.yml` updates the repository index of every server and then configures every role with its configuration file. So far, there is only one role, which is the `web_servers` role, and its configuration file is in the `ansible/roles/web_servers/tasks` folder. Currently, `web_servers` are configured to have Docker installed and running, and also to have all the necessary files for SSL to work.

The third use case is deployment! Running `ansible-playbook deploy.yml` logs into all machines of the `web_servers` role, pulls the latest docker image from dockerhub and then (re)starts the container with that new image. I usually don't run this by itself, since it is automatically ran as a part of my little CI/CD pipeline I set up here with GitHub actions.

## CI/CD

Every time a change is made in the `app` folder of the repo and pushed, the docker image gets automatically built, pushed to my dockerhub repo and then deployed on the server by running`ansible-playbook deploy.yml`. This is all done using GitHub actions, and, of course, the workflow for this can be found in the `.github/workflows` folder.

## The website

I'm not a front-end guy, so I try to keep it as simple as I can, but then again, I don't want it looking awful. The webpage is mostly basic HTML, some Bootstrap so it looks decent, and a little bit of javascript. All served to you by a simple node.js server. This is all contained in the `app` folder which also contains the Dockerfile (and .dockerignore) used to build the docker image that gets pulled and deployed on the server.

## TODO

### Set up certbot and an nginx server for SSL.
As it currently stands I have a certificate from porkbun, which I have to manually redownload every 75-90 days and use ansible to distribute it to my web servers. This is BAD! So in the future I definitely want to automate that part as well.

### Add more features to the web server

Maybe a page/section with my projects, my CV, etc.
