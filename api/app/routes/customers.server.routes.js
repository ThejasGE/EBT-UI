const customers = require('../controllers/customer.server.controller');

module.exports = function(app) {

    app.route('/api/customers/all').get(customers.getAllCustomers);
    app.route('/api/customers/getCustomer/:cid').get(customers.getCustomer);
    app.route('/api/customers/updateServices').post(customers.updateServices);
    app.route('/api/customers/createCustomer').post(customers.createCustomer);
    app.route('/api/customers/deleteCustomer').post(customers.deleteCustomer);
    app.route('/api/customers/getCustomersStatus').get(customers.getCustomersStatus);
    app.route('/api/customers/selectedServices/:cid').get(customers.selectedServices);
    app.route('/api/customers/getDomainList').get(customers.getDomainList);

}