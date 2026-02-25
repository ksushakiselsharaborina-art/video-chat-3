const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'commonName', value: '192.168.1.101' }
];

const options = {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 2, value: '192.168.1.101' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '192.168.1.101' }
      ]
    }
  ]
};

const pems = selfsigned.generate(attrs, options);

if (!fs.existsSync('cert')) {
  fs.mkdirSync('cert');
}

fs.writeFileSync(path.join('cert', 'key.pem'), pems.private);
fs.writeFileSync(path.join('cert', 'cert.pem'), pems.cert);

console.log('Сертификаты созданы в папке cert/');
console.log('key.pem - приватный ключ');
console.log('cert.pem - сертификат');
