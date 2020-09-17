const pcsDatas = require('../controllers/singJapan.server.controller');
module.exports = function(app) { 

    app.route('/api/sensors/barlcayssj/pcsData').post(pcsDatas.getPcsDatas);
    app.route('/api/sensors/barlcayssj/getMinuteData').post(pcsDatas.getMinutesData);
    app.route('/api/sensors/barlcayssj/sendBleLogs').post(pcsDatas.sendBleLogs);
    app.route('/api/sensors/barlcayssj/getBleLogs').get(pcsDatas.getBleLogs);
    app.route('/api/sensors/barlcayssj/getBleLogsByRmName').post(pcsDatas.getBleLogsByRmName);
    app.route('/api/sensors/barlcayssj/sendMails').post(pcsDatas.sendMails);
    app.route('/api/sensors/barlcayssj/getBleLogsForMails').post(pcsDatas.getBleLogsForMails);
    app.route('/api/sensors/barlcayssj/getBleSubject').get(pcsDatas.getBleSubject);
    app.route('/api/sensors/barlcayssj/gethealthcount').post(pcsDatas.gethealthcount);
}