import validator from "email-validator";

export function EmailValidator(email: string) {
    return validator.validate(email);
}