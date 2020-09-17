const pcsDatas = require('../controllers/pcsData.server.controller');
module.exports = function(app) {

    app.route('/api/sensors/pcsData').post(pcsDatas.getPcsDatas);
    app.route('/api/sensors/getMinuteData').post(pcsDatas.getMinutesData);
    app.route('/api/sensors/sendBleLogs').post(pcsDatas.sendBleLogs);
    app.route('/api/sensors/resolveBleLogs').post(pcsDatas.resolveBleLogs);
    app.route('/api/sensors/getBleLogs').get(pcsDatas.getBleLogs);
    app.route('/api/sensors/getBleLogsByRmName').post(pcsDatas.getBleLogsByRmName);
    app.route('/api/sensors/sendMails').post(pcsDatas.sendMails);
    app.route('/api/sensors/getBleLogsForMails').post(pcsDatas.getBleLogsForMails);
    app.route('/api/sensors/getBleSubject').get(pcsDatas.getBleSubject);
    app.route('/api/sensors/gethealthcount').post(pcsDatas.gethealthcount);
    app.route('/api/sensors/getPcsCount').post(pcsDatas.getPcsCount);
    app.route('/api/sensors/getLiveData').post(pcsDatas.getLiveData);
    app.route('/api/sensors/scheduleMails').get(pcsDatas.scheduleMails);
}