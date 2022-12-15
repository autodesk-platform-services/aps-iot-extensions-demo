let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_SAMPLE_ENVIRONMENT, APS_MAXIMUM_SENSOR_NUMBER, PORT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}

APS_SAMPLE_ENVIRONMENT = APS_SAMPLE_ENVIRONMENT || 'Demonstration';
PORT = PORT || 3000;
APS_MAXIMUM_SENSOR_NUMBER = APS_MAXIMUM_SENSOR_NUMBER || 8; //!<<< Maximum sensor number for demo mode

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_SAMPLE_ENVIRONMENT,
    APS_MAXIMUM_SENSOR_NUMBER,
    PORT
};
