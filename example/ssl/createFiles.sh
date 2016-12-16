
rm example.crt example.key
openssl genrsa -des3 -passout pass:x -out example.pass.key 2048
openssl rsa -passin pass:x -in example.pass.key -out example.key
echo ""
echo "-----------------------------"
echo "Common name (FQDN):"
hostname
echo "-----------------------------"
echo "Warning: you must type correctly the common name below. Every other question is optional."
echo "-----------------------------"
echo ""
openssl req -new -key example.key -out example.csr
openssl x509 -req -days 365 -in example.csr -signkey example.key -out example.crt
rm example.pass.key example.csr
