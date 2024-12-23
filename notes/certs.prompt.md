### **Genera una chiave privata e un certificato auto-firmato**
Esegui questo comando nella Git Bash:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
```

#### Dettagli:
- `req`: Richiede un certificato.
- `-x509`: Genera un certificato auto-firmato.
- `-newkey rsa:2048`: Crea una nuova chiave RSA a 2048 bit.
- `-nodes`: Non crittografa la chiave privata (non richiederà una passphrase).
- `-keyout key.pem`: Salva la chiave privata nel file `key.pem`.
- `-out cert.pem`: Salva il certificato auto-firmato nel file `cert.pem`.
- `-days 365`: Il certificato sarà valido per 365 giorni.