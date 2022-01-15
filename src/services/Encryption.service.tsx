import { public_key } from "../config/public_key";
import forge from 'node-forge';
import { Buffer } from 'buffer'

export function encryptPassword(pwd: string) {
    const key = forge.random.getBytesSync(32)
    const encKey = forge.util.encode64(public_key.encrypt(key, 'RSA-OAEP', {
        md: forge.md.sha256.create()
    }));
    const hashedPwd = forge.md.sha256.create().update(pwd).digest().toHex();
    const nonce = Buffer.from(Date.now().toString()).toString('base64');
    const cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({iv: forge.util.createBuffer(Buffer.from(nonce.slice(-12)).toString('binary'))});
    cipher.update(forge.util.createBuffer(Buffer.from(hashedPwd).toString('binary')));
    cipher.finish()
    const encPassword = forge.util.encode64(cipher.output.getBytes() + cipher.mode.tag.getBytes())
    // console.log(encKey, encPassword, nonce, pwd);
    return encKey + "." + encPassword + "." + nonce;
} 