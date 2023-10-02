
# Create a key pair
resource "aws_key_pair" "dominik" {
  key_name   = "dominik-key"
  public_key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPsBWEvoZTh2AWoSoR2uexU2UXjhbBLXavHwJ2OklgYe dominik@Cerberus"
}

# Create an EC2 instance
resource "aws_instance" "my_server" {
  ami           = "ami-0b9094fa2b07038b8"
  instance_type = "t2.micro"

  private_ip = "10.0.0.10"
  subnet_id  = aws_subnet.my_subnet.id

  key_name = aws_key_pair.dominik.key_name

  vpc_security_group_ids = [aws_security_group.my_sg.id]

  tags = {
    Name = "my_server"
  }
}

resource "aws_ec2_instance_state" "my_server_state" {
  instance_id = aws_instance.my_server.id
  state       = "running"
}

# Create an Elastic IP
resource "aws_eip" "my_eip" {
  domain = "vpc"

  instance                  = aws_instance.my_server.id
  associate_with_private_ip = "10.0.0.10"
  depends_on                = [aws_internet_gateway.my_gw]

  tags = {
    Name = "my_eip"
  }
}