export const mockDb = {
    // Keys
    KEYS: {
        USERS: 'mock_users',
        DEPOSITS: 'mock_deposits',
        WITHDRAWALS: 'mock_withdrawals',
        TICKETS: 'mock_tickets',
        PLANS: 'mock_plans',
        NOTIFICATIONS: 'mock_notifications'
    },

    // Helpers
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Users
    getUsers() {
        return this.get(this.KEYS.USERS);
    },

    addUser(user) {
        const users = this.getUsers();
        if (!users.find(u => u.email === user.email)) {
            users.push(user);
            this.set(this.KEYS.USERS, users);
        }
    },

    updateUser(updatedUser) {
        const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
        this.set(this.KEYS.USERS, users);
    },

    // Deposits
    getDeposits() {
        return this.get(this.KEYS.DEPOSITS);
    },

    addDeposit(deposit) {
        const deposits = this.getDeposits();
        deposits.unshift(deposit); // Newest first
        this.set(this.KEYS.DEPOSITS, deposits);
    },

    updateDeposit(id, updates) {
        const deposits = this.getDeposits().map(d => d.id === id ? { ...d, ...updates } : d);
        this.set(this.KEYS.DEPOSITS, deposits);
    },

    // Withdrawals
    getWithdrawals() {
        return this.get(this.KEYS.WITHDRAWALS);
    },

    addWithdrawal(withdrawal) {
        const withdrawals = this.getWithdrawals();
        withdrawals.unshift(withdrawal);
        this.set(this.KEYS.WITHDRAWALS, withdrawals);
    },

    // Tickets
    getTickets() {
        return this.get(this.KEYS.TICKETS);
    },

    addTicket(ticket) {
        const tickets = this.getTickets();
        tickets.unshift(ticket);
        this.set(this.KEYS.TICKETS, tickets);
    },

    updateTicket(id, updates) {
        const tickets = this.getTickets().map(t => t.id === id ? { ...t, ...updates } : t);
        this.set(this.KEYS.TICKETS, tickets);
    },

    // Notifications
    getNotifications() {
        return this.get(this.KEYS.NOTIFICATIONS);
    },

    addNotification(notification) {
        const notifications = this.getNotifications();
        notifications.unshift({
            id: 'notif_' + Date.now(),
            date: new Date().toISOString(),
            read: false,
            ...notification
        });
        this.set(this.KEYS.NOTIFICATIONS, notifications);
    },

    markNotifRead(id) {
        const notifications = this.getNotifications().map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        this.set(this.KEYS.NOTIFICATIONS, notifications);
    },
    
    // Plans
    getPlans() {
        return this.get(this.KEYS.PLANS).length > 0 ? this.get(this.KEYS.PLANS) : require('../mock/plans').INVESTMENT_PLANS;
    },

    // Initialize with mock data if empty
    initialize() {
        if (this.get(this.KEYS.DEPOSITS).length === 0) {
            // Add some mock deposits for the admin to see initially
            this.addDeposit({
                id: 'dep_mock_1',
                userId: 'u_1',
                user: 'Demo User',
                email: 'demo@example.com',
                amount: 500,
                coin: 'BTC',
                status: 'Pending',
                date: new Date().toISOString(),
                planId: 'p1'
            });
        }
        if (this.get(this.KEYS.TICKETS).length === 0) {
             this.addTicket({
                id: 't_mock_1',
                userId: 'u_1',
                user: 'Demo User',
                email: 'demo@example.com',
                subject: 'Welcome Ticket',
                message: 'This is a test ticket.',
                status: 'Open',
                date: new Date().toISOString()
            });
        }
    }
};

// Auto-initialize on import (for now)
mockDb.initialize();
