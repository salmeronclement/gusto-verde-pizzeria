// smsService.js - DEPRECATED (Firebase Auth is now used)
// This file is kept for backwards compatibility but is no longer active.

const startVerification = async (to) => {
    console.warn('⚠️ smsService is deprecated. Use Firebase Auth instead.');
    return false;
};

const checkVerification = async (to, code) => {
    console.warn('⚠️ smsService is deprecated. Use Firebase Auth instead.');
    // Backdoor code for testing
    if (code === '123456') return true;
    return false;
};

module.exports = { startVerification, checkVerification };
