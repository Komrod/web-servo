#!/bin/bash

echo "-----------------------------------"
echo "Create local SSL files"


##########################################
# Go to directory
##########################################

if [ "$1" != "" ]; then
	cd "$1" > /dev/null 2>&1
	if [ $? != 0 ]; then
	    echo "Fail to change dir to \"$1\". Aborting."
	    exit 1;
	fi
fi


##########################################
# Clean 
##########################################

rm ssl_hostname.txt captn.csr captn.key captn.pass.key captn.crt > /dev/null 2>&1


##########################################
# Verify command availability  
##########################################

command -v hostname >/dev/null 2>&1 || { echo >&2 "Command "hostname" not found.  Aborting."; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo >&2 "Command "openssl" not found.  Aborting."; exit 1; }


##########################################
# Save hostname in a file
##########################################

echo $'\n\n\n\n' > ssl_hostname.txt
hostname >> ssl_hostname.txt
echo $'\n\n\n' >> ssl_hostname.txt


##########################################
# Generate key
##########################################

openssl genrsa -des3 -passout pass:x -out captn.pass.key 2048 >/dev/null 2>&1
openssl rsa -passin pass:x -in captn.pass.key -out captn.key >/dev/null 2>&1

##########################################
# Generate key
##########################################

cat ssl_hostname.txt | openssl req -new -key captn.key -out captn.csr >/dev/null 2>&1


##########################################
# Generate certificate
##########################################

openssl x509 -req -days 365 -in captn.csr -signkey captn.key -out captn.crt 
#>/dev/null 2>&1


##########################################
# Remove temp files
##########################################

rm captn.pass.key captn.csr ssl_hostname.txt > /dev/null 2>&1


##########################################
# Detects error
##########################################

if [ ! -e "captn.key" ] || [ ! -e "captn.crt" ]; then
    echo "Fail to generate the files. Aborting."
fi


##########################################
# Exit
##########################################

if [ -e "captn.key" ] && [ -e "captn.crt" ]; then
	echo "Successfully created"
	dir=${PWD##*/}  
	echo "-----------------------------------"
	echo "SSL files:"	
	echo "- $dir/captn.key"
	echo "- $dir/captn.crt"
    exit 0;
fi

exit 1;

