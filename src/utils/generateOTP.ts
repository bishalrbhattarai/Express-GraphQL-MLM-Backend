export const generateOTP = () => {
  const randomNum = Math.random() * 900000;
  return Math.floor(100000 + randomNum);
};
