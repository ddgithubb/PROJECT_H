import forge from 'node-forge'

const PUBLIC_KEY_PEM = "-----BEGIN RSA PUBLIC KEY-----"+
                    "MIIBCgKCAQEApPWqUHaRqeYBPOdXJlRt4lBPBJ7oGgeDvaH06wObL+JRWYr6WBQ0"+
                    "Rf5fiJYF/Qjhw27MKe9hbPhJbLhUOKZ7A7uazelwCdMfEQepjLEAf0eMQ4PdjjqI"+
                    "0w2PC8BqoeJ+4YWStzQa3MdiirCwgJaArVyuTIUo420zA8f8SRCAA5cUHsi1MeTX"+
                    "TX0ENRXzvNK4TL50OWh5FSqm8sjodA+sgDWOYTyfjmfkoN09r9cIkX9nP+svJX+w"+
                    "iU1Ak0c3gLQrZQao/XwnHOX9IdVb1p44uBor+A49pXkC6ZpUG97L37+2ubAx1TLm"+
                    "2YCGQyEr8vPNdFSupv4Zk1Q8sf4jwNM/pwIDAQAB"+
                    "-----END RSA PUBLIC KEY-----"

export const public_key = forge.pki.publicKeyFromPem(PUBLIC_KEY_PEM);