# Skill: Terraform Infrastructure

> Modular Terraform patterns for cloud infrastructure.

## Project Structure

```
terraform/
├── main.tf                  # Main configuration
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── terraform.tfvars         # Variable values (DO NOT COMMIT)
├── backend.tf               # Remote state config
├── dev.tfvars               # Development variables
├── prod.tfvars              # Production variables
│
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── kubernetes/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── networking/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── environments/
    ├── dev/
    │   ├── main.tf
    │   └── terraform.tfvars
    └── prod/
        ├── main.tf
        └── terraform.tfvars
```

## Module Pattern (VPC Example)

### modules/vpc/main.tf
```hcl
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = var.vpc_name
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.vpc_name}-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]

  tags = {
    Name = "${var.vpc_name}-private-${count.index + 1}"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.vpc_name}-igw"
  }
}
```

### modules/vpc/variables.tf
```hcl
variable "vpc_name" {
  description = "Name of VPC"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

variable "environment" {
  description = "Environment name"
  type        = string
}
```

### modules/vpc/outputs.tf
```hcl
output "vpc_id" {
  description = "ID of VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}
```

## Root Module (Development)

### environments/dev/main.tf
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      Project     = "my-app"
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  vpc_name = "my-app-dev-vpc"
  vpc_cidr = "10.0.0.0/16"

  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

  azs         = ["us-east-1a", "us-east-1b"]
  environment = "dev"
}

module "database" {
  source = "../../modules/database"

  db_name     = "myapp_dev"
  db_user     = var.db_user
  db_password = var.db_password

  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  engine_version      = "15.3"
  instance_class      = "db.t3.micro"  # Small for dev
  allocated_storage   = 20

  environment = "dev"
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  cluster_name = "my-app-dev-cluster"
  cluster_version = "1.28"

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  public_subnet_ids  = module.vpc.public_subnet_ids

  node_group_desired_size = 1
  node_group_min_size     = 1
  node_group_max_size     = 3
  instance_types          = ["t3.medium"]

  environment = "dev"
}
```

### environments/dev/terraform.tfvars
```hcl
aws_region = "us-east-1"
db_user    = "admin"
# db_password set via environment variable: TF_VAR_db_password
```

### environments/dev/variables.tf
```hcl
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_user" {
  description = "Database admin user"
  type        = string
}

variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}
```

### environments/dev/outputs.tf
```hcl
output "kubernetes_cluster_name" {
  description = "EKS cluster name"
  value       = module.kubernetes.cluster_name
}

output "kubernetes_cluster_host" {
  description = "EKS cluster endpoint"
  value       = module.kubernetes.cluster_endpoint
  sensitive   = true
}

output "database_endpoint" {
  description = "RDS database endpoint"
  value       = module.database.endpoint
}
```

## Production Environment

### environments/prod/main.tf
```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  # Added: Assume role for prod access
  assume_role {
    role_arn = "arn:aws:iam::PROD_ACCOUNT_ID:role/TerraformRole"
  }
}

module "vpc" {
  source = "../../modules/vpc"

  vpc_name = "my-app-prod-vpc"
  vpc_cidr = "10.1.0.0/16"

  public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnet_cidrs = ["10.1.10.0/24", "10.1.11.0/24", "10.1.12.0/24"]

  azs         = ["us-east-1a", "us-east-1b", "us-east-1c"]
  environment = "prod"
}

module "database" {
  source = "../../modules/database"

  db_name     = "myapp_prod"
  db_user     = var.db_user
  db_password = var.db_password

  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids

  # Production-grade settings
  engine_version      = "15.3"
  instance_class      = "db.r6i.xlarge"  # Large for prod
  allocated_storage   = 500
  multi_az            = true              # High availability
  backup_retention    = 30                # 30-day backups
  skip_final_snapshot = false             # Always snapshot before delete

  environment = "prod"
}

module "kubernetes" {
  source = "../../modules/kubernetes"

  cluster_name = "my-app-prod-cluster"

  node_group_desired_size = 3
  node_group_min_size     = 3
  node_group_max_size     = 10
  instance_types          = ["t3.large", "t3.xlarge"]

  enable_cluster_autoscaler = true
  enable_monitoring         = true

  environment = "prod"
}
```

## Best Practices

1. **State Management**
   ```hcl
   # Use remote state (S3 + DynamoDB)
   backend "s3" {
     bucket         = "company-terraform-state"
     key            = "prod/terraform.tfstate"
     region         = "us-east-1"
     encrypt        = true
     dynamodb_table = "terraform-locks"  # State locking
   }
   ```

2. **Variable Sensitivity**
   ```hcl
   variable "db_password" {
     type      = string
     sensitive = true  # Won't print in logs
   }
   ```

3. **Environment Separation**
   ```
   environments/
   ├── dev/
   │   └── terraform.tfvars
   └── prod/
       └── terraform.tfvars
   ```

4. **Naming Convention**
   ```hcl
   tags = {
     Name        = "${var.app_name}-${var.environment}-${local.resource_type}"
     Environment = var.environment
     Project     = var.app_name
     ManagedBy   = "Terraform"
   }
   ```

5. **Modularity**
   - One responsibility per module
   - Reuse modules across environments
   - Make modules configurable

## Common Commands

```bash
# Format code
terraform fmt -recursive

# Validate
terraform validate

# Plan (dev)
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply (dev)
terraform apply -var-file=environments/dev/terraform.tfvars

# Destroy (be careful!)
terraform destroy -var-file=environments/dev/terraform.tfvars

# Workspace switching
terraform workspace new dev
terraform workspace select prod
```
