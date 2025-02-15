export const isCodeExpired = (createdAt:Date, expirationMinutes = 10) => {
    const expirationTime = new Date(createdAt);
    expirationTime.setMinutes(expirationTime.getMinutes() + expirationMinutes);
    return new Date() > expirationTime;
};